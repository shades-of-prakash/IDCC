import React, { useContext, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../contexts/adminAuthContext";
import { apiFetch } from "../utils/fetch";
import {
    Braces,
    Ellipsis,
    FilePenLine,
    Plus,
    SquarePlus,
    Trash2,
    X,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import Test from "../assets/naruto_empty.jpg";
import InfoCard from "../components/InfoCard";
import Loader from "../components/Loader";
import ZoroSomethingWentWrong from "../assets/zoro_error.jpg";
import CreateProblemPopup from "../components/Admin/CreateProblemPopup";

const fetchProblemsByAdmin = async (adminId) => {
    if (!adminId) return [];
    const data = await apiFetch(
        `/api/contest/admin/all/problems?adminId=${adminId}`,
    );
    return data || [];
};

const CVDashboard = () => {
    const { admin } = useContext(AuthContext);
    const [openCreatePopup, setOpenCreatePopup] = useState(false);

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        problem: null,
    });
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    const [deleteError, setDeleteError] = useState("");

    // track which problem is being marked complete
    const [markingCompleteId, setMarkingCompleteId] = useState(null);

    // ✅ state for checklist popup
    const [statusModal, setStatusModal] = useState({
        open: false,
        problem: null,
        checklist: null,
    });

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

    const handleDeleteConfirm = async () => {
        if (!deleteModal.problem) return;

        try {
            setDeleting(true);
            setDeleteError(""); // clear previous error

            await apiFetch(
                `/api/contest/admin/problem/delete/${deleteModal.problem._id}`,
                { method: "DELETE" },
            );

            queryClient.invalidateQueries(["problemsByAdmin", admin.id]);
            toast.success(
                `Deleted "${deleteModal.problem.name}" successfully!`,
            );

            setDeleteModal({ open: false, problem: null });
            setConfirmText("");
        } catch (err) {
            console.error("Delete failed:", err);
            setDeleteError(
                err?.message || "Failed to delete problem. Please try again.",
            );
        } finally {
            setDeleting(false);
        }
    };

    const openDeletePopup = (problem) => {
        setDeleteModal({ open: true, problem });
        setConfirmText("");
        setDeleteError("");
    };

    const handleMarkComplete = async (problem) => {
        if (!problem?._id) return;

        try {
            setMarkingCompleteId(problem._id);

            const res = await apiFetch(
                `/api/contest/admin/problem/complete/${problem._id}`,
                { method: "POST" },
            );

            // depending on SuccessResponse, data might be in res.data or res
            const info = res?.data || res || {};
            const checklist = {
                isCompleted:
                    info.isCompleted ??
                    info.problem?.isCompleted ??
                    problem.isCompleted,
                hasStatement: info.hasStatement ?? false,
                hasAnyTestcases: info.hasAnyTestcases ?? false,
                hasVisible: info.hasVisible ?? false,
                hasHidden: info.hasHidden ?? false,
                totalTestcases: info.totalTestcases ?? 0,
                visibleCount: info.visibleCount ?? 0,
                hiddenCount: info.hiddenCount ?? 0,
            };

            setStatusModal({
                open: true,
                problem,
                checklist,
            });

            // refresh list to get updated isCompleted flag
            queryClient.invalidateQueries(["problemsByAdmin", admin.id]);
        } catch (err) {
            console.error("Mark complete failed:", err);
            toast.error("Failed to update completion status.");
        } finally {
            setMarkingCompleteId(null);
        }
    };

    const closeStatusModal = () => {
        setStatusModal({ open: false, problem: null, checklist: null });
    };

    const renderChecklistRow = (label, ok, extra = "") => (
        <div className="flex items-center justify-between py-1" key={label}>
            <div className="flex items-center gap-2">
                {ok ? (
                    <CheckCircle2 className="text-green-600" size={18} />
                ) : (
                    <XCircle className="text-red-500" size={18} />
                )}
                <span className="text-sm text-gray-800">{label}</span>
            </div>
            {extra && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                    {extra}
                </span>
            )}
        </div>
    );

    return (
        <div className="w-full h-full">
            {/* Header */}
            <div className="h-16 px-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex h-full flex-col justify-center">
                    <h1 className="text-xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Overview of all problems submitted by you
                    </p>
                </div>
                <div>
                    <button
                        onClick={() => setOpenCreatePopup(true)}
                        className="px-4 py-2 rounded text-white bg-black flex items-center gap-2"
                    >
                        <SquarePlus size={16} />
                        Create Problem
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full p-3 h-[calc(100%-4rem)] overflow-hidden">
                {problems.length > 0 ? (
                    <div className="overflow-y-auto rounded-md border border-gray-300">
                        <table className="w-full text-sm text-left rtl:text-right">
                            <thead className="bg-neutral-200/50 sticky top-0 z-20">
                                <tr className="border-b border-gray-300">
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        SNO
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Problem Name
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Contest Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Conducted By
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="[&>tr:not(:last-child)]:border-b [&>tr:not(:last-child)]:border-gray-300">
                                {problems.map((problem, index) => (
                                    <tr
                                        key={problem._id || index}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {problem.name}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {problem.contestName || "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {problem.conductedBy || "—"}
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap text-right text-sm text-gray-700">
                                            <div className="cursor-pointer flex w-full h-full rounded-md border border-gray-300">
                                                <div
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/statement/${problem._id}`,
                                                        )
                                                    }
                                                    className="group flex-1 p-2 flex items-center justify-center border-r border-gray-300"
                                                >
                                                    <FilePenLine
                                                        size={16}
                                                        className="transition-transform duration-200 group-hover:scale-125 group-hover:text-blue-600"
                                                    />
                                                </div>

                                                <div
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/testcase/${problem._id}`,
                                                        )
                                                    }
                                                    className="group flex-1 p-2 flex items-center justify-center border-r border-gray-300"
                                                >
                                                    <span className="font-semibold group-hover:text-orange-600 group-hover:scale-125 transition-transform">
                                                        Tc
                                                    </span>
                                                </div>

                                                <div
                                                    onClick={() => {
                                                        openDeletePopup(
                                                            problem,
                                                        );
                                                    }}
                                                    className="group flex-1 p-2 flex items-center justify-center border-r border-gray-300"
                                                >
                                                    <Trash2
                                                        size={16}
                                                        className="group-hover:text-red-900 transition-transform duration-200 group-hover:scale-125"
                                                    />
                                                </div>

                                                {/* Mark complete / check status */}
                                                <div
                                                    onClick={() =>
                                                        handleMarkComplete(
                                                            problem,
                                                        )
                                                    }
                                                    className="group flex-1 p-2 flex items-center justify-center"
                                                >
                                                    {markingCompleteId ===
                                                    problem._id ? (
                                                        <Ellipsis
                                                            size={16}
                                                            className="animate-pulse text-gray-500"
                                                        />
                                                    ) : problem.isCompleted ? (
                                                        <CheckCircle2
                                                            size={18}
                                                            className="text-green-700 transition-transform duration-200 group-hover:scale-125"
                                                        />
                                                    ) : (
                                                        <Plus
                                                            size={16}
                                                            className="transition-transform duration-200 group-hover:scale-125 group-hover:text-green-700"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg p-4 w-96 shadow-lg">
                        <div className="flex justify-between mb-4 items-center">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Confirm Deletion
                            </h2>
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        open: false,
                                        problem: null,
                                    })
                                }
                            >
                                <X
                                    size={16}
                                    className="text-gray-400 hover:text-gray-600"
                                />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            To delete{" "}
                            <strong>{deleteModal.problem.name}</strong>, type{" "}
                            <span className="font-mono">delete</span> below:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:border-blue-300"
                        />

                        {deleteError && (
                            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setDeleteModal({
                                        open: false,
                                        problem: null,
                                    });
                                    setConfirmText("");
                                    setDeleteError("");
                                }}
                                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={
                                    confirmText.toLowerCase() !== "delete" ||
                                    deleting
                                }
                                className={`px-4 py-2 rounded text-white ${
                                    confirmText.toLowerCase() === "delete" &&
                                    !deleting
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

            {statusModal.open && statusModal.checklist && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-lg p-4 w-96 shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Problem Status
                            </h2>
                            <button onClick={closeStatusModal}>
                                <X
                                    size={16}
                                    className="text-gray-400 hover:text-gray-600"
                                />
                            </button>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                            <span className="font-semibold">
                                {statusModal.problem?.name}
                            </span>
                        </p>

                        <div className="space-y-1.5 mb-3">
                            {renderChecklistRow(
                                "Statement added",
                                statusModal.checklist.hasStatement,
                            )}
                            {renderChecklistRow(
                                "At least one testcase",
                                statusModal.checklist.hasAnyTestcases,
                                `${statusModal.checklist.totalTestcases} total`,
                            )}
                            {renderChecklistRow(
                                "Visible testcase present",
                                statusModal.checklist.hasVisible,
                                `${statusModal.checklist.visibleCount} visible`,
                            )}
                            {renderChecklistRow(
                                "Hidden testcase present",
                                statusModal.checklist.hasHidden,
                                `${statusModal.checklist.hiddenCount} hidden`,
                            )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-800">
                                Overall status:
                            </span>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    statusModal.checklist.isCompleted
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {statusModal.checklist.isCompleted
                                    ? "Completed"
                                    : "Incomplete"}
                            </span>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={closeStatusModal}
                                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CreateProblemPopup
                open={openCreatePopup}
                onClose={() => setOpenCreatePopup(false)}
                adminId={admin.id}
            />
        </div>
    );
};

export default CVDashboard;
