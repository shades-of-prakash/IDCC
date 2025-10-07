import React from "react";

const Preview = ({ html }) => {
	return (
		<div className="w-1/2 p-4 overflow-auto">
			<h2 className="mb-1 text-lg font-semibold">Preview</h2>
			<div
				className="h-[95%] prose max-w-none rounded-md border border-gray-300 p-4 break-words prose-p:mb-2 prose-p:leading-relaxed"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
};

export default Preview;
