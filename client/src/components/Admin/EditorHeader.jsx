// EditorHeader.jsx
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
    Grid2x2X,
    Heading1,
    Heading2,
    Heading3,
} from "lucide-react";
import { toast } from "sonner";
import { useEditorImages } from "../../contexts/EditorImagesContext";

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
    const [activeMarks, setActiveMarks] = useState({});
    const { addImage } = useEditorImages();

    useEffect(() => {
        if (!editor) return;

        const update = () => {
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

        editor.on("update", update);
        editor.on("selectionUpdate", update);
        editor.on("transaction", update);
        update();

        return () => {
            editor.off("update", update);
            editor.off("selectionUpdate", update);
            editor.off("transaction", update);
        };
    }, [editor]);

    const handleImageSelect = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file) return toast.error("No image selected");

            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result;

                editor
                    .chain()
                    .focus()
                    .setImage({
                        src: dataUrl,
                        width: 300,
                        height: 300,
                    })
                    .run();

                addImage({
                    id: crypto.randomUUID(),
                    src: dataUrl,
                    file,
                });

                toast.success("Image added");
            };

            reader.readAsDataURL(file);
        };

        input.click();
    };

    const groups = [
        {
            name: "text",
            items: [
                {
                    Icon: Bold,
                    active: () => activeMarks.bold,
                    command: (e) => e.chain().focus().toggleBold().run(),
                    title: "Bold",
                },
                {
                    Icon: Italic,
                    active: () => activeMarks.italic,
                    command: (e) => e.chain().focus().toggleItalic().run(),
                    title: "Italic",
                },
                {
                    Icon: Underline,
                    active: () => activeMarks.underline,
                    command: (e) => e.chain().focus().toggleUnderline().run(),
                    title: "Underline",
                },
                {
                    Icon: Code,
                    active: () => activeMarks.code,
                    command: (e) => e.chain().focus().toggleCode().run(),
                    title: "Code",
                },
                {
                    Icon: Superscript,
                    active: () => activeMarks.superscript,
                    command: (e) => e.chain().focus().toggleSuperscript().run(),
                    title: "Superscript",
                },
                {
                    Icon: Subscript,
                    active: () => activeMarks.subscript,
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
                    active: () => activeMarks.heading1,
                    command: (e) =>
                        e.chain().focus().toggleHeading({ level: 1 }).run(),
                    title: "H1",
                },
                {
                    Icon: Heading2,
                    active: () => activeMarks.heading2,
                    command: (e) =>
                        e.chain().focus().toggleHeading({ level: 2 }).run(),
                    title: "H2",
                },
                {
                    Icon: Heading3,
                    active: () => activeMarks.heading3,
                    command: (e) =>
                        e.chain().focus().toggleHeading({ level: 3 }).run(),
                    title: "H3",
                },
            ],
        },
        {
            name: "lists",
            items: [
                {
                    Icon: List,
                    active: () => activeMarks.bulletList,
                    command: (e) => e.chain().focus().toggleBulletList().run(),
                    title: "Bullet List",
                },
                {
                    Icon: ListOrdered,
                    active: () => activeMarks.orderedList,
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
                    active: () => activeMarks.blockquote,
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
                    active: () => false,
                    command: handleImageSelect,
                    title: "Insert Image",
                },
            ],
        },
        {
            name: "table",
            items: [
                {
                    Icon: Table,
                    active: () => editor?.isActive("table"),
                    command: (e) =>
                        e
                            .chain()
                            .focus()
                            .insertTable({ rows: 3, cols: 3 })
                            .run(),
                    title: "Insert Table",
                },
                {
                    Icon: addColumnBefore,
                    active: () => false,
                    command: (e) => e.chain().focus().addColumnBefore().run(),
                    title: "Add Column Before",
                },
                {
                    Icon: addColumnAfter,
                    active: () => false,
                    command: (e) => e.chain().focus().addColumnAfter().run(),
                    title: "Add Column After",
                },
                {
                    Icon: deleteColumn,
                    active: () => false,
                    command: (e) => e.chain().focus().deleteColumn().run(),
                    title: "Delete Column",
                },
                {
                    Icon: addRowAbove,
                    active: () => false,
                    command: (e) => e.chain().focus().addRowBefore().run(),
                    title: "Add Row Above",
                },
                {
                    Icon: addRowBelow,
                    active: () => false,
                    command: (e) => e.chain().focus().addRowAfter().run(),
                    title: "Add Row Below",
                },
                {
                    Icon: deleteRow,
                    active: () => false,
                    command: (e) => e.chain().focus().deleteRow().run(),
                    title: "Delete Row",
                },
                {
                    Icon: Grid2x2X,
                    active: () => false,
                    command: (e) => e.chain().focus().deleteTable().run(),
                    title: "Delete Table",
                },
            ],
        },
    ];

    return (
        <div className="w-full flex items-center p-1 gap-2">
            {groups.map((g, i) => (
                <React.Fragment key={g.name}>
                    <div className="flex gap-2 items-center">
                        {g.items.map((item, idx) => (
                            <IconButton
                                key={idx}
                                Icon={item.Icon}
                                active={item.active()}
                                onClick={() => item.command(editor)}
                                title={item.title}
                            />
                        ))}
                    </div>
                    {i < groups.length - 1 && <Divider />}
                </React.Fragment>
            ))}
        </div>
    );
};

export default EditorHeader;
