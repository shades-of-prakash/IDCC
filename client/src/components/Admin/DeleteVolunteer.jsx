import React, { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";

const DeleteVolunteerPopup = ({ user, onClose }) => {
  const [confirmUsername, setConfirmUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setError("");
    if (confirmUsername !== user.username) {
      setError("Username does not match!");
      return;
    }

    try {
      setLoading(true);
      await apiFetch("/api/admin/auth/delete/volunteer", {
        method: "DELETE",
        body: { username: user.username },
      });

      toast.success("Volunteer deleted successfully");
      queryClient.invalidateQueries(["volunteers"]);
      onClose();
    } catch (err) {
      setError(err.message || "Server error while deleting volunteer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg p-4 w-96">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p className="mb-2">
          To delete <strong>{user.username}</strong>, type the username below:
        </p>
        <input
          type="text"
          value={confirmUsername}
          onChange={(e) => setConfirmUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
          placeholder="Enter username"
          disabled={loading}
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteVolunteerPopup;
