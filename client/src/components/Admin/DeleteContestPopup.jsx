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
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[99999] p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                    <AlertTriangle className="text-red-500 w-8 h-8 mr-3" />
                    <h2 className="text-2xl font-bold text-red-600">
                        Permanent Deletion
                    </h2>
                </div>

                {/* Warning Message */}
                <p className="text-gray-700 my-4 text-center">
                    You are about to permanently delete the contest{" "}
                    <span className="font-extrabold text-red-600 break-all">
                        "{contestName}"
                    </span>
                    . This action cannot be undone.
                </p>

                <p className="text-sm text-gray-500 mb-4 text-center">
                    To confirm, please type the contest name exactly as shown
                    below:
                </p>

                {/* Confirmation String Display */}
                <div className="bg-gray-100 border border-gray-300 p-3 rounded-lg font-mono text-center mb-4 select-all text-sm break-all">
                    {contestName}
                </div>

                {/* Input Field */}
                <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={`Type "${contestName}" to confirm`}
                    className={`w-full p-3 border-2 rounded-lg text-sm transition-colors focus:outline-none ${
                        isConfirmed
                            ? "border-green-500 focus:border-green-600"
                            : "border-gray-300 focus:border-red-400"
                    }`}
                    autoFocus
                />

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 font-medium"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={!isConfirmed || isDeleting}
                        className={`px-5 py-2 rounded-lg font-medium transition duration-150 ${
                            !isConfirmed || isDeleting
                                ? "bg-red-300 text-white cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
                        }`}
                    >
                        {isDeleting ? "Deleting..." : "Delete Contest"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteContestPopup;
