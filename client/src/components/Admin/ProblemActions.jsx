import React, { useState } from "react";
import { Plus, Trash, Check, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { apiFetch } from "../../utils/fetch";
import { toast } from "sonner";

const ProblemActions = ({ problem, contestId, showEye }) => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState(false);

    const addMutation = useMutation({
        mutationFn: async () =>
            apiFetch(`/api/contest/admin/finalized`, {
                method: "POST",
                body: { contestId, problemId: problem._id },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries([
                "contest-all-problems-to-add",
                contestId,
            ]),
        onError: (err) => toast.error(err?.message || "Failed to add problem"),
    });

    const removeMutation = useMutation({
        mutationFn: async () =>
            apiFetch(`/api/contest/admin/unfinalized`, {
                method: "POST",
                body: { contestId, problemId: problem._id },
            }),
        onSuccess: () =>
            queryClient.invalidateQueries([
                "contest-all-problems-to-add",
                contestId,
            ]),
        onError: (err) =>
            toast.error(err?.message || "Failed to remove problem"),
    });

    const handleAdd = async (e) => {
        e.stopPropagation();
        setAdding(true);
        try {
            await addMutation.mutateAsync();
            problem.status = "finalized";
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (e) => {
        e.stopPropagation();
        setRemoving(true);
        try {
            await removeMutation.mutateAsync();
            problem.status = "pending";
        } finally {
            setRemoving(false);
        }
    };

    const handlePreview = (e) => {
        e.stopPropagation();
        navigate(`/admin/preview/${problem._id}`);
    };

    return (
        <div className="flex items-center justify-center">
            {/* Add / Added */}
            <button
                onClick={handleAdd}
                disabled={problem.status === "finalized" || adding}
                className={`flex items-center justify-center gap-1 rounded-s-md border border-gray-300 border-r-0 px-4 py-2 text-sm transition
                hover:bg-green-50 hover:text-green-900
                ${
                    problem.status === "finalized"
                        ? "bg-green-50 text-green-900 cursor-not-allowed opacity-90"
                        : ""
                }
                w-[90px]`}
            >
                {adding ? (
                    <div className="w-4 h-4 border border-black border-t-transparent rounded-full animate-spin" />
                ) : problem.status === "finalized" ? (
                    <Check size={16} />
                ) : (
                    <Plus size={16} />
                )}
                <span className="font-medium">
                    {problem.status === "finalized" ? "Added" : "Add"}
                </span>
            </button>

            {/* Remove */}
            <button
                onClick={handleRemove}
                disabled={removing}
                className={`w-[120px] flex items-center justify-center gap-2 ${
                    !showEye
                        ? "border rounded-e-md border-gray-300"
                        : "border border-gray-300 border-r-0"
                } hover:bg-red-50 hover:text-red-900 px-3 py-2 text-sm transition ${
                    removing ? "cursor-not-allowed opacity-80" : ""
                }`}
            >
                {removing ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Trash size={16} />
                )}
                <span className="font-medium">Remove</span>
            </button>

            {/* Preview */}
            {showEye && (
                <button
                    onClick={handlePreview}
                    className="flex items-center justify-center rounded-e-md border border-gray-300 hover:bg-neutral-200 px-3 py-2.5 text-sm transition"
                >
                    <Eye size={16} />
                </button>
            )}
        </div>
    );
};

export default ProblemActions;
