import React from "react";
import { EditorContent } from "@tiptap/react";
import EditorHeader from "./EditorHeader";

const Editor = ({ editor }) => {
	return (
		<div className="w-full h-full overflow-hidden">
			<div className="w-full h-full flex flex-col border border-neutral-800/30 rounded">
				<div className="bg-neutral-100 w-full h-10 border-b border-neutral-800/20 rounded-t">
					<EditorHeader editor={editor} />
				</div>
				<div className="flex-1 overflow-auto rounded-md p-2">
					<EditorContent editor={editor} className="h-full" />
				</div>
			</div>
		</div>
	);
};

export default Editor;
