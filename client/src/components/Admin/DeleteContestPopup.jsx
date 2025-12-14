import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

const DeleteContestPopup = ({
    isOpen,
    contest,
    onClose,
    onConfirmDelete,
    isDeleting,
}) => {
    const [confirmationText, setConfirmationText] = useState("");

    if (!isOpen || !contest) return null;

    const contestName = contest?.name || "this contest";
    const isConfirmed = confirmationText === contestName;

    const handleConfirm = () => {
        if (!isConfirmed || isDeleting) return;
        onConfirmDelete();
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 transform transition-all duration-200 scale-100">
                {/* Header (unchanged) */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 border border-red-100">
                            <AlertTriangle className="text-red-500 w-6 h-6" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-red-600">
                            Danger Zone
                        </span>
                        <h2 className="text-xl font-semibold text-gray-900 text-center">
                            Permanently delete contest
                        </h2>
                        <p className="text-xs text-gray-500 text-center">
                            This action cannot be undone. All associated data
                            will be lost.
                        </p>
                    </div>
                </div>

                {/* Body (updated to GitHub-style confirmation) */}
                <div className="px-6 pt-4 pb-2 space-y-3">
                    {/* <p className="text-sm text-gray-700 text-center">
                        You are about to permanently delete this contest.
                    </p>*/}

                    <p className="text-sm text-gray-700">
                        To confirm, type{" "}
                        <span className="font-mono font-semibold">
                            "{contestName}"
                        </span>{" "}
                        in the box below:
                    </p>

                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={contestName}
                        className={`w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors focus:outline-none ${
                            isConfirmed
                                ? "border-green-500 focus:border-green-600"
                                : "border-gray-300 focus:border-red-400"
                        }`}
                        autoFocus
                    />

                    <p className="text-[11px] text-gray-400">
                        The contest will only be deleted if the name matches
                        exactly, including any spaces or symbols.
                    </p>
                </div>

                {/* Footer / Actions (unchanged) */}
                <div className="px-6 pb-5 pt-3 mt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-gray-400">
                        You can{" "}
                        <span className="font-medium text-gray-500">
                            Cancel
                        </span>{" "}
                        to keep this contest.
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleConfirm}
                            disabled={!isConfirmed || isDeleting}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                !isConfirmed || isDeleting
                                    ? "bg-red-300 text-white cursor-not-allowed"
                                    : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
                            }`}
                        >
                            {isDeleting ? "Deleting..." : "Delete contest"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteContestPopup;
