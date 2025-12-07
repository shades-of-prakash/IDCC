// ./TabWarningPopup.jsx
import { AlertTriangle } from "lucide-react";

// DEFAULT VALUES so the UI never breaks
const TabWarningPopup = ({
    visible = false,
    count = 1,
    maxWarnings = 3,
    onClose = () => {},
}) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 md:px-10 md:py-8 w-[90%] max-w-lg animate-fadeIn">
                {/* Icon + title */}
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-orange-500" />
                    </div>

                    <h2 className="text-2xl font-semibold text-orange-500">
                        Warning
                    </h2>
                </div>

                {/* Message box */}
                <div className="mt-5 rounded-lg border border-[#F5D58A] bg-[#FFF9E6] px-4 py-3 text-sm text-neutral-800 leading-relaxed">
                    <p>
                        You have switched tabs{" "}
                        <span className="font-semibold">
                            Warning {count} out of {maxWarnings}
                        </span>
                        .
                    </p>

                    <p className="mt-1">
                        If it happens again, your quiz will be{" "}
                        <span className="font-semibold text-red-600">
                            auto-submitted
                        </span>
                        .
                    </p>
                </div>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full inline-flex items-center justify-center rounded-full h-11 bg-[#FFA500] hover:bg-[#ff9300] text-white text-sm font-semibold shadow-md transition-colors"
                >
                    I Understand
                </button>
            </div>
        </div>
    );
};

export default TabWarningPopup;
