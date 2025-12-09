import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import ContestNavbar from "../components/Admin/ContestNavbar";
import ContestModal from "../components/Admin/ContestModal";
import CreateUsers from "../components/Admin/CreateUsers";
import EditContestModal from "../components/Admin/EditContestModal";
import { Pause, Play, FilePlus, Trash, UserPlus, Edit } from "lucide-react";
import Loader from "../components/Loader";
import Logo from "../assets/images/logo.webp";
import { toast } from "sonner";
import InfoCard from "../components/InfoCard";
import DeleteContestPopup from "../components/Admin/DeleteContestPopup"; // ⬅️ NEW IMPORT

const Contest = () => {
    const [showModal, setShowModal] = useState(false);
    const [showCreateUsers, setShowCreateUsers] = useState(false);
    const [selectedContest, setSelectedContest] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const dropdownRef = useRef(null);
    const queryClient = useQueryClient();

    const toggleModal = () => setShowModal((prev) => !prev);

    // Fetch contests
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["contests"],
        queryFn: async () => {
            const res = await fetch("/api/contest/list");
            if (!res.ok) throw new Error("Failed to fetch contests");
            return res.json();
        },
    });

    // Delete contest
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
        onError: (err) => toast.error(err.message),
    });

    // Toggle running
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
        onError: (err) => toast.error(err.message),
    });

    const getStatus = (contest) => {
        if (!contest.questions) return "Incomplete";
        return contest.questions.length === contest.numberOfProblems
            ? "Complete"
            : "Incomplete";
    };

    // Close dropdown on outside click
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

    const handleEditClick = (contest) => {
        setSelectedContest(contest);
        setShowEditModal(true);
        setOpenDropdown(null);
    };

    // Called when popup confirms deletion
    const handleConfirmDelete = () => {
        if (!selectedContest?._id) return;
        deleteContestMutation.mutate(selectedContest._id);
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-50 relative">
            {/* Navbar */}
            <div className="h-16 border-b bg-white flex items-center px-4">
                <ContestNavbar toggle={toggleModal} />
            </div>

            {/* Create Contest Modal */}
            {showModal && <ContestModal close={setShowModal} />}

            {/* No contests */}
            {!isLoading &&
                !isError &&
                (!data?.data || data.data.length === 0) && (
                    <div className="h-full w-full p-2 bg-white">
                        <InfoCard
                            title="No Contests Found"
                            className="border border-gray-200 rounded-md"
                            description="Looks like there are no contests available right now. You can create a new one using the create contest button above."
                        />
                    </div>
                )}

            {/* Loading */}
            {isLoading && (
                <Loader text="Loading Contests" className="w-full h-full" />
            )}

            {/* Error */}
            {isError && (
                <div className="text-center py-6 text-red-600">
                    {error.message}
                </div>
            )}

            {/* Contest List */}
            {!isLoading && data?.data?.length > 0 && (
                <div className="h-[calc(100%-4rem)] p-2 relative">
                    <div className="bg-white rounded-md overflow-hidden relative flex flex-col h-full">
                        <div className="flex-1 max-h-fit border border-gray-300 rounded-md overflow-y-auto">
                            <table className="min-w-fit text-sm text-gray-700">
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
                                                <td className="px-4 py-3 text-center text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {contest.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {contest.conductedBy}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {languages.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {languages.map(
                                                                (lang) => (
                                                                    <span
                                                                        key={
                                                                            lang
                                                                        }
                                                                        className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-[11px] font-semibold text-blue-800"
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
                                                    <div className="flex gap-2 items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium">
                                                        <div
                                                            className={`w-1.5 h-1.5 rounded-full ${
                                                                contest.isRunning
                                                                    ? "bg-green-600"
                                                                    : "bg-gray-400"
                                                            }`}
                                                        ></div>
                                                        {contest.isRunning
                                                            ? "Running"
                                                            : "Inactive"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {contest.iconImage ? (
                                                        <img
                                                            src={`/api${
                                                                contest.iconImage
                                                            }`}
                                                            alt="banner"
                                                            className="h-12 w-12 object-contain rounded-md mx-auto border"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={Logo}
                                                            alt="banner"
                                                            className="h-14 w-14 object-contain rounded-md mx-auto border"
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

                                                {/* Actions */}
                                                <td className="text-center px-2">
                                                    <div className="max-w-fit flex rounded-md border border-gray-300">
                                                        {/* Add Questions */}
                                                        <div className="p-2 border-r border-gray-300">
                                                            <Link
                                                                to={`add/${contest._id}`}
                                                            >
                                                                <FilePlus
                                                                    size={16}
                                                                />
                                                            </Link>
                                                        </div>

                                                        {/* Play / Pause */}
                                                        <div
                                                            onClick={() =>
                                                                toggleRunningMutation.mutate(
                                                                    {
                                                                        id: contest._id,
                                                                        isRunning:
                                                                            !contest.isRunning,
                                                                    },
                                                                )
                                                            }
                                                            className="p-2 border-r border-gray-300 cursor-pointer"
                                                        >
                                                            {contest.isRunning ? (
                                                                <Pause
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <Play
                                                                    size={16}
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Create Users */}
                                                        <div
                                                            onClick={() =>
                                                                handleCreateUsers(
                                                                    contest,
                                                                )
                                                            }
                                                            className="p-2 border-r border-gray-300 cursor-pointer"
                                                        >
                                                            <UserPlus
                                                                size={16}
                                                            />
                                                        </div>

                                                        {/* Edit */}
                                                        <div
                                                            onClick={() =>
                                                                handleEditClick(
                                                                    contest,
                                                                )
                                                            }
                                                            className="p-2 border-r border-gray-300 cursor-pointer"
                                                        >
                                                            <Edit size={16} />
                                                        </div>

                                                        {/* Delete */}
                                                        <div
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    contest,
                                                                )
                                                            }
                                                            className="p-2 cursor-pointer text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash size={16} />
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

            {/* Edit Modal */}
            {showEditModal && selectedContest && (
                <EditContestModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    contest={selectedContest}
                />
            )}

            {/* Delete Popup as separate component */}
            {selectedContest && (
                <DeleteContestPopup
                    isOpen={showDeletePopup}
                    contest={selectedContest}
                    onClose={() => setShowDeletePopup(false)}
                    onConfirmDelete={handleConfirmDelete}
                    isDeleting={deleteContestMutation.isPending}
                />
            )}

            {/* Create Users */}
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
