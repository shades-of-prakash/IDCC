import { useEffect } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

import Editor from "./Editor";

const RichTextEditor = ({ value, onChange }) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Image,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
		],
		content: value || "",
		editorProps: {
			attributes: {
				class:
					"w-full h-full prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
			},
		},
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		},
	});

	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value || "");
		}
	}, [value, editor]);

	return (
		<div className="flex h-full w-full bg-white rounded">
			<Editor editor={editor} />
		</div>
	);
};

export default RichTextEditor;
