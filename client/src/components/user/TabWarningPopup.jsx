import { AlertTriangle, X } from "lucide-react";

const TabWarningPopup = ({ visible, count = 1, maxWarnings = 3, onClose }) => {
    if (!visible) return null;

    // Calculate percentage, ensure it's never 0 to show minimum progress visually
    const percentage = Math.min(100, Math.max(10, (count / maxWarnings) * 100));
    // Determine the progress bar color based on warning level
    const progressColor =
        count === maxWarnings ? "bg-red-500" : "bg-orange-500";

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-100 p-6 relative transform transition-all scale-100 hover:scale-[1.01] duration-300 ease-out">
                {/* Close button - Styled for higher contrast and easier tap target */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 text-sm hover:bg-neutral-100 transition-colors"
                    aria-label="Close warning"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon + Title - More emphasis on the icon and clear separation from text */}
                <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100 mb-4">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800">
                        Tab Switch Detected!
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Please pay attention to the warning below.
                    </p>
                </div>

                {/* Message box - Enhanced visual separation and clarity */}
                <div className="mb-6 rounded-lg border border-orange-300 bg-orange-50 p-4 text-sm text-neutral-800 leading-relaxed">
                    <p className="mb-2 font-medium">
                        You have received a warning for switching tabs during
                        the quiz.
                    </p>

                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            This is{" "}
                            <span className="font-semibold text-sm">
                                warning {count} of {maxWarnings}
                            </span>
                        </li>
                        <li>
                            Reaching{" "}
                            <span className="font-semibold text-sm">
                                {maxWarnings} warnings
                            </span>{" "}
                            will cause your quiz to{" "}
                            <span className="mr-2 font-bold text-red-600">
                                auto-submit
                            </span>
                            immediately.
                        </li>
                        <li>
                            <span className="font-semibold mr-1">
                                Action Required:
                            </span>
                            Remain on this quiz window to complete your
                            submission.
                        </li>
                    </ul>
                </div>

                {/* Warning progress - Clearer labels and progressive color change */}
                <div className="w-full mb-6">
                    <div className="flex justify-between text-xs uppercase tracking-wider text-neutral-600 mb-2 font-medium">
                        <span>Warning Level</span>
                        <span
                            className={
                                count === maxWarnings
                                    ? "text-red-500 font-bold"
                                    : "text-orange-500"
                            }
                        >
                            {count} / {maxWarnings}
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                            className={`h-full ${progressColor} rounded-full transition-[width] duration-300 ease-out`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                {/* Button - More prominence and clear call-to-action */}
                <button
                    onClick={onClose}
                    className="w-full inline-flex items-center justify-center rounded-lg h-12 bg-orange-600 hover:bg-orange-700 text-white text-base font-bold shadow-lg shadow-orange-200/50 transition-all duration-200 ease-in-out transform hover:scale-[1.01]"
                >
                    I Understand, Continue Quiz
                </button>

                {/* Helper text - Subtle positioning at the bottom */}
                <p className="mt-4 text-xs text-center text-neutral-500">
                    *Tip: Avoid minimizing the window or using other
                    applications while the quiz is running.
                </p>
            </div>
        </div>
    );
};

export default TabWarningPopup;
