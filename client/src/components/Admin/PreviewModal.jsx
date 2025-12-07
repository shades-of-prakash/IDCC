import React from "react";
import { X } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { botttsNeutral } from "@dicebear/collection";
import ProblemActions from "./ProblemActions";

const PreviewModal = ({ selectedProblem, closeModal }) => {
    const getAvatar = (username) =>
        createAvatar(botttsNeutral, { seed: username }).toDataUri();

    if (!selectedProblem) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-md shadow-lg p-3 w-[800px] h-[600px] flex flex-col items-center">
                <div className="w-full  flex flex-col items-center">
                    <div className="w-full flex justify-between px-2">
                        <span className="font-semibold">Preview</span>
                        <button
                            className="text-gray-400 hover:text-gray-600"
                            onClick={closeModal}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="w-full flex justify-between items-center py-2">
                        <div className="flex select-none">
                            <div className="relative flex border-r items-center gap-2 px-3 py-2 rounded-s-md border border-slate-200 max-w-[250px] group">
                                <span className="font-medium text-gray-600 text-sm shrink-0">
                                    Name:
                                </span>
                                <span className="truncate text-gray-800 text-sm cursor-default">
                                    {selectedProblem.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 px-3 py-2 border-l-0 rounded-e-md border border-slate-200">
                                <div className="rounded w-6 h-6 overflow-hidden">
                                    <img
                                        src={getAvatar(
                                            selectedProblem.submittedBy
                                                .username,
                                        )}
                                        alt="avatar"
                                    />
                                </div>
                                {selectedProblem.submittedBy.username}
                            </div>
                        </div>

                        <div className="h-full flex  p-1">
                            <ProblemActions
                                problem={selectedProblem}
                                contestId={selectedProblem.contestId}
                                openModal={() => {}}
                                showEye={false}
                            />
                        </div>
                    </div>
                </div>

                <div
                    className="preview text-gray-700 leading-6 w-full h-[calc(100%-5rem)]
                     bg-neutral-100/30 border border-gray-200 p-4 rounded-md text-base
                     overflow-auto prose prose-neutral max-w-none
                     space-y-3
                     [&_p]:mb-3
                     [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6
                     [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6
                     [&_li]:my-1
                     [&_pre]:whitespace-pre-wrap
                     [&_*]:break-words
                     [&_img]:w-[420px] [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto [&_img]:my-10"
                    dangerouslySetInnerHTML={{
                        __html: selectedProblem.statement,
                    }}
                ></div>
            </div>
        </div>
    );
};

export default PreviewModal;
