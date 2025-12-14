import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import Loader from "../Loader";
import { ArrowLeft, Download, Search, X } from "lucide-react";

const PAGE_SIZE = 25;

const ContestResults = () => {
    const { id: contestId } = useParams();
    const navigate = useNavigate();
    const loaderRef = useRef(null);

    /* ===============================
       SEARCH (WITH DEBOUNCE)
    =============================== */
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400); // debounce delay (ms)

        return () => clearTimeout(handler);
    }, [search]);

    /* ===============================
       EXPORT (SEARCH AWARE)
    =============================== */
    const handleDownload = () => {
        const params = new URLSearchParams({
            search: debouncedSearch,
        }).toString();

        window.location.href = `/api/user/contest/${contestId}/results/export?${params}`;
    };

    /* ===============================
       DATA FETCH
    =============================== */
    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["contestuserResults", contestId, debouncedSearch],
        queryFn: ({ pageParam = 1 }) =>
            apiFetch(
                `/api/user/${contestId}/submissions?page=${pageParam}&limit=${PAGE_SIZE}&search=${encodeURIComponent(
                    debouncedSearch,
                )}`,
            ),
        getNextPageParam: (lastPage, allPages) =>
            Array.isArray(lastPage) && lastPage.length === PAGE_SIZE
                ? allPages.length + 1
                : undefined,
        enabled: !!contestId,
    });

    const users = data?.pages.flat() ?? [];

    /* ===============================
       INFINITE SCROLL
    =============================== */
    useEffect(() => {
        if (!loaderRef.current || !hasNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { rootMargin: "200px" },
        );

        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* ================= HEADER ================= */}
            <div className="bg-white border-b sticky top-0 z-20">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-md border border-gray-200 hover:bg-gray-100 transition"
                        >
                            <ArrowLeft className="w-4 h-4 text-gray-600" />
                        </button>

                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Contest Results
                            </h1>
                            <p className="text-sm text-gray-500">
                                Participants, scores, and submission counts
                            </p>
                        </div>
                    </div>

                    {/* COMMAND BAR */}
                    <div className="flex items-center gap-3">
                        {/* SEARCH */}
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name, ID, email or phone"
                                className="w-full pl-10 pr-9 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-none"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* EXPORT */}
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-100 transition"
                        >
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <Loader text="Fetching contest results..." />
                    </div>
                )}

                {isError && (
                    <div className="max-w-lg mx-auto p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                        <p className="font-medium text-red-600">
                            Failed to load results
                        </p>
                        <p className="text-sm text-red-500 mt-1">
                            {error?.message}
                        </p>
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="relative w-full overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-sm">
                        <table className="min-w-full text-sm table-fixed">
                            <thead className="bg-gray-100 border-b sticky top-0 z-10">
                                <tr className="text-xs font-semibold uppercase text-gray-600">
                                    <th className="px-4 py-4 text-left">#</th>
                                    <th className="px-4 py-4 text-left">
                                        Name
                                    </th>
                                    <th className="px-4 py-4 text-left">ID</th>
                                    <th className="px-4 py-4 text-left">
                                        Name
                                    </th>
                                    <th className="px-4 py-4 text-left">ID</th>
                                    <th className="px-4 py-4 text-left">
                                        Email
                                    </th>
                                    <th className="px-4 py-4 text-left">
                                        Contact
                                    </th>
                                    <th className="px-4 py-4 text-left">
                                        College
                                    </th>
                                    <th className="px-4 py-4 text-left">
                                        Dept
                                    </th>
                                    <th className="px-4 py-4 text-center">
                                        Marks
                                    </th>
                                    <th className="px-4 py-4 text-center">
                                        Subs
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-300">
                                {users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            className="py-10 text-center text-gray-500"
                                        >
                                            No results match your search
                                        </td>
                                    </tr>
                                )}

                                {users.map((row, i) => {
                                    const p1 = row.participants?.[0] || {};
                                    const p2 = row.participants?.[1] || {};

                                    return (
                                        <tr
                                            key={row.userId}
                                            onClick={() =>
                                                navigate(`${row.userId}`)
                                            }
                                            className={`cursor-pointer transition ${
                                                i % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-gray-50"
                                            } hover:bg-neutral-200/60`}
                                        >
                                            <td className="px-4 py-4 font-medium">
                                                {i + 1}
                                            </td>
                                            <td className="px-4 py-4">
                                                {p1.name || "-"}
                                            </td>
                                            <td className="px-4 py-4">
                                                {p1.regNo || "-"}
                                            </td>
                                            <td className="px-4 py-4">
                                                {p2.name || "-"}
                                            </td>
                                            <td className="px-4 py-4">
                                                {p2.regNo || "-"}
                                            </td>
                                            <td className="px-4 py-4 truncate">
                                                {row.email}
                                            </td>
                                            <td className="px-4 py-4">
                                                {row.phone}
                                            </td>
                                            <td className="px-4 py-4 truncate">
                                                {row.college}
                                            </td>
                                            <td className="px-4 py-4 truncate">
                                                {row.dept}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold">
                                                    {row.totalPoints ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-900 text-xs font-semibold">
                                                    {row.submissionCount}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}

                                <tr>
                                    <td colSpan={11}>
                                        <div
                                            ref={loaderRef}
                                            className="py-5 flex justify-center"
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
