import React, { useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../contexts/adminAuthContext";
import { apiFetch } from "../utils/fetch";
import { Ellipsis, SquarePlus, X } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import Test from "../assets/naruto_empty.jpg";
import InfoCard from "../components/InfoCard";
import Loader from "../components/Loader";
import ZoroSomethingWentWrong from "../assets/zoro_error.jpg";
const fetchProblemsByAdmin = async (adminId) => {
  if (!adminId) return [];
  const data = await apiFetch(
    `/api/contest/admin/all/problems?adminId=${adminId}`,
  );
  return data || [];
};

const CVDashboard = () => {
  const { admin } = useContext(AuthContext);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    problem: null,
  });
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: problems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["problemsByAdmin", admin?.id],
    queryFn: () => fetchProblemsByAdmin(admin.id),
    enabled: !!admin,
  });

  if (!admin) return <div>Unauthorized</div>;
  if (isLoading) return <Loader text="Loading Problems" />;
  if (error)
    return (
      <InfoCard
        imgUrl={ZoroSomethingWentWrong}
        title="Something went wrong!"
        description="No problems yet! Click the button below to add some."
      />
    );

  const handleEdit = (problem) => {
    navigate("/admin/add-problem", { state: { problem } });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.problem) return;

    try {
      setDeleting(true);
      await apiFetch(
        `/api/contest/admin/problem/delete/${deleteModal.problem._id}`,
        { method: "DELETE" },
      );

      queryClient.invalidateQueries(["problemsByAdmin", admin.id]);
      toast.success(`Deleted "${deleteModal.problem.name}" successfully!`);

      setDeleteModal({ open: false, problem: null });
      setConfirmText("");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete problem.");
    } finally {
      setDeleting(false);
    }
  };

  const openDeletePopup = (problem) => {
    setDeleteModal({ open: true, problem });
    setConfirmText("");
  };

  const navigateToAddProblem = () => navigate("/admin/add-problem");

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="h-16 px-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex h-full flex-col justify-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Overview of all problems submitted by you
          </p>
        </div>
        <div>
          <button
            onClick={navigateToAddProblem}
            className="px-4 py-2 rounded text-white bg-black flex items-center gap-2"
          >
            <SquarePlus size={16} />
            Add Problem
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full px-2 h-[calc(100%-4rem)] overflow-x-auto">
        {problems.length > 0 ? (
          <table className="rounded-md min-w-full border border-gray-300 mt-2 divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Problem Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contest Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Conducted By
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 relative">
              {problems.map((problem, index) => (
                <tr key={problem._id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {problem.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {problem.points}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-700">
                    {problem.contestName || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {problem.conductedBy || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === problem._id ? null : problem._id,
                        )
                      }
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Ellipsis className="w-5 h-5 text-gray-500" />
                    </button>

                    {openMenuId === problem._id && (
                      <div className="absolute right-4 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <button
                          onClick={() => {
                            handleEdit(problem);
                            setOpenMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            openDeletePopup(problem);
                            setOpenMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <InfoCard
            imgUrl={Test}
            title="Nothing Found"
            description="No problems yet! Click the button below to add some."
            buttonText="Add Problem"
            navigateTo="/admin/add-problem"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-4 w-96 shadow-lg">
            <div className="flex justify-between mb-4 items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Deletion
              </h2>
              <button
                onClick={() => setDeleteModal({ open: false, problem: null })}
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              To delete <strong>{deleteModal.problem.name}</strong>, type{" "}
              <span className="font-mono">delete</span> below:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:border-blue-300"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal({ open: false, problem: null })}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={confirmText.toLowerCase() !== "delete" || deleting}
                className={`px-4 py-2 rounded text-white ${
                  confirmText.toLowerCase() === "delete" && !deleting
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVDashboard;
