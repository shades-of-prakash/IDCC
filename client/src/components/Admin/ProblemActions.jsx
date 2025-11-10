import React, { useState } from "react";
import { Plus, Trash, Check, Eye } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import { toast } from "sonner";

const ProblemActions = ({ problem, contestId, openModal, showEye }) => {
  console.log(showEye, "false");
  const queryClient = useQueryClient();

  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);

  const addMutation = useMutation({
    mutationFn: async () =>
      apiFetch(`/api/contest/admin/finalized`, {
        method: "POST",
        body: { contestId, problemId: problem._id },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries(["contest-all-problems-to-add", contestId]),
    onError: (err) => toast.error(err?.message || "Failed to add problem"),
  });

  const removeMutation = useMutation({
    mutationFn: async () =>
      apiFetch(`/api/contest/admin/unfinalized`, {
        method: "POST",
        body: { contestId, problemId: problem._id },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries(["contest-all-problems-to-add", contestId]),
    onError: (err) => toast.error(err?.message || "Failed to remove problem"),
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

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleAdd}
        disabled={problem.status === "finalized" || adding}
        className={`flex items-center justify-center gap-1 rounded-s-md border border-gray-300 border-r-0 text-black px-4 py-2 text-sm transition
          hover:bg-green-50 hover:text-green-900
          ${
            problem.status === "finalized"
              ? "bg-green-50 text-green-900 cursor-not-allowed opacity-90"
              : ""
          }
          w-[90px]`}
      >
        {adding ? (
          <div className="w-4 h-4 border-1 border-black border-t-transparent rounded-full animate-spin"></div>
        ) : problem.status === "finalized" ? (
          <Check size={16} />
        ) : (
          <Plus size={16} />
        )}
        <span className="font-medium m-0">
          {problem.status === "finalized" ? "Added" : "Add"}
        </span>
      </button>

      <button
        onClick={handleRemove}
        disabled={removing}
        className={`w-[120px] flex items-center justify-center gap-2 ${!showEye ? "border  rounded-e-md border-gray-300" : "border border-gray-300 border-r-0"} hover:bg-red-50 hover:text-red-900 text-black px-3 py-2 text-sm transition ${
          removing ? "cursor-not-allowed opacity-80" : ""
        }`}
      >
        {removing ? (
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Trash size={16} />
        )}
        <span className="font-medium m-0">Remove</span>
      </button>

      {showEye && (
        <button
          onClick={() => {
            openModal("delete", problem);
          }}
          className="flex items-center justify-center gap-1 rounded-e-md border border-gray-300 hover:bg-neutral-200 text-black px-3 py-2.5 text-sm transition"
        >
          <Eye size={16} />
        </button>
      )}
    </div>
  );
};

export default ProblemActions;
