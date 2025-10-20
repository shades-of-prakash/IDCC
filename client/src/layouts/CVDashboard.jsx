import React, { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../contexts/adminAuthContext";
import { apiFetch } from "../utils/fetch";
import { Ellipsis } from "lucide-react";
import { useNavigate } from "react-router";
const fetchProblemsByAdmin = async (adminId) => {
  if (!adminId) return [];
  const data = await apiFetch(`/api/contest/admin/all/problems?adminId=${adminId}`);
  return data || [];
};

const CVDashboard = () => {
  const { admin } = useContext(AuthContext);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  const { data: problems = [], isLoading, error } = useQuery({
    queryKey: ["problemsByAdmin", admin?.id],
    queryFn: () => fetchProblemsByAdmin(admin.id),
    enabled: !!admin,
  });

  if (!admin) return <div>Unauthorized</div>;
  if (isLoading) return <div>Loading problems...</div>;
  if (error) return <div>Failed to load problems: {error.message}</div>;

  const handleEdit = (problem) => {
    navigate("/admin/add-problem", { state: { problem } });
    // Add navigation or popup logic here
  };

  const handleDelete = (problem) => {
    console.log("Delete:", problem);
    // Add delete confirmation + API call here
  };

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="h-16 px-4 border-b border-gray-200">
        <div className="flex h-full flex-col justify-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Overview of all problems submitted by you
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="w-full px-2  h-[calc(100%-4rem)] overflow-x-auto">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {problem.contestName || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {problem.conductedBy || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === problem._id ? null : problem._id)
                    }
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Ellipsis  className="w-5 h-5 text-gray-500" />
                  </button>

                  {/* Dropdown */}
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
                          handleDelete(problem);
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

        {problems.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No problems found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CVDashboard;
