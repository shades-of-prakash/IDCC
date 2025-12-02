import React, { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Code,
  List,
  ListOrdered,
  Image,
  Quote,
  Superscript,
  Subscript,
  Table,
  Rows3,
  Columns3,
  PlusSquare,
  MinusSquare,
  Grid2x2X,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { toast } from "sonner";
import { useContestId } from "../../contexts/selectedContest";

import addColumnBefore from "../../assets/add_column_before.svg?react";
import addColumnAfter from "../../assets/add_column_after.svg?react";
import addRowAbove from "../../assets/add_row_above.svg?react";
import addRowBelow from "../../assets/add_row_below.svg?react";
import deleteColumn from "../../assets/delete_column.svg?react";
import deleteRow from "../../assets/delete_row.svg?react";

const IconButton = ({ Icon, onClick, active, title }) => (
  <div
    title={title}
    onClick={onClick}
    className={`p-2 rounded cursor-pointer ${
      active ? "bg-black text-white" : "hover:bg-neutral-300"
    }`}
  >
    <Icon size={16} />
  </div>
);

const Divider = () => <div className="w-px h-6 bg-neutral-800/30" />;

const EditorHeader = ({ editor }) => {
  const contestId = useContestId();
  const [activeMarks, setActiveMarks] = useState({});

  useEffect(() => {
    if (!editor) return;
    const updateMarks = () => {
      setActiveMarks({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        code: editor.isActive("code"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        blockquote: editor.isActive("blockquote"),
        superscript: editor.isActive("superscript"),
        subscript: editor.isActive("subscript"),
        heading1: editor.isActive("heading", { level: 1 }),
        heading2: editor.isActive("heading", { level: 2 }),
        heading3: editor.isActive("heading", { level: 3 }),
      });
    };

    editor.on("update", updateMarks);
    editor.on("selectionUpdate", updateMarks);
    editor.on("transaction", updateMarks);
    updateMarks();

    return () => {
      editor.off("update", updateMarks);
      editor.off("selectionUpdate", updateMarks);
      editor.off("transaction", updateMarks);
    };
  }, [editor]);

  const handleImageUpload = async (editor) => {
    if (!contestId) {
      toast.error("Please select a contest before uploading an image!");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contestId", contestId);

        const res = await fetch("/api/contest/images/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.message || "Upload failed");

        const imageUrl = json.data.imageUrl;
        editor
          .chain()
          .focus()
          .setImage({
            src: imageUrl,
            height: 200,
            width: 200,
          })
          .run();

        toast.success("Image uploaded successfully!");
      } catch (err) {
        console.error("Image upload failed:", err);
        toast.error("Image upload failed. Please try again.");
      }
    };

    input.click();
  };

  const TOOLBAR_GROUPS = [
    {
      name: "textStyles",
      items: [
        {
          Icon: Bold,
          isActive: () => activeMarks.bold,
          command: (e) => e.chain().focus().toggleBold().run(),
          title: "Bold",
        },
        {
          Icon: Italic,
          isActive: () => activeMarks.italic,
          command: (e) => e.chain().focus().toggleItalic().run(),
          title: "Italic",
        },
        {
          Icon: Underline,
          isActive: () => activeMarks.underline,
          command: (e) => e.chain().focus().toggleUnderline().run(),
          title: "Underline",
        },
        {
          Icon: Code,
          isActive: () => activeMarks.code,
          command: (e) => e.chain().focus().toggleCode().run(),
          title: "Code",
        },
        {
          Icon: Superscript,
          isActive: () => activeMarks.superscript,
          command: (e) => e.chain().focus().toggleSuperscript().run(),
          title: "Superscript",
        },
        {
          Icon: Subscript,
          isActive: () => activeMarks.subscript,
          command: (e) => e.chain().focus().toggleSubscript().run(),
          title: "Subscript",
        },
      ],
    },
    {
      name: "headings",
      items: [
        {
          Icon: Heading1,
          isActive: () => activeMarks.heading1,
          command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
          title: "Heading 1",
        },
        {
          Icon: Heading2,
          isActive: () => activeMarks.heading2,
          command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
          title: "Heading 2",
        },
        {
          Icon: Heading3,
          isActive: () => activeMarks.heading3,
          command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
          title: "Heading 3",
        },
      ],
    },

    {
      name: "lists",
      items: [
        {
          Icon: List,
          isActive: () => activeMarks.bulletList,
          command: (e) => e.chain().focus().toggleBulletList().run(),
          title: "Bullet List",
        },
        {
          Icon: ListOrdered,
          isActive: () => activeMarks.orderedList,
          command: (e) => e.chain().focus().toggleOrderedList().run(),
          title: "Ordered List",
        },
      ],
    },
    {
      name: "blocks",
      items: [
        {
          Icon: Quote,
          isActive: () => activeMarks.blockquote,
          command: (e) => e.chain().focus().toggleBlockquote().run(),
          title: "Blockquote",
        },
      ],
    },
    {
      name: "media",
      items: [
        {
          Icon: Image,
          isActive: () => false,
          command: handleImageUpload,
          title: "Insert Image",
        },
      ],
    },

    {
      name: "table",
      items: [
        {
          Icon: Table,
          isActive: () => editor?.isActive("table"),
          command: (e) =>
            e
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
          title: "Insert Table",
        },

        // ---- Columns ----
        {
          Icon: addColumnBefore, // add column before
          isActive: () => false,
          command: (e) => e.chain().focus().addColumnBefore().run(),
          title: "Add Column Before",
        },
        {
          Icon: addColumnAfter, // add column after
          isActive: () => false,
          command: (e) => e.chain().focus().addColumnAfter().run(),
          title: "Add Column After",
        },
        {
          Icon: deleteColumn, // delete column
          isActive: () => false,
          command: (e) => e.chain().focus().deleteColumn().run(),
          title: "Delete Column",
        },

        // ---- Rows ----
        {
          Icon: addRowAbove, // add row above
          isActive: () => false,
          command: (e) => e.chain().focus().addRowBefore().run(),
          title: "Add Row Above",
        },
        {
          Icon: addRowBelow, // add row below
          isActive: () => false,
          command: (e) => e.chain().focus().addRowAfter().run(),
          title: "Add Row Below",
        },
        {
          Icon: deleteRow, // delete row
          isActive: () => false,
          command: (e) => e.chain().focus().deleteRow().run(),
          title: "Delete Row",
        },

        {
          Icon: Grid2x2X,
          isActive: () => editor?.isActive("table"),
          command: (e) => e.chain().focus().deleteTable().run(),
          title: "Delete Table",
        },
      ],
    },
  ];

  return (
    <div className="w-full h-full flex items-center p-1 gap-2 rounded">
      {TOOLBAR_GROUPS.map((group, groupIndex) => (
        <React.Fragment key={group.name}>
          <div className="flex gap-2 items-center">
            {group.items.map(({ Icon, isActive, command, title }, i) => (
              <IconButton
                key={i}
                Icon={Icon}
                active={isActive()}
                onClick={() => command(editor)}
                title={title}
              />
            ))}
          </div>
          {groupIndex < TOOLBAR_GROUPS.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default EditorHeader;
