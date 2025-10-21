import React from "react";
import { useParams } from "react-router";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";

const AddProblem = () => {
  const { contestId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["contest-all-problems-to-add", contestId],
    queryFn: () =>
      apiFetch(
        `/api/contest/admin/getAllProblemsOfContest?contestId=${contestId}`,
      ),
    enabled: !!contestId,
  });

  const contestDetails = data?.contestDetails;
  const problems = data?.problems || [];

  if (isLoading)
    return <div className="p-4 text-gray-600">Loading contest problems...</div>;
  if (error)
    return <div className="p-4 text-red-600">Error: {error.message}</div>;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Contest Info */}
      {contestDetails && (
        <div className="w-full p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold">{contestDetails.name}</h2>
            <p className="text-sm text-gray-600">
              Conducted by {contestDetails.conductedBy} |{" "}
              {contestDetails.numberOfProblems} Problems | Duration:{" "}
              {contestDetails.durationMinutes} mins
            </p>
          </div>
        </div>
      )}

      {/* Problems Header */}
      <div className="w-full px-2 h-16 text-black flex items-center justify-between text-lg border-b border-gray-200">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">Problems List</span>
          <span className="text-sm text-gray-600">
            Problems added by volunteers and coordinators. Use the Add button to
            include them in this contest.
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full h-[calc(100%-7rem)] overflow-auto bg-gray-50 p-1">
        <div className="overflow-hidden rounded-md shadow-md border border-gray-200 bg-white">
          <table className="min-w-full">
            <thead className="uppercase text-xs">
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 text-left w-12">Sno</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Points</th>
                <th className="py-3 px-4 text-left">Submitted By</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.length > 0 ? (
                problems.map((problem, index) => (
                  <tr
                    key={problem._id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4">{problem.name}</td>
                    <td className="py-3 px-4">{problem.points}</td>
                    <td className="py-3 px-4">{problem.submittedBy}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          problem.status === "finalized"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {problem.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => alert(`Add clicked for ${problem.name}`)}
                        className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
                      >
                        <Plus size={16} /> Add
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No problems found for this contest.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddProblem;
