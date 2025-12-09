import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const LANGUAGE_OPTIONS = [
    { label: "Python", value: "python" },
    { label: "C", value: "c" },
    { label: "C++", value: "cpp" },
    { label: "Java", value: "java" },
];

const normalizeLanguages = (languages) => {
    if (!languages) return [];
    if (Array.isArray(languages)) return languages.map((l) => l.toLowerCase());
    if (typeof languages === "string") {
        try {
            if (languages.startsWith("[")) {
                return JSON.parse(languages).map((x) => x.toLowerCase());
            }
        } catch {}
        return languages.split(",").map((x) => x.trim().toLowerCase());
    }
    return [];
};

const normalizeInstructions = (instructions) => {
    if (!instructions) return [];
    if (Array.isArray(instructions)) return instructions.map((i) => String(i));
    if (typeof instructions === "string") {
        try {
            if (instructions.startsWith("[")) {
                const parsed = JSON.parse(instructions);
                if (Array.isArray(parsed)) return parsed.map((i) => String(i));
            }
        } catch {}
        return [instructions];
    }
    return [];
};

// Utility function to get the correct image source (local preview or backend URL)
const getImageSrc = (previewUrl, file, existingPath) => {
    if (file) return previewUrl;
    if (existingPath && existingPath.startsWith("http")) return existingPath;
    if (existingPath)
        return `${import.meta.env.VITE_BACKEND_URL}${existingPath}`;
    return "";
};

