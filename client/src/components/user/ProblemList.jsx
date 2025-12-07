import React, { useState } from "react";
import { List, Loader2, ListChecks, CheckCircle, CircleX } from "lucide-react";

import { useUserSubmissions } from "../../contexts/userSubmissionContext";

const ProblemList = ({ isOpen, toggle, problems, active, setActive }) => {
    const { submissions, isLoading, error } = useUserSubmissions();

    // Check if user attempted this problem (uses problemId now)
    const hasAttempted = (problemId) =>
        submissions?.some((s) => s.problemId === problemId);

    // Tabs: "all", "attempted", "not_attempted"
    const [tab, setTab] = useState("all");

    // Filter problems based on selected tab
    const filteredProblems = problems.filter((p) => {
        if (tab === "all") return true;
        if (tab === "submitted") return hasAttempted(p.id);
        if (tab === "not_submitted") return !hasAttempted(p.id);
        return true;
    });

    return (
        <>
            {/* Overlay */}
            <div
                onClick={toggle}
                className={`fixed  top-0 left-0 w-full h-full bg-black/30 z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            />

            {/* Drawer */}
            <div
                className={`fixed  top-0 left-0 h-full w-[450px] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="h-12 border-b border-gray-300 flex gap-2 px-4 items-center">
                    <span className="font-semibold">Logiq</span>
                    <div className="w-px bg-red-900 h-4" />
                    <span className="font-semibold">IDCC</span>
                </div>

                <div className="flex justify-between items-center border-b p-3">
                    <div className="flex gap-1 items-center">
                        <List size={16} />
                        <h2 className="font-semibold">Problem List</h2>
                    </div>
                    <button
                        onClick={toggle}
                        className="px-2 py-1 hover:bg-neutral-200 rounded"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    {/* All */}
                    <button
                        onClick={() => setTab("all")}
                        className={`flex-1 py-2 text-sm font-medium border-r flex items-center justify-center gap-1 ${
                            tab === "all"
                                ? "bg-blue-50 text-blue-600"
                                : "hover:bg-neutral-100"
                        }`}
                    >
                        <ListChecks size={14} />
                        <span>All</span>
                    </button>

                    {/* Submitted */}
                    <button
                        onClick={() => setTab("submitted")}
                        className={`flex-1 py-2 text-sm font-medium border-r flex items-center justify-center gap-1 ${
                            tab === "submitted"
                                ? "bg-emerald-50 text-emerald-600"
                                : "hover:bg-neutral-100"
                        }`}
                    >
                        <CheckCircle size={14} />
                        <span>Submitted</span>
                    </button>

                    {/* Not Submitted */}
                    <button
                        onClick={() => setTab("not_submitted")}
                        className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
                            tab === "not_submitted"
                                ? "bg-rose-50 text-rose-600"
                                : "hover:bg-neutral-100"
                        }`}
                    >
                        <CircleX size={14} />
                        <span>Not Submitted</span>
                    </button>
                </div>

                {/* Loading / error */}
                {isLoading && (
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-600">
                        <Loader2 className="animate-spin" size={14} />
                        <span>Loading your submissions…</span>
                    </div>
                )}

                {error && (
                    <div className="px-3 py-2 text-xs text-rose-600">
                        Failed to load submissions: {error?.message || "Error"}
                    </div>
                )}

                {/* Problem List */}
                <div className="p-3 overflow-y-auto h-full flex flex-col gap-2">
                    {filteredProblems.map((problem, i) => {
                        const attempted = hasAttempted(problem.id);

                        return (
                            <div
                                key={problem.id}
                                onClick={() => {
                                    setActive(i);
                                    toggle();
                                }}
                                className={`flex items-center justify-between gap-1 p-2 rounded cursor-pointer transition border ${
                                    attempted
                                        ? "border-emerald-500 bg-emerald-50/40"
                                        : ""
                                } ${
                                    active === i
                                        ? "bg-blue-50 border  border-blue-300"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-neutral-500">
                                        {i + 1}.
                                    </span>
                                    <span className="text-sm">
                                        {problem.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {filteredProblems.length === 0 && (
                        <div className="text-xs text-neutral-500 text-center mt-4">
                            No problems found.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProblemList;
