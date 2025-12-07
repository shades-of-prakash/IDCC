import { AlertTriangle } from "lucide-react";

const TabWarningPopup = ({ visible, count, maxWarnings, onClose }) => {
    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-[400px] flex flex-col items-center justify-center  bg-white h-[400px] rounded-xl shadow-md p-5">
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
                <div className="w-full mt-5 rounded-lg flex items-center justify-center flex-col border border-[#F5D58A] bg-[#FFF9E6] px-4 py-3 text-sm text-neutral-800 leading-relaxed">
                    <p>You have switched tabs during the quiz.</p>

                    <p>
                        This is{" "}
                        <span className="font-semibold">
                            Warning {count} out of {maxWarnings}
                        </span>
                        .
                    </p>

                    <p>
                        Your quiz will{" "}
                        <span className="font-semibold text-red-600 mr-1">
                            auto-submit
                        </span>
                        if it happens again.
                    </p>
                </div>
                {/* Button */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full inline-flex items-center justify-center rounded-md h-11 bg-[#FFA500] hover:bg-[#ff9300] text-white text-sm font-semibold shadow-md transition-colors"
                >
                    I Understand
                </button>
            </div>
        </div>
    );
};

export default TabWarningPopup;
