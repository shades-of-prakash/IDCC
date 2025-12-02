import { useEffect } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Blockquote from "@tiptap/extension-blockquote";
import { ContestProvider } from "../../contexts/selectedContest";

import { TableKit } from "@tiptap/extension-table";

import Editor from "./Editor";

const RichTextEditor = ({ value, onChange, contestId }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ blockquote: false }),
      Image,
      TableKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Superscript,
      Subscript,
      Blockquote.configure({
        HTMLAttributes: {
          class:
            "border-l-4 border-primary/70 bg-muted/40 px-4 py-2 my-2 text-muted-foreground",
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "w-full h-full prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <ContestProvider contestId={contestId}>
      <div className="flex border border-gray-300 h-full w-full  rounded">
        <Editor editor={editor} />
      </div>
    </ContestProvider>
  );
};

export default RichTextEditor;
