import React, { useState, useContext } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import { AuthContext } from "../../contexts/adminAuthContext";
import { Info } from "lucide-react";
const DeleteVolunteerPopup = ({ user, onClose }) => {
  const [confirmUsername, setConfirmUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { admin } = useContext(AuthContext);

  const getUrl = () => {
    if (admin?.role === "admin") return "/api/admin/auth/delete/vorc";
    return "/api/admin/auth/delete/volunteer";
  };

  const handleDelete = async () => {
    setError("");

    if (confirmUsername !== user.username) {
      setError("Username does not match!");
      return;
    }

    try {
      setLoading(true);
      await apiFetch(getUrl(), {
        method: "DELETE",
        body: { username: user.username },
      });

      toast.success(
        `${user.role === "coordinator" ? "Coordinator" : "Volunteer"} deleted successfully`,
      );

      if (admin?.role === "admin") {
        queryClient.invalidateQueries(["vorc"]);
      } else {
        queryClient.invalidateQueries(["volunteers"]);
      }

      onClose();
    } catch (err) {
      setError(err.message || "Server error while deleting user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg p-4 w-[450px]">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>

        <div className="flex  gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2 mb-3">
          <Info />
          Deleting this user will also permanently delete all problems they have
          added.
        </div>

        <p className="mb-2">
          To delete <strong>{user.username}</strong>, type the username below:
        </p>

        <input
          type="text"
          value={confirmUsername}
          onChange={(e) => setConfirmUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 mt-1 text-sm"
          placeholder="Enter username"
          disabled={loading}
        />

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm"
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
