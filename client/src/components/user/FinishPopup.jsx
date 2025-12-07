import { Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useFinish } from "../../contexts/finishContext";

const FinishPopup = ({
    isOpen,
    onClose,
    problems = [],
    setActive,
    contestId,
    submittedQuestions = [],
    lastSubmittedAt = {},
}) => {
    const firstUnsubmittedRef = useRef(null);

    const [filledSegments, setFilledSegments] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);

    const totalProblems = problems.length;
    const submittedSet = new Set(submittedQuestions);
    const submittedCount = problems.filter((p) =>
        submittedSet.has(p.id),
    ).length;

    const completionPercent =
        totalProblems === 0
            ? 0
            : Math.round((submittedCount / totalProblems) * 100);

    const sortedProblems = [...problems].sort((a, b) => {
        const aSub = submittedSet.has(a.id);
        const bSub = submittedSet.has(b.id);
        return aSub === bSub ? 0 : aSub ? -1 : 1;
    });

    const firstUnsubmittedIndex = sortedProblems.findIndex(
        (p) => !submittedSet.has(p.id),
    );

    useEffect(() => {
        if (
            isOpen &&
            firstUnsubmittedIndex !== -1 &&
            firstUnsubmittedRef.current
        ) {
            firstUnsubmittedRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [isOpen, firstUnsubmittedIndex]);

    const { hasFinishedRef } = useFinish();

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
            console.error(
                "Failed to clear code drafts from localStorage:",
                err,
            );
        }
    };

    const handleFinish = async () => {
        if (hasFinishedRef.current) return;
        hasFinishedRef.current = true;

        if (isFinishing) return;

        // 🧹 Clear all code:* items when finishing
        clearCodeDrafts();

        try {
            setIsFinishing(true);

            await fetch("/api/user/contest/finish", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // just in case, fallback if contestId is missing
            if (contestId) {
                window.location.href = `/thankyou/${contestId}`;
            } else {
                window.location.href = `/thankyou`;
            }
        } catch (err) {
            console.error(err);
            window.location.href = "/login";
        } finally {
            setIsFinishing(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handler = (e) => {
            if (isFinishing) return;
            if (e.key === "Escape") onClose();
            if (e.key === "Enter") handleFinish();
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, isFinishing, onClose]);

    const totalSegments = 40;
    const targetFilledSegments = Math.round(
        (completionPercent / 100) * totalSegments,
    );

    useEffect(() => {
        if (!isOpen) {
            setFilledSegments(0);
            return;
        }

        setFilledSegments(0);
        if (targetFilledSegments === 0) return;

        let current = 0;
        const id = setInterval(() => {
            current += 1;
            setFilledSegments((prev) =>
                prev >= targetFilledSegments ? prev : current,
            );

            if (current >= targetFilledSegments) clearInterval(id);
        }, 20);

        return () => clearInterval(id);
    }, [isOpen, targetFilledSegments]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => {
                if (isFinishing) return;
                onClose();
            }}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Are you done!
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Please review before clicking the finish button.
                        </p>
                    </div>
                    <div className="border border-gray-300 font-bold px-3 py-1 rounded-md text-xl text-green-600">
                        {completionPercent}%
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 mb-6">
                    <div className="flex gap-1 h-8 w-full rounded-full p-[2px]">
                        {Array.from({ length: totalSegments }).map((_, i) => {
                            const isFilled = i < filledSegments;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-all duration-150 ${
                                        isFilled
                                            ? "bg-green-600"
                                            : "bg-gray-200"
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-2 mt-4 text-xs text-gray-700">
                    <span>
                        Submitted:{" "}
                        <span className="text-lg font-semibold text-green-600">
                            {submittedCount}
                        </span>
                    </span>
                    <span>
                        Not Submitted:{" "}
                        <span className="text-lg font-semibold text-red-600">
                            {totalProblems - submittedCount}
                        </span>
                    </span>
                </div>

                <ul className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {sortedProblems.map((problem, index) => {
                        const submitted = submittedSet.has(problem.id);
                        const isFirst = index === firstUnsubmittedIndex;

                        const timeValue = lastSubmittedAt[problem.id];
                        const timeStr = timeValue
                            ? new Date(timeValue).toLocaleTimeString()
                            : null;

                        return (
                            <li
                                key={problem.id}
                                ref={isFirst ? firstUnsubmittedRef : null}
                                onClick={() => {
                                    if (isFinishing) return;
                                    const i = problems.findIndex(
                                        (p) => p.id === problem.id,
                                    );
                                    if (i !== -1) setActive(i);
                                    onClose();
                                }}
                                className="flex items-center justify-between rounded-lg p-3 cursor-pointer border border-gray-300 hover:bg-gray-50"
                            >
                                <div>
                                    <div className="font-medium text-gray-800">
                                        {problem.name}
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                        {timeStr
                                            ? `Last submitted at ${timeStr}`
                                            : "No submission yet"}
                                    </div>
                                </div>

                                <div
                                    className={`text-[11px] px-2 py-1 rounded-full inline-flex gap-1 items-center bg-white shadow-sm border font-medium ${
                                        submitted
                                            ? "border-green-300 text-green-700"
                                            : "border-red-300 text-red-700"
                                    }`}
                                >
                                    {submitted ? (
                                        <>
                                            <Check size={13} />
                                            Submitted
                                        </>
                                    ) : (
                                        <>⚠ Not Submitted</>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isFinishing}
                        className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleFinish}
                        disabled={isFinishing}
                        className="px-4 py-2 text-sm rounded-lg bg-red-900 text-white disabled:opacity-60 inline-flex items-center gap-2"
                    >
                        {isFinishing && (
                            <span className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                        )}
                        {isFinishing ? "Finishing..." : "Finish Contest"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinishPopup;
