import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import Loader from "../Loader";
import { ArrowLeft } from "lucide-react";

const PAGE_SIZE = 25;

const ContestResults = () => {
    const { id: contestId } = useParams();
    const navigate = useNavigate();

    const loaderRef = useRef(null);

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["contestuserResults", contestId],
        queryFn: ({ pageParam = 1 }) =>
            apiFetch(
                `/api/user/${contestId}/submissions?page=${pageParam}&limit=${PAGE_SIZE}`,
            ),
        getNextPageParam: (lastPage, allPages) => {
            if (!Array.isArray(lastPage)) return undefined;
            // if full page, assume more pages exist
            if (lastPage.length === PAGE_SIZE) {
                return allPages.length + 1;
            }
            return undefined;
        },
        enabled: !!contestId,
    });

    const users = data?.pages.flat() ?? [];

    useEffect(() => {
        if (!loaderRef.current) return;
        if (!hasNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (
                    first.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0.1,
            },
        );

        observer.observe(loaderRef.current);

        return () => {
            observer.disconnect();
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="w-full h-full flex flex-col bg-white">
            {/* 🔵 STICKY HEADER WITH BACK BUTTON */}
            <div className="h-16 px-3 flex items-center gap-3 border-b bg-white sticky top-0 z-20">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 px-3 py-3 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold">Contest Results</h1>
                    <span className="text-sm text-gray-600">
                        Showing participants and their submission count
                    </span>
                </div>
            </div>

            {/* 🔥 BODY SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
                {/* Initial Loading */}
                {isLoading && (
                    <div className="p-4">
                        <Loader text="Loading submissions..." />
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="p-4 text-red-600">
                        Failed to load results: {error?.message}
                    </div>
                )}

                {/* Table */}
                {!isLoading && !isError && (
                    <div className="relative overflow-x-auto rounded-lg border border-gray-300">
                        <table className="min-w-full text-base">
                            <thead className="bg-gray-100 border-b border-gray-300 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">
                                        S.No
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">
                                        Name
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">
                                        ID
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">
                                        Name
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">
                                        ID
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">
                                        Email
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">
                                        Contact
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">
                                        College
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase">
                                        Department
                                    </th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase">
                                        Submissions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 text-gray-800">
                                {users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="text-center px-4 py-6 text-gray-500"
                                        >
                                            No submissions found for this
                                            contest.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((entry, index) => {
                                        const {
                                            userId,
                                            submissionCount,
                                            email,
                                            phone,
                                            college,
                                            dept,
                                            participants = [],
                                        } = entry;

                                        const p1 = participants[0] || {};
                                        const p2 = participants[1] || {};

                                        return (
                                            <tr
                                                key={userId || index}
                                                onClick={() =>
                                                    navigate(`${userId}`)
                                                }
                                                className="hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                {/* S.No */}
                                                <td className="px-4 py-4">
                                                    {index + 1}
                                                </td>

                                                {/* P1 Name */}
                                                <td
                                                    className="px-4 py-4 max-w-[150px] truncate"
                                                    title={p1.name || ""}
                                                >
                                                    {p1.name || "-"}
                                                </td>

                                                {/* P1 ID */}
                                                <td
                                                    className="px-4 py-4 max-w-[120px] truncate"
                                                    title={p1.regNo || ""}
                                                >
                                                    {p1.regNo || "-"}
                                                </td>

                                                {/* P2 Name */}
                                                <td
                                                    className="px-4 py-4 max-w-[150px] truncate"
                                                    title={p2.name || ""}
                                                >
                                                    {p2.name || "-"}
                                                </td>

                                                {/* P2 ID */}
                                                <td
                                                    className="px-4 py-4 max-w-[120px] truncate"
                                                    title={p2.regNo || ""}
                                                >
                                                    {p2.regNo || "-"}
                                                </td>

                                                {/* Email */}
                                                <td
                                                    className="px-4 py-4 max-w-[200px] truncate"
                                                    title={email}
                                                >
                                                    {email}
                                                </td>

                                                {/* Contact */}
                                                <td className="px-4 py-4">
                                                    {phone}
                                                </td>

                                                {/* College */}
                                                <td
                                                    className="px-4 py-4 max-w-[220px] truncate"
                                                    title={college}
                                                >
                                                    {college}
                                                </td>

                                                {/* Department */}
                                                <td
                                                    className="px-4 py-4 max-w-[180px] truncate"
                                                    title={dept}
                                                >
                                                    {dept}
                                                </td>

                                                {/* Submission Count */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-900 font-semibold">
                                                        {submissionCount}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}

                                <tr>
                                    <td colSpan={10} className="h-1">
                                        <div
                                            ref={loaderRef}
                                            className="w-full flex justify-center items-center py-1.5"
                                        >
                                            {isFetchingNextPage && (
                                                <Loader text="Loading more..." />
                                            )}
                                            {!hasNextPage &&
                                                users.length > 0 && (
                                                    <span className="text-xs text-gray-400">
                                                        End of results
                                                    </span>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestResults;
