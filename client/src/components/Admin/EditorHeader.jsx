import React from "react";
import { useParams } from "react-router";
import {
	Bold,
	Italic,
	Underline,
	Code,
	TextAlignStart,
	TextAlignCenter,
	TextAlignEnd,
	TextAlignJustify,
	List,
	ListOrdered,
	Image,
} from "lucide-react";

const IconButton = ({ Icon, onClick, active }) => (
	<div
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
	const { id } = useParams();
	if (!editor) return null;

	// Toolbar groups
	const TOOLBAR_GROUPS = [
		{
			name: "textStyles",
			items: [
				{
					Icon: Bold,
					isActive: (e) => e.isActive("bold"),
					command: (e) => e.chain().focus().toggleBold().run(),
				},
				{
					Icon: Italic,
					isActive: (e) => e.isActive("italic"),
					command: (e) => e.chain().focus().toggleItalic().run(),
				},
				{
					Icon: Underline,
					isActive: (e) => e.isActive("underline"),
					command: (e) => e.chain().focus().toggleUnderline().run(),
				},
				{
					Icon: Code,
					isActive: (e) => e.isActive("code"),
					command: (e) => e.chain().focus().toggleCode().run(),
				},
			],
		},
		{
			name: "alignment",
			items: [
				{
					Icon: TextAlignStart,
					isActive: (e) => e.isActive({ textAlign: "left" }),
					command: (e) => e.chain().focus().setTextAlign("left").run(),
				},
				{
					Icon: TextAlignCenter,
					isActive: (e) => e.isActive({ textAlign: "center" }),
					command: (e) => e.chain().focus().setTextAlign("center").run(),
				},
				{
					Icon: TextAlignJustify,
					isActive: (e) => e.isActive({ textAlign: "justify" }),
					command: (e) => e.chain().focus().setTextAlign("justify").run(),
				},
				{
					Icon: TextAlignEnd,
					isActive: (e) => e.isActive({ textAlign: "right" }),
					command: (e) => e.chain().focus().setTextAlign("right").run(),
				},
			],
		},
		{
			name: "lists",
			items: [
				{
					Icon: List,
					isActive: (e) => e.isActive("bulletList"),
					command: (e) => e.chain().focus().toggleBulletList().run(),
				},
				{
					Icon: ListOrdered,
					isActive: (e) => e.isActive("orderedList"),
					command: (e) => e.chain().focus().toggleOrderedList().run(),
				},
			],
		},
		{
			name: "media",
			items: [
				{
					Icon: Image,
					isActive: () => false,
					command: (editor) => {
						const input = document.createElement("input");
						input.type = "file";
						input.accept = "image/*";

						input.onchange = async (e) => {
							const file = e.target.files?.[0];
							if (!file) return;

							try {
								const formData = new FormData();
								formData.append("file", file);
								formData.append("contestId", id);

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
									.setImage({ src: imageUrl, width: 400, height: 300 })
									.run();
							} catch (err) {
								console.error("Image upload failed:", err);
								alert("Image upload failed. Please try again.");
							}
						};

						input.click();
					},
				},
			],
		},
	];

	return (
		<div className="w-full h-full flex items-center p-1 gap-2 rounded">
			{TOOLBAR_GROUPS.map((group, groupIndex) => (
				<React.Fragment key={group.name}>
					<div className="flex gap-2 items-center">
						{group.items.map(({ Icon, isActive, command }, i) => (
							<IconButton
								key={i}
								Icon={Icon}
								active={isActive(editor)}
								onClick={() => command(editor)}
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
