import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { BarChart3 } from "lucide-react";
import { apiFetch } from "../../utils/fetch";

const fetchContests = () => {
    return apiFetch("/api/contest/list");
};

const Results = () => {
    const navigate = useNavigate();

    const {
        data: contests = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["contestsforresults"],
        queryFn: fetchContests,
    });

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* PAGE HEADER (non-scrolling) */}
            <div className="h-16 flex items-center w-full px-3 py-2 border-b border-gray-300 bg-white">
                <div className="flex flex-col justify-center">
                    <h1 className="text-xl font-semibold">Contest Results</h1>
                    <span className="text-sm text-gray-700">
                        View all contest performance and rankings
                    </span>
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="h-[calc(100%-4rem)]  px-3 py-2 min-h-0 flex flex-col">
                {/* Loading / Error states */}
                {isLoading && (
                    <div className="p-4 text-sm text-gray-600">
                        Loading contests...
                    </div>
                )}

                {isError && (
                    <div className="p-4 text-sm text-red-600">
                        Failed to load contests:{" "}
                        {error?.message || "Something went wrong"}
                    </div>
                )}

                {/* TABLE ONLY WHEN NOT LOADING/ERROR */}
                {!isLoading && !isError && (
                    <div className="flex-1 overflow-hidden rounded-md  bg-white flex flex-col">
                        {/* Scrollable area */}
                        <div className="flex-1 overflow-y-auto  max-h-fit border-gray-300 border rounded-md overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 border-b border-gray-300 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider w-[6%]">
                                            S.No
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                                            Contest Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                                            Conducted By
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                                            No. of Problems
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                                            Duration (mins)
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-black uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-300">
                                    {contests.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-6 text-center text-sm text-gray-500"
                                            >
                                                No contests found.
                                            </td>
                                        </tr>
                                    ) : (
                                        contests.map((contest, index) => (
                                            <tr
                                                key={contest._id}
                                                className="hover:bg-gray-50"
                                            >
                                                {/* S.No */}
                                                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-700">
                                                    {index + 1}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="font-medium text-gray-900">
                                                        {contest.name}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                    {contest.conductedBy ||
                                                        "IDCC"}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                    {contest.numberOfProblems}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                    {contest.durationMinutes}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/results/${contest._id}`,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                                                    >
                                                        <BarChart3 className="w-4 h-4" />
                                                        <span>Results</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;