const EditContestModal = ({ isOpen, onClose, contest }) => {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        name: "",
        conductedBy: "",
        numberOfProblems: "",
        durationMinutes: "",
        languages: [],
        instructions: [],
    });

    // --- NEW STATE FOR ICON ---
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState("");
    // --------------------------

    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("");
    const [errors, setErrors] = useState({});

    const [isInstructionPanelOpen, setIsInstructionPanelOpen] = useState(false);
    const [newInstruction, setNewInstruction] = useState("");

    useEffect(() => {
        if (isOpen && contest) {
            setForm({
                name: contest.name || "",
                conductedBy: contest.conductedBy || "",
                numberOfProblems: contest.numberOfProblems || "",
                durationMinutes: contest.durationMinutes || "",
                languages: normalizeLanguages(contest.languages),
                instructions: normalizeInstructions(contest.instructions),
            });

            // Initialize Banner Preview
            const existingBanner = contest.bannerImage || "";
            setBannerPreview(existingBanner);
            setBannerFile(null);

            // Initialize Icon Preview (NEW)
            const existingIcon = contest.iconImage || "";
            setIconPreview(existingIcon);
            setIconFile(null);

            setErrors({});
            setIsInstructionPanelOpen(false);
            setNewInstruction("");
        }
    }, [isOpen, contest]);

    const updateMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            const cleanedInstructions = (form.instructions || [])
                .map((ins) => ins.trim())
                .filter((ins) => ins !== "");

            formData.append("name", form.name.trim());
            formData.append("conductedBy", form.conductedBy.trim());
            formData.append("numberOfProblems", form.numberOfProblems);
            formData.append("durationMinutes", form.durationMinutes);
            formData.append("languages", JSON.stringify(form.languages));
            formData.append(
                "instructions",
                JSON.stringify(cleanedInstructions),
            );

            // Append files only if they were newly selected
            if (bannerFile) formData.append("bannerImage", bannerFile);
            if (iconFile) formData.append("iconImage", iconFile); // NEW: Append icon file

            const res = await fetch(`/api/contest/update/${contest._id}`, {
                method: "PATCH",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to update contest");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Contest updated successfully");
            queryClient.invalidateQueries(["contests"]);
            onClose();
        },
        onError: (err) => toast.error(err.message),
    });

    const toggleLanguage = (value) => {
        setForm((prev) => ({
            ...prev,
            languages: prev.languages.includes(value)
                ? prev.languages.filter((l) => l !== value)
                : [...prev.languages, value],
        }));
    };

    // Consolidated file change handler to handle both banner and icon
    const handleFileChange = (e, fileKey) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                [fileKey]: "File must be under 2MB",
            }));
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        if (fileKey === "bannerFile") {
            setBannerFile(file);
            setBannerPreview(previewUrl);
        } else if (fileKey === "iconFile") {
            setIconFile(file);
            setIconPreview(previewUrl);
        }

        setErrors((prev) => ({ ...prev, [fileKey]: undefined }));
    };

    const removeInstruction = (index) => {
        setForm((prev) => ({
            ...prev,
            instructions: prev.instructions.filter((_, i) => i !== index),
        }));
    };

    const handleInstructionChange = (index, value) => {
        setForm((prev) => {
            const updated = [...prev.instructions];
            updated[index] = value;
            return { ...prev, instructions: updated };
        });
    };

    const handleAddInstruction = () => {
        const trimmed = newInstruction.trim();
        if (!trimmed) {
            toast.error("Instruction cannot be empty");
            return;
        }
        setForm((prev) => ({
            ...prev,
            instructions: [...prev.instructions, trimmed],
        }));
        setNewInstruction("");
    };

    if (!isOpen) return null;

    const instructionCount = form.instructions.length;

    return (
        <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
                onClick={onClose}
            />

            {/* FLEX WRAPPER: Ensures Side-by-Side, Equal Height, and GAP */}
            <div className="relative z-[99991] flex items-stretch max-h-[85vh] transition-all duration-300 gap-1">
                {/* 1. LEFT SIDE: MAIN FORM */}
                <div
                    // Note: Rounding is now consistently rounded-xl since there is a gap
                    className="w-[500px] bg-white flex flex-col overflow-hidden transition-all duration-300 rounded-xl"
                >
                    <div className="flex items-center justify-between px-6 py-2 border-b ">
                        <h2 className="text-xl font-bold">Edit Contest</h2>
                        <button
                            onClick={onClose}
                            className="text-sm text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <form
                        // *** CHANGE: Added custom CSS class 'hide-scrollbar' to suppress the scrollbar visual ***
                        className="flex-1 overflow-y-auto hide-scrollbar"
                        onSubmit={(e) => {
                            e.preventDefault();
                            updateMutation.mutate();
                        }}
                    >
                        <div className="p-4 space-y-4">
                            {/* Contest Images Section */}
                            <div className="flex gap-4">
                                {/* Banner Image (Existing) */}
                                <div className="flex-1">
                                    <label className="text-xs font-semibold  text-gray-500 mb-1 block">
                                        Contest Banner
                                    </label>
                                    <div className="relative h-28 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-100 transition overflow-hidden group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="bannerUpload"
                                            className="hidden"
                                            onChange={(e) =>
                                                handleFileChange(
                                                    e,
                                                    "bannerFile",
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor="bannerUpload"
                                            className="absolute  inset-0 flex flex-col items-center justify-center cursor-pointer"
                                        >
                                            {bannerPreview ? (
                                                <img
                                                    src={getImageSrc(
                                                        bannerPreview,
                                                        bannerFile,
                                                        contest.bannerImage,
                                                    )}
                                                    className="max-w-full h-auto max-h-full object-contain"
                                                    alt="Contest banner preview"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-gray-500 text-sm font-medium">
                                                        Upload Banner
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        Max 2MB
                                                    </p>
                                                </div>
                                            )}
                                            {bannerPreview && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs font-semibold px-3 py-1 border border-white rounded-full">
                                                        Change
                                                    </span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    {errors.bannerFile && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.bannerFile}
                                        </p>
                                    )}
                                </div>

                                {/* Contest Icon (NEW) */}
                                <div className="w-1/4">
                                    <label className="text-xs font-semibold  text-gray-500 mb-1 block">
                                        Contest Icon
                                    </label>
                                    <div className="relative w-full h-28 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-100 transition overflow-hidden group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="iconUpload"
                                            className="hidden"
                                            onChange={(e) =>
                                                handleFileChange(e, "iconFile")
                                            }
                                        />
                                        <label
                                            htmlFor="iconUpload"
                                            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                                        >
                                            {iconPreview ? (
                                                <img
                                                    src={getImageSrc(
                                                        iconPreview,
                                                        iconFile,
                                                        contest.iconImage,
                                                    )}
                                                    className="w-16 h-16 border object-cover rounded-full"
                                                    alt="Contest icon preview"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-gray-500 text-sm font-medium">
                                                        Upload Icon
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        Max 2MB
                                                    </p>
                                                </div>
                                            )}
                                            {iconPreview && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs font-semibold px-3 py-1 border border-white rounded-full">
                                                        Change
                                                    </span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    {errors.iconFile && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.iconFile}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* End Contest Images Section */}

                            {/* Contest Name */}
                            <div>
                                <label className="text-xs font-semibold  text-gray-500 mb-1 block">
                                    Contest Name
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Conducted By */}
                            <div>
                                <label className="text-xs font-semibold  text-gray-500 mb-1 block">
                                    Conducted By
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
                                    value={form.conductedBy}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            conductedBy: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Details Grid */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold  text-gray-500 mb-1 block">
                                        Problems
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
                                        value={form.numberOfProblems}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                numberOfProblems:
                                                    e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold  text-gray-500 mb-1 block">
                                        Duration (mins)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
                                        value={form.durationMinutes}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                durationMinutes: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Languages */}
                            <div>
                                <label className="text-xs font-semibold  text-gray-500 mb-2 block">
                                    Allowed Languages
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGE_OPTIONS.map((opt) => {
                                        const active = form.languages.includes(
                                            opt.value,
                                        );
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    toggleLanguage(opt.value)
                                                }
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                    active
                                                        ? "bg-black text-white border-black"
                                                        : "bg-white text-gray-600 border-gray-200"
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Instruction Trigger */}
                            <div
                                onClick={() =>
                                    setIsInstructionPanelOpen(
                                        !isInstructionPanelOpen,
                                    )
                                }
                                className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition select-none
                                    ${isInstructionPanelOpen ? "bg-black text-white border-black" : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-2 rounded-md border shadow-sm ${isInstructionPanelOpen ? "bg-gray-800 border-gray-700" : "bg-white"}`}
                                    >
                                        <svg
                                            className={`w-4 h-4 ${isInstructionPanelOpen ? "text-white" : "text-gray-600"}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            ></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Instructions
                                        </p>
                                        <p
                                            className={`text-xs ${isInstructionPanelOpen ? "text-gray-300" : "text-gray-500"}`}
                                        >
                                            {instructionCount === 0
                                                ? "Not configured"
                                                : `${instructionCount} added`}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium">
                                    {isInstructionPanelOpen
                                        ? "Close Panel"
                                        : "Edit →"}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 px-6 py-4 border-t bg-white flex justify-end gap-3 z-10 rounded-b-xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition shadow-sm"
                            >
                                {updateMutation.isPending
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2. RIGHT SIDE: INSTRUCTION PANEL (SLIDE OUT SIDE-BY-SIDE) */}
                <div
                    className={`bg-gray-50 rounded-xl border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden
                    ${isInstructionPanelOpen ? "w-[400px] opacity-100" : "w-0 opacity-0"}
                    `}
                >
                    {/* Inner content wrapper ensures the full width when open */}
                    <div className="w-full flex flex-col h-full">
                        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-100 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Instructions
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Rules for the contest
                                </p>
                            </div>
                            <button
                                onClick={() => setIsInstructionPanelOpen(false)}
                                className="text-gray-400 hover:text-gray-800 p-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {form.instructions.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-sm">
                                        No instructions yet.
                                    </p>
                                </div>
                            ) : (
                                form.instructions.map((ins, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-2 group"
                                    >
                                        <span className="text-xs font-mono text-gray-400 mt-2">
                                            {index + 1}.
                                        </span>
                                        <textarea
                                            rows={2}
                                            value={ins}
                                            onChange={(e) =>
                                                handleInstructionChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1 text-sm border-b border-gray-300 focus:border-black outline-none py-1 bg-transparent resize-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeInstruction(index)
                                            }
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t bg-white shrink-0">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newInstruction}
                                    onChange={(e) =>
                                        setNewInstruction(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleAddInstruction()
                                    }
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
                                    placeholder="Type new rule..."
                                />
                                <button
                                    type="button"
                                    onClick={handleAddInstruction}
                                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditContestModal;
