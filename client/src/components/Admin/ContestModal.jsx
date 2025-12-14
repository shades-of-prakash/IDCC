import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming you use sonner for notifications

const LANGUAGE_OPTIONS = [
    { label: "Python", value: "python" },
    { label: "C", value: "c" },
    { label: "C++", value: "cpp" },
    { label: "Java", value: "java" },
];

const ContestModal = ({ close }) => {
    const [name, setName] = useState("");
    const [conductedBy, setConductedBy] = useState("IDCC");
    const [numberOfProblems, setNumberOfProblems] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("");

    // --- FILE STATE ---
    const [bannerFile, setBannerFile] = useState(null);
    const [iconFile, setIconFile] = useState(null);

    const [bannerPreview, setBannerPreview] = useState("");
    const [iconPreview, setIconPreview] = useState("");

    const [languages, setLanguages] = useState([]);

    // Local validation errors
    const [errors, setErrors] = useState({});

    const toggleLanguage = (lang) => {
        setLanguages((prev) =>
            prev.includes(lang)
                ? prev.filter((l) => l !== lang)
                : [...prev, lang],
        );
        setErrors((prev) => ({ ...prev, languages: undefined }));
    };

    const handleFileChange = (e, fileType) => {
        const uploaded = e.target.files[0];

        if (!uploaded) return;

        // Max 2MB check
        const MAX_SIZE = 2 * 1024 * 1024;
        if (uploaded.size > MAX_SIZE) {
            setErrors((prev) => ({
                ...prev,
                [fileType]: "File size must be 2MB or less.",
            }));

            if (fileType === "bannerFile") {
                setBannerFile(null);
                setBannerPreview("");
            }
            if (fileType === "iconFile") {
                setIconFile(null);
                setIconPreview("");
            }
            return;
        }

        const previewUrl = URL.createObjectURL(uploaded);

        if (fileType === "bannerFile") {
            setBannerFile(uploaded);
            setBannerPreview(previewUrl);
        }
        if (fileType === "iconFile") {
            setIconFile(uploaded);
            setIconPreview(previewUrl);
        }

        setErrors((prev) => ({ ...prev, [fileType]: undefined }));
    };

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (newContest) => {
            const formData = new FormData();

            Object.entries(newContest).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            // Append files to FormData
            if (bannerFile) formData.append("bannerImage", bannerFile);
            if (iconFile) formData.append("iconImage", iconFile); // Assuming your backend accepts 'iconImage'

            const res = await fetch("/api/contest/create", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to create contest");
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Contest created successfully!");
            queryClient.invalidateQueries({ queryKey: ["contests"] });
            close(false);
        },
        onError: (error) => {
            // toast.error(error.message || "Failed to create contest");
        },
    });

    const validate = () => {
        const newErrors = {};

        if (!name.trim()) newErrors.name = "Contest name is required.";

        const numProblems = Number(numberOfProblems);
        if (
            !numberOfProblems ||
            Number.isNaN(numProblems) ||
            numProblems <= 0
        ) {
            newErrors.numberOfProblems =
                "Problems count must be a positive number.";
        }

        const duration = Number(durationMinutes);
        if (!durationMinutes || Number.isNaN(duration) || duration <= 0) {
            newErrors.durationMinutes =
                "Duration must be a positive number (in minutes).";
        }

        if (!languages.length) {
            newErrors.languages = "Select at least one allowed language.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        mutation.mutate({
            name,
            conductedBy,
            numberOfProblems: Number(numberOfProblems),
            durationMinutes: Number(durationMinutes),
            languages: JSON.stringify(languages),
        });
    };

    const isSubmitting = mutation.isPending;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="w-[550px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">
                        Create New Contest
                    </h2>
                    <button
                        onClick={() => close(false)}
                        className="text-gray-400 hover:text-gray-800 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
                        disabled={isSubmitting}
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-6 overflow-y-auto"
                >
                    {/* Notifications/Errors */}
                    {mutation.isError && (
                        <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                            {mutation.error.message || "Something went wrong"}
                        </div>
                    )}
                    {mutation.isSuccess && (
                        <div className="text-green-600 text-sm bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                            Contest created successfully!
                        </div>
                    )}

                    {/* Images section - MATCHED WITH EDIT MODAL */}
                    <div className="flex gap-4">
                        {/* Banner Image */}
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                Contest Banner
                            </label>
                            <div className="relative h-28 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-100 transition overflow-hidden group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="bannerUpload"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFileChange(e, "bannerFile")
                                    }
                                />
                                <label
                                    htmlFor="bannerUpload"
                                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                                >
                                    {bannerPreview ? (
                                        <>
                                            <img
                                                src={bannerPreview}
                                                className="max-w-full h-auto max-h-full object-contain"
                                                alt="Contest banner preview"
                                            />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-semibold px-3 py-1 border border-white rounded-full">
                                                    Change
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-gray-500 text-sm font-medium">
                                                Upload Banner
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                PNG, JPG up to 2MB
                                            </p>
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

                        {/* Contest Icon */}
                        <div className="w-1/4">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">
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
                                        <>
                                            <img
                                                src={iconPreview}
                                                className="w-16 h-16 border object-cover rounded-full"
                                                alt="Contest icon preview"
                                            />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-semibold px-3 py-1 border border-white rounded-full">
                                                    Change
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-gray-500 text-sm font-medium">
                                                Upload Icon
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                PNG, JPG up to 2MB
                                            </p>
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

                    {/* Contest Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Contest Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors((prev) => ({
                                    ...prev,
                                    name: undefined,
                                }));
                            }}
                            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                                errors.name
                                    ? "border-red-400"
                                    : "border-gray-300"
                            }`}
                            placeholder="Enter contest name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Conducted By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Conducted By
                        </label>
                        <input
                            type="text"
                            value={conductedBy}
                            onChange={(e) => setConductedBy(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="e.g. IDCC"
                        />
                    </div>

                    {/* Problems & Duration */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Number of Problems
                            </label>
                            <input
                                type="number"
                                value={numberOfProblems}
                                onChange={(e) => {
                                    setNumberOfProblems(e.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        numberOfProblems: undefined,
                                    }));
                                }}
                                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                                    errors.numberOfProblems
                                        ? "border-red-400"
                                        : "border-gray-300"
                                }`}
                                placeholder="e.g. 5"
                                min={1}
                            />
                            {errors.numberOfProblems && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.numberOfProblems}
                                </p>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Duration (in minutes)
                            </label>
                            <input
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => {
                                    setDurationMinutes(e.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        durationMinutes: undefined,
                                    }));
                                }}
                                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                                    errors.durationMinutes
                                        ? "border-red-400"
                                        : "border-gray-300"
                                }`}
                                placeholder="e.g. 120"
                                min={1}
                            />
                            {errors.durationMinutes && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.durationMinutes}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Languages */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Allowed Languages
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {LANGUAGE_OPTIONS.map((opt) => {
                                const isActive = languages.includes(opt.value);
                                return (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        onClick={() =>
                                            toggleLanguage(opt.value)
                                        }
                                        className={`px-3 py-1 rounded-full border text-sm transition font-medium
                                            ${
                                                isActive
                                                    ? "bg-black text-white border-black"
                                                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                            }
                                        `}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.languages && (
                            <p className="mt-2 text-xs text-red-600">
                                {errors.languages}
                            </p>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 shrink-0">
                    <button
                        type="button"
                        onClick={() => close(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition shadow-md"
                    >
                        {isSubmitting ? "Creating..." : "Create Contest"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContestModal;
