import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";

import PreviewModal from "./PreviewModal";
import TestcasePreviewDocumentView from "./PreviewTestCaseTable";
import ProblemActions from "./ProblemActions";

const fetchProblemById = async (problemId) => {
    const res = await fetch(`/api/contest/admin/preview/${problemId}`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch problem");
    }

    const json = await res.json();
    return json.data;
};

const ProblemPreview = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();

    const {
        data: selectedProblem,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["problem-preview", problemId],
        queryFn: () => fetchProblemById(problemId),
        enabled: !!problemId,
    });

    const getAvatar = (username) =>
        createAvatar(botttsNeutral, { seed: username }).toDataUri();

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                Loading problem preview...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-screen flex items-center justify-center text-red-600">
                {error.message}
            </div>
        );
    }

    const username = selectedProblem.submittedBy?.username;
    const role = selectedProblem.submittedBy?.role;

    return (
        <div className="h-full w-full flex flex-col bg-white">
            {/* HEADER */}
            <div className="h-14 flex items-center justify-between px-4 border-b bg-white">
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-sm text-gray-700 hover:text-black"
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    <div className="h-6 w-px bg-gray-300 mx-2" />

                    <div className="flex items-center gap-2 min-w-0 text-sm">
                        {/* Context */}
                        <span className="text-gray-500 shrink-0">
                            Preview for
                        </span>

                        {/* Problem name */}
                        <span className="font-semibold bg-neutral-200/30  p-2  rounded-md text-gray-800">
                            {selectedProblem.name}
                        </span>

                        {/* separator */}
                        <span className="text-gray-400 px-1">·</span>

                        {/* Added by */}
                        <span className="text-gray-500 shrink-0">Added by</span>

                        {/* User block */}
                        {username && (
                            <div className="flex items-center  border-gray-300 rounded-md p-2 border gap-2 min-w-0">
                                <img
                                    src={getAvatar(username)}
                                    alt="avatar"
                                    className="w-6 h-6 rounded"
                                />

                                <span className="text-gray-700 truncate font-semibold max-w-[140px]">
                                    {username}
                                </span>

                                {role && (
                                    <span
                                        className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide
                                        bg-violet-100 text-violet-700"
                                    >
                                        {role}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT */}
                <ProblemActions
                    problem={selectedProblem}
                    contestId={selectedProblem.contestId}
                    openModal={() => {}}
                    showEye={false}
                />
            </div>

            {/* BODY */}
            <div className="flex h-[calc(100%-3.5rem)] overflow-hidden">
                {/* LEFT PREVIEW */}
                <div className="w-[70%] h-full border-r overflow-hidden">
                    <PreviewModal selectedProblem={selectedProblem} />
                </div>

                {/* RIGHT TESTCASES */}
                <div className="w-[30%] h-full p-4 overflow-hidden flex flex-col">
                    <h3 className="text-md font-semibold mb-2">Testcases</h3>

                    <div className="flex-1 overflow-auto">
                        <TestcasePreviewDocumentView
                            testcases={selectedProblem.testcases || []}
                            argumentsList={selectedProblem.arguments || []}
                            OutputType={selectedProblem.outputType}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemPreview;
