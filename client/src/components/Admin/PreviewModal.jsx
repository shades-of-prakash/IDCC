import React from "react";

const PreviewModal = ({ selectedProblem }) => {
    if (!selectedProblem) return null;

    return (
        <div className="h-full  w-full bg-white flex flex-col">
            {/* Header */}
            <div className="border-b px-3 py-2">
                <span className="font-semibold text-sm">Preview</span>
            </div>

            {/* Content */}
            <div
                className="flex-1 overflow-auto p-4 text-gray-700 bg-neutral-100/30
                prose prose-neutral max-w-none
                space-y-3
                [&_p]:mb-3
                [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6
                [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6
                [&_li]:my-1
                [&_pre]:whitespace-pre-wrap
                [&_*]:break-words
                [&_img]:w-[450px] [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto [&_img]:my-10"
                dangerouslySetInnerHTML={{
                    __html: selectedProblem.statement,
                }}
            />
        </div>
    );
};

export default PreviewModal;
