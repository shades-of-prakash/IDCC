import React from "react";
import { Loader2 } from "lucide-react";

const DeleteTestcaseModal = ({ open, onCancel, onConfirm, isPending }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-4 rounded-md">
                <h4 className="font-semibold">Delete testcase?</h4>

                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onCancel}>Cancel</button>
                    <button onClick={onConfirm} disabled={isPending}>
                        {isPending && (
                            <Loader2 size={14} className="animate-spin" />
                        )}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteTestcaseModal;
