import React, { useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../../utils/fetch";
import { toast } from "sonner";
import CustomSelect from "../../components/CustomSelect";
import { useContests } from "../../contexts/ContestContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CreateProblemPopup = ({ open, onClose, adminId }) => {
  const [form, setForm] = useState({
    name: "",
    points: "",
    contest: null,
  });

  const [errorMessage, setErrorMessage] = useState("");

  const { name, points, contest } = form;
  const { value: contestId } = contest || {};

  const queryClient = useQueryClient();
  const { data: contests = [], isLoading, isError } = useContests();

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createProblemMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`/api/contest/admin/problem/create`, {
        method: "POST",
        body: {
          submittedBy: adminId,
          name,
          points: Number(points),
          contestId,
        },
      });
    },
    onSuccess: () => {
      toast.success("Problem created!");
      setErrorMessage("");
      queryClient.invalidateQueries(["problemsByAdmin", adminId]);
      onClose();
      setForm({ name: "", points: "", contest: null });
    },
    onError: (error) => {
      // Show backend error (e.g. "Cannot add problems to a running contest")
      setErrorMessage(error?.message || "Failed to create problem");
    },
  });

  if (!open) return null;

  const handleCreate = () => {
    if (!name.trim() || !points || !contest) {
      setErrorMessage("All fields are required");
      return;
    }
    setErrorMessage("");
    createProblemMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-lg shadow-lg p-4 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Problem</h2>
          <X
            size={18}
            className="cursor-pointer text-gray-500 hover:text-black"
            onClick={onClose}
          />
        </div>

        {/* Inline error box */}
        {errorMessage && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Problem Name</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
              value={name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="Enter problem name"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Points</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
              value={points}
              onChange={(e) => updateForm("points", e.target.value)}
              placeholder="Enter points"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Contest</label>
            <CustomSelect
              options={contests.map((c) => ({
                label: c.name,
                value: c._id,
              }))}
              value={contest}
              onChange={(val) => updateForm("contest", val)}
              placeholder="Select a contest"
              disabled={isLoading || isError}
              loading={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end mt-5 gap-2">
          <button
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={createProblemMutation.isPending}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:bg-gray-500"
          >
            {createProblemMutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProblemPopup;
