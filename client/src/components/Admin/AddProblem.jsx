import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
    ArrowLeft,
    Timer,
    CircleQuestionMark,
    ChevronDown,
    ChevronUp,
    Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import Loader from "../Loader";
import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import { toast } from "sonner";
import ProblemActions from "./ProblemActions";
import InfoCard from "../InfoCard";

const AddProblem = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();

    /* ---------------- Dropdown ---------------- */
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ---------------- Toggle ---------------- */
    const [showAddedFirst, setShowAddedFirst] = useState(false);

    const getAvatar = (username) =>
        createAvatar(botttsNeutral, { seed: username }).toDataUri();

    /* ---------------- Data ---------------- */
    const { data, isLoading, error } = useQuery({
        queryKey: ["contest-all-problems-to-add", contestId],
        queryFn: () =>
            apiFetch(
                `/api/contest/admin/getAllProblemsOfContest?contestId=${contestId}`,
            ),
        enabled: !!contestId,
        onError: (err) =>
            toast.error(err?.message || "Failed to fetch problems"),
    });

    const contestDetails = data?.contestDetails;
    const problems = data?.problems || [];

    /* ---------------- Sorted Problems ---------------- */
    const sortedProblems = useMemo(() => {
        if (!showAddedFirst) return problems;

        return [...problems].sort((a, b) => {
            if (a.status === "finalized" && b.status !== "finalized") return -1;
            if (a.status !== "finalized" && b.status === "finalized") return 1;
            return 0;
        });
    }, [problems, showAddedFirst]);

    /* ---------------- Navigation ---------------- */
    const handlePreview = (problem) => {
        navigate(`/admin/preview/${problem.problemId}`);
    };

    if (isLoading) return <Loader />;
    if (error)
        return <div className="p-4 text-red-600">Error: {error.message}</div>;

    return (
        <div className="w-full h-full bg-white flex flex-col">
            <div className="w-full px-3 h-16 flex items-center justify-between border-b border-gray-300">
                <div className="flex items-center gap-3">
                    <button
                        className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft />
                    </button>
                    <div>
                        <p className="font-semibold text-lg">Problems List</p>
                        <p className="text-sm text-gray-600">
                            Problems added by volunteers and coordinators
                        </p>
                    </div>
                </div>

                {contestDetails && (
                    <div className="flex items-center gap-4">
                        {/* ===== Toggle ===== */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Added</span>
                            <button
                                onClick={() =>
                                    setShowAddedFirst((prev) => !prev)
                                }
                                className={`w-11 h-6 flex items-center rounded-full transition ${
                                    showAddedFirst ? "bg-black" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                                        showAddedFirst
                                            ? "translate-x-5"
                                            : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>

                        {/* ===== Contest Dropdown ===== */}
                        <div
                            ref={dropdownRef}
                            className="relative border border-gray-300 rounded-md bg-white shadow-sm"
                        >
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                            >
                                {contestDetails.name}
                                {open ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </button>

                            {open && (
                                <div className="absolute top-full right-0 mt-3 w-[360px] bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <div className="relative h-28 bg-gray-100">
                                        {contestDetails.bannerImage ? (
                                            <img
                                                src={contestDetails.bannerImage}
                                                alt="Contest Banner"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                                No Banner
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40" />
                                        <div className="absolute bottom-2 left-3 right-3">
                                            <p className="text-white font-semibold truncate">
                                                {contestDetails.name}
                                            </p>
                                            <p className="text-white/80 text-xs">
                                                Conducted by{" "}
                                                {contestDetails.conductedBy}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3 text-sm text-gray-700">
                                        <InfoRow
                                            icon={
                                                <CircleQuestionMark size={16} />
                                            }
                                            label="Problems"
                                            value={
                                                contestDetails.numberOfProblems
                                            }
                                        />
                                        <InfoRow
                                            icon={<Timer size={16} />}
                                            label="Duration"
                                            value={`${contestDetails.durationMinutes} min`}
                                        />
                                        <InfoRow
                                            icon={<Info size={16} />}
                                            label="Team Size"
                                            value={contestDetails.teamSize}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {sortedProblems.length > 0 ? (
                <div className="h-[calc(100%-4rem)]  overflow-hidden px-3 py-4">
                    <div className="w-full h-full border  border-gray-300 rounded-md overflow-auto">
                        <table className="min-w-full">
                            <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-gray-600">
                                <tr>
                                    <th className="px-4 py-3 text-left w-12">
                                        Sno
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Submitted By
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProblems.map((problem, index) => (
                                    <tr
                                        key={problem.problemId}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3 truncate max-w-[260px]">
                                            {problem.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={getAvatar(
                                                        problem.submittedBy
                                                            .username,
                                                    )}
                                                    alt="avatar"
                                                    className="w-6 h-6 rounded"
                                                />
                                                {problem.submittedBy.username}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-sm ${
                                                    problem.submittedBy.role ===
                                                    "coordinator"
                                                        ? "bg-purple-100 text-purple-600"
                                                        : "bg-green-100 text-green-600"
                                                }`}
                                            >
                                                {problem.submittedBy.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <ProblemActions
                                                problem={{
                                                    ...problem,
                                                    _id: problem.problemId,
                                                }}
                                                contestId={contestId}
                                                showEye
                                                onPreview={() =>
                                                    handlePreview(problem)
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <InfoCard
                    title="No Problems Yet"
                    description="Ask volunteers or coordinators to add problems."
                />
            )}
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex justify-between items-center">
        <span className="flex items-center gap-2 text-gray-500">
            {icon}
            {label}
        </span>
        <span className="font-semibold">{value}</span>
    </div>
);

export default AddProblem;
