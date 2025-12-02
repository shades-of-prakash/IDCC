import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ContestModal = ({ close }) => {
  const [name, setName] = useState("");
  const [conductedBy, setConductedBy] = useState("IDCC");
  const [numberOfProblems, setNumberOfProblems] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [file, setFile] = useState(null);
  const [languages, setLanguages] = useState([]);

  // ❗ Local validation errors
  const [errors, setErrors] = useState({});

  const languageOptions = [
    { label: "Python", value: "python" },
    { label: "C", value: "c" },
    { label: "C++", value: "cpp" },
    { label: "Java", value: "java" },
  ];

  const toggleLanguage = (lang) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
    // Clear language error when user selects something
    setErrors((prev) => ({ ...prev, languages: undefined }));
  };

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];

    if (!uploaded) return;

    // Max 2MB check (based on your hint text)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (uploaded.size > MAX_SIZE) {
      setErrors((prev) => ({
        ...prev,
        file: "File size must be 2MB or less.",
      }));
      setFile(null);
      return;
    }

    setErrors((prev) => ({ ...prev, file: undefined }));
    setFile(uploaded);
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

      if (file) formData.append("bannerImage", file);

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
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      close(false);
    },
  });

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Contest name is required.";
    }

    const numProblems = Number(numberOfProblems);
    if (!numberOfProblems || Number.isNaN(numProblems) || numProblems <= 0) {
      newErrors.numberOfProblems =
        "Number of problems must be a positive number.";
    }

    const duration = Number(durationMinutes);
    if (!durationMinutes || Number.isNaN(duration) || duration <= 0) {
      newErrors.durationMinutes =
        "Duration must be a positive number (in minutes).";
    }

    if (!languages.length) {
      newErrors.languages = "Select at least one allowed language.";
    }

    // Optional: require banner image
    // if (!file) {
    //   newErrors.file = "Banner image is required.";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    console.log("ggg", languages);

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
      <div className="w-[500px] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Create Contest
          </h2>
          <button
            onClick={() => close(false)}
            className="text-gray-500 hover:text-gray-800"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Server error */}
          {mutation.isError && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
              {mutation.error.message || "Something went wrong"}
            </div>
          )}

          {/* Server success */}
          {mutation.isSuccess && (
            <div className="text-green-600 text-sm bg-green-50 border border-green-200 px-3 py-2 rounded">
              Contest created successfully!
            </div>
          )}

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
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Enter contest name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
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
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. IDCC"
            />
          </div>

          {/* Number of Problems */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Coding Problems
            </label>
            <input
              type="number"
              value={numberOfProblems}
              onChange={(e) => {
                setNumberOfProblems(e.target.value);
                if (errors.numberOfProblems) {
                  setErrors((prev) => ({
                    ...prev,
                    numberOfProblems: undefined,
                  }));
                }
              }}
              className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                errors.numberOfProblems ? "border-red-400" : "border-gray-300"
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

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (in minutes)
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => {
                setDurationMinutes(e.target.value);
                if (errors.durationMinutes) {
                  setErrors((prev) => ({
                    ...prev,
                    durationMinutes: undefined,
                  }));
                }
              }}
              className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
                errors.durationMinutes ? "border-red-400" : "border-gray-300"
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

          {/* Language Pills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowed Languages
            </label>

            <div className="flex flex-wrap gap-2">
              {languageOptions.map((opt) => {
                const isActive = languages.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => toggleLanguage(opt.value)}
                    className={`px-3 py-1 rounded-full border text-sm transition
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
              <p className="mt-1 text-xs text-red-600">{errors.languages}</p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Banner Image
            </label>
            <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg px-6 py-2 cursor-pointer hover:border-black transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="fileUpload"
              />
              <label
                htmlFor="fileUpload"
                className="flex flex-col items-center cursor-pointer"
              >
                {file ? (
                  <>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-32 h-20 object-contain rounded mb-2"
                    />
                    <span className="text-sm text-gray-600">{file.name}</span>
                  </>
                ) : (
                  <>
                    <div className="text-gray-500 text-sm">
                      Drag & drop or click to upload
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      PNG, JPG up to 2MB
                    </div>
                  </>
                )}
              </label>
            </div>
            {errors.file && (
              <p className="mt-1 text-xs text-red-600">{errors.file}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-2 border-t bg-gray-50">
          <button
            onClick={() => close(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestModal;
