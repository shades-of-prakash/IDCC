import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import ContestNavbar from "../components/Admin/ContestNavbar";
import ContestModal from "../components/Admin/ContestModal";
import CreateUsers from "../components/Admin/CreateUsers";
import { Pause, Play, FilePlus, Trash, UserPlus } from "lucide-react";
import Loader from "../components/Loader";
import Logo from "../assets/images/logo.webp";
import { toast } from "sonner";
import InfoCard from "../components/InfoCard";

const Contest = () => {
    const [showModal, setShowModal] = useState(false);
    const [showCreateUsers, setShowCreateUsers] = useState(false);
    const [selectedContest, setSelectedContest] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const dropdownRef = useRef(null);

    const queryClient = useQueryClient();

    const toggleModal = () => setShowModal((prev) => !prev);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["contests"],
        queryFn: async () => {
            const res = await fetch("/api/contest/list");
            if (!res.ok) throw new Error("Failed to fetch contests");
            return res.json();
        },
    });

    const deleteContestMutation = useMutation({
        mutationFn: async (contestId) => {
            const res = await fetch(`/api/contest/delete/${contestId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete contest");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Contest deleted successfully");
            queryClient.invalidateQueries(["contests"]);
            setShowDeletePopup(false);
            setSelectedContest(null);
        },
        onError: (err) => {
            toast.error(err.message || "Error deleting contest");
        },
    });

    // 🔁 Toggle isRunning mutation (used by Play/Pause icon)
    const toggleRunningMutation = useMutation({
        mutationFn: async ({ id, isRunning }) => {
            const res = await fetch(`/api/contest/${id}/running`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isRunning }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(
                    errData.message || "Failed to update running status",
                );
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["contests"]);
            toast.success("Contest running status updated");
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update running status");
        },
    });

    const getStatus = (contest) => {
        console.log(
            contest.questions.length,
            contest.numberOfProblems,
            contest.questions.length === contest.numberOfProblems,
        );
        if (!contest.questions) return "Incomplete";
        return contest.questions.length === contest.numberOfProblems
            ? "Complete"
            : "Incomplete";
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDropdownToggle = (id) => {
        setOpenDropdown((prev) => (prev === id ? null : id));
    };

    const handleCreateUsers = (contest) => {
        setSelectedContest(contest);
        setShowCreateUsers(true);
        setOpenDropdown(null);
    };

    const handleDeleteClick = (contest) => {
        setSelectedContest(contest);
        setShowDeletePopup(true);
        setOpenDropdown(null);
    };

    const confirmDelete = () => {
        if (selectedContest) {
            deleteContestMutation.mutate(selectedContest._id);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 relative">
            <div className="h-16 border-b bg-white flex items-center px-4">
                <ContestNavbar toggle={toggleModal} />
            </div>

            {showModal && <ContestModal close={setShowModal} />}

            {!isLoading &&
                !isError &&
                (!data?.data || data.data.length === 0) && (
                    <div className="h-full w-full p-2 bg-white">
                        <InfoCard
                            title="No Contests Found"
                            className="border border-gray-200 rounded-md"
                            description="Looks like there are no contests available right now. You can create a new one using create contest button above"
                        />
                    </div>
                )}

            {isLoading && (
                <Loader text="Loading Contests" className="w-full h-full" />
            )}

            {isError && (
                <div className="text-center py-6 text-red-600">
                    {error.message}
                </div>
            )}

            {!isLoading && data?.data?.length > 0 && (
                <div className="h-[calc(100%-4rem)] p-2 relative">
                    <div className="bg-white rounded-md overflow-hidden  relative flex flex-col h-full">
                        <div className="flex-1 max-h-fit   border border-gray-300 rounded-md  overflow-y-auto">
                            <table className="min-w-fit  text-sm text-gray-700">
                                <thead className="bg-gray-100 text-gray-800 border-b border-gray-300 text-sm font-semibold sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-center w-[5%]">
                                            S.No
                                        </th>
                                        <th className="px-4 py-3 text-left w-[18%]">
                                            Contest Name
                                        </th>
                                        <th className="px-4 py-3 text-left w-[15%]">
                                            Conducted By
                                        </th>

                                        <th className="px-4 py-3 text-left w-[18%]">
                                            Languages
                                        </th>

                                        <th className="px-4 py-3 text-center w-[8%]">
                                            Problems
                                        </th>
                                        <th className="px-4 py-3 text-center w-[8%]">
                                            Duration
                                        </th>
                                        <th className="px-4 py-3 text-center w-[8%]">
                                            Running
                                        </th>
                                        <th className="px-4 py-3 text-center w-[10%]">
                                            Banner
                                        </th>
                                        <th className="px-4 py-3 text-center w-[10%]">
                                            Status
                                        </th>
                                        <th className="w-[5%]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.data.map((contest, index) => {
                                        const languages =
                                            contest?.languages || [];

                                        return (
                                            <tr
                                                key={contest._id}
                                                className="hover:bg-gray-50 transition-colors relative"
                                            >
                                                <td className="px-4 py-3 text-center font-medium text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {contest.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {contest.conductedBy}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {Array.isArray(languages) &&
                                                    languages.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {languages.map(
                                                                (lang) => (
                                                                    <span
                                                                        key={
                                                                            lang
                                                                        }
                                                                        className="px-2 py-0.5 rounded-full bg-blue-100/90 border border-blue-300 text-[11px] font-semibold text-blue-800 tracking-wide"
                                                                    >
                                                                        {lang}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {contest.numberOfProblems}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {contest.durationMinutes}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <div
                                                        className={`flex gap-2 items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium`}
                                                    >
                                                        <div
                                                            className={`w-1.5 h-1.5 ${
                                                                contest.isRunning
                                                                    ? "bg-green-600"
                                                                    : "bg-gray-400"
                                                            } rounded-full`}
                                                        ></div>
                                                        {contest.isRunning
                                                            ? "Running"
                                                            : "Inactive"}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {contest.bannerImage ? (
                                                        <img
                                                            src={`${
                                                                import.meta.env
                                                                    .VITE_BACKEND_URL
                                                            }${
                                                                contest.bannerImage
                                                            }`}
                                                            alt="banner"
                                                            className="h-12 w-12 object-contain rounded-md mx-auto border"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={Logo}
                                                            alt="banner"
                                                            className="h-14 w-14 object-contain overflow-hidden rounded-md mx-auto border"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`px-3 py-2 border rounded-full text-xs font-medium ${
                                                            getStatus(
                                                                contest,
                                                            ) === "Complete"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-50 text-red-600"
                                                        }`}
                                                    >
                                                        {getStatus(contest)}
                                                    </span>
                                                </td>

                                                {/* Actions column */}
                                                <td className="text-center px-2 relative">
                                                    <div className="max-w-fit flex rounded-md border border-gray-300">
                                                        <div className="p-2 w-full h-full border-r border-gray-300">
                                                            <Link
                                                                to={`add/${contest._id}`}
                                                                className="w-full h-full"
                                                            >
                                                                <FilePlus
                                                                    size={16}
                                                                    className="transform transition-transform duration-200 group-hover:scale-110"
                                                                />
                                                            </Link>
                                                        </div>

                                                        {/* ▶ Play/Pause button controls isRunning */}
                                                        <div
                                                            onClick={() =>
                                                                !toggleRunningMutation.isPending &&
                                                                toggleRunningMutation.mutate(
                                                                    {
                                                                        id: contest._id,
                                                                        isRunning:
                                                                            !contest.isRunning,
                                                                    },
                                                                )
                                                            }
                                                            className="p-2 w-full h-full border-r border-gray-300 group cursor-pointer"
                                                        >
                                                            {contest.isRunning ? (
                                                                <Pause
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <Play
                                                                    size={16}
                                                                    className="transform transition-transform duration-200 group-hover:scale-110"
                                                                />
                                                            )}
                                                        </div>

                                                        <div
                                                            onClick={() =>
                                                                handleCreateUsers(
                                                                    contest,
                                                                )
                                                            }
                                                            className="p-2 w-full h-full border-r border-gray-300 group cursor-pointer"
                                                        >
                                                            <UserPlus
                                                                size={16}
                                                                className="transform transition-transform duration-200 group-hover:scale-110"
                                                            />
                                                        </div>
                                                        <div
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    contest,
                                                                )
                                                            }
                                                            className="p-2 w-full h-full border-r border-gray-300 group cursor-pointer"
                                                        >
                                                            <Trash
                                                                size={16}
                                                                className="transform transition-transform duration-200 group-hover:scale-110"
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Popup */}
            {showDeletePopup && selectedContest && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[99999]">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-[22rem] text-center">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">
                            Delete Contest
                        </h2>
                        <p className="text-gray-600 mb-5">
                            Are you sure you want to delete{" "}
                            <span className="font-medium text-gray-900">
                                {selectedContest.name}
                            </span>
                            ?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowDeletePopup(false)}
                                disabled={deleteContestMutation.isPending}
                                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteContestMutation.isPending}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {deleteContestMutation.isPending
                                    ? "Deleting..."
                                    : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCreateUsers && selectedContest && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-0">
                    <CreateUsers
                        onClose={() => setShowCreateUsers(false)}
                        contestName={selectedContest.name}
                        contestId={selectedContest._id}
                    />
                </div>
            )}
        </div>
    );
};

export default Contest;
