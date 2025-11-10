import { useEffect, useRef } from "react";
import { Timer as TimerIcon } from "lucide-react";
import { useSession } from "../../contexts/SessionContext";

const SYNC_INTERVAL_MS = 10000;

const Timer = () => {
  const {
    session,
    remainingTime,
    setRemainingTime,
    updateElapsedTime,
    formatTime,
  } = useSession();

  const startSyncRef = useRef(Date.now());
  const baseElapsedRef = useRef(0);

  useEffect(() => {
    if (!session || !session.contest || remainingTime <= 0) return;

    let tickTimer;
    let syncTimer;

    // Initialize tracking
    baseElapsedRef.current =
      session.contest.durationMinutes * 60000 - remainingTime;
    startSyncRef.current = Date.now();

    // Local countdown
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

    // Periodic sync (every 10s)
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
