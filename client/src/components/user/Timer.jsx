import { useEffect, useRef } from "react";
import { Timer as TimerIcon } from "lucide-react";
import { useSession } from "../../contexts/SessionContext";
import { useFinish } from "../../contexts/finishContext";
import { toast } from "sonner";

const SYNC_INTERVAL_MS = 10000;

const Timer = () => {
    const {
        session,
        remainingTime,
        setRemainingTime,
        updateElapsedTime,
        formatTime,
    } = useSession();

    const { hasFinishedRef } = useFinish();

    const startSyncRef = useRef(Date.now());
    const baseElapsedRef = useRef(0);

    const hasWarnedFiveMinRef = useRef(false);

    // 🔥 Helper: remove all localStorage items starting with "code:"
    const clearCodeDrafts = () => {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("code:")) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((key) => localStorage.removeItem(key));
        } catch (err) {
            console.error("Failed clearing code drafts:", err);
        }
    };

    useEffect(() => {
        if (!session || !session.contest || remainingTime <= 0) return;

        let tickTimer;
        let syncTimer;

        baseElapsedRef.current =
            session.contest.durationMinutes * 60000 - remainingTime;
        startSyncRef.current = Date.now();

        tickTimer = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1000) {
                    clearInterval(tickTimer);
                    clearInterval(syncTimer);
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        syncTimer = setInterval(async () => {
            const now = Date.now();
            const diff = now - startSyncRef.current;
            const totalElapsed = baseElapsedRef.current + diff;

            try {
                await updateElapsedTime({
                    contestId: session.contest._id,
                    elapsedTime: totalElapsed,
                });
            } catch (err) {
                console.error("Sync failed:", err);
            }
        }, SYNC_INTERVAL_MS);

        return () => {
            clearInterval(tickTimer);
            clearInterval(syncTimer);
        };
    }, [session]);

    // 🔔 5-minute warning
    useEffect(() => {
        if (!session || !session.contest) return;

        const FIVE_MIN_MS = 5 * 60 * 1000;

        if (
            remainingTime <= FIVE_MIN_MS &&
            remainingTime > 0 &&
            !hasWarnedFiveMinRef.current
        ) {
            hasWarnedFiveMinRef.current = true;
            toast.warning("Only 5 minutes remaining! ⏳", { duration: 3000 });
        }
    }, [remainingTime, session]);

    // ⏰ Auto finish when time reaches zero
    useEffect(() => {
        if (!session || !session.contest) return;
        if (remainingTime > 0) return;
        if (hasFinishedRef.current) return;

        hasFinishedRef.current = true;

        // 🧹 Clear code snippets saved in localStorage
        clearCodeDrafts();

        const autoFinish = async () => {
            try {
                await fetch("/api/user/contest/finish", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                window.location.href = "/user/login";
            } catch (err) {
                console.error("Auto-finish failed:", err);
                window.location.href = "/login";
            }
        };

        autoFinish();
    }, [remainingTime, session, hasFinishedRef]);

    return (
        <div className="flex items-center gap-2">
            <TimerIcon className="w-5 h-5 text-red-900" />
            <span
                className={`font-medium text-sm ${
                    remainingTime < 60000 ? "text-red-700" : "text-gray-800"
                }`}
            >
                {formatTime(remainingTime)}
            </span>
        </div>
    );
};

export default Timer;
