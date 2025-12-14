// Problem.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import RichTextEditor from "./RichTextEditor";
import InfoCard from "../InfoCard";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../../utils/fetch";
import { toast } from "sonner";
import Loader from "../Loader";

import { useEditorImages } from "../../contexts/EditorImagesContext";
import { extractImageSrcsFromHtml } from "../../utils/extractImageSrcsFromHtml";

const Problem = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();

    const {
        data: problemData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["problem", problemId],
        queryFn: () => apiFetch(`/api/contest/admin/problem/get/${problemId}`),
        enabled: !!problemId,
    });

    const [statement, setStatement] = useState("");
    const { images, removeImagesNotIn, clearImages } = useEditorImages();

    useEffect(() => {
        if (problemData) {
            setStatement(problemData.statement || "");
        }
    }, [problemData]);

    const mutation = useMutation({
        mutationFn: async (formData) => {
            // Using normal fetch as requested to handle FormData properly
            // The browser automatically sets Content-Type to multipart/form-data
            const response = await fetch(
                "/api/contest/admin/problem/add/statement",
                {
                    method: "POST",
                    body: formData,
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to save problem");
            }

            return response.json();
        },
        onSuccess: () => {
            toast.success("Problem statement saved successfully!");
            clearImages(); // Clear context after successful upload
        },
        onError: (err) => {
            toast.error(err.message || "Something went wrong");
        },
    });

    const submitProblem = () => {
        if (!statement.trim()) {
            toast.error("Write a statement before submitting");
            return;
        }

        // 1. Identify which images are actually used in the current editor state
        const imageSrcsInHtml = extractImageSrcsFromHtml(statement);

        // 2. Clean up context (remove unused images)
        removeImagesNotIn(imageSrcsInHtml);

        // 3. Find images that need to be uploaded (images with File objects)
        const usedNewImages = images.filter((img) =>
            imageSrcsInHtml.includes(img.src),
        );

        const formData = new FormData();
        formData.append("problemId", problemId);

        let finalStatement = statement;

        // 4. Process Images
        usedNewImages.forEach((img, index) => {
            if (img.file) {
                // Generate a unique filename that links the HTML placeholder to the File
                const ext = img.file.name.split(".").pop() || "png";
                // timestamp-index.extension
                const uniqueFilename = `${Date.now()}-${index}.${ext}`;

                // Replace the Base64 src in the HTML with the unique filename
                // The backend will use this filename to find where to put the final public URL
                finalStatement = finalStatement.replace(
                    img.src,
                    uniqueFilename,
                );

                // Append the file to FormData with the specific filename
                formData.append("images", img.file, uniqueFilename);
            }
        });

        // 5. Append the modified HTML statement
        formData.append("statement", finalStatement);

        mutation.mutate(formData);
    };

    if (isLoading) return <Loader />;

    if (isError || !problemData) {
        return (
            <InfoCard
                title="Problem Not Found"
                description="Unable to fetch this problem. It may not exist."
                buttonText="Go Back"
                navigateTo="/admin"
                className="bg-white"
            />
        );
    }

    const { name, contestName, conductedBy, contestId } = problemData;

    return (
        <div className="w-full h-full flex flex-col bg-gray-50">
            {/* HEADER */}
            <div className="w-full h-16 flex justify-between items-center px-4 border-b border-gray-300 bg-white">
                <div className="flex gap-3 items-center">
                    <button onClick={() => navigate(-1)}>
                        <ArrowLeft
                            size={22}
                            className="hover:text-black text-black/80"
                        />
                    </button>
                    <div className="flex flex-col">
                        <p>
                            Add the problem statement for
                            <span className="ml-2 font-semibold text-blue-800 text-sm">
                                "{name}"
                            </span>
                        </p>
                        <p className="text-gray-500 text-sm">
                            {contestName
                                ? `${contestName} • ${conductedBy}`
                                : "Coding Contest"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={submitProblem}
                    disabled={mutation.isPending}
                    className="h-10 px-3 rounded-md bg-black hover:bg-black/90 text-white font-medium disabled:opacity-50"
                >
                    {mutation.isPending ? "Saving..." : "Submit"}
                </button>
            </div>

            {/* EDITOR */}
            <div className="w-full h-[calc(100%-4rem)] p-2">
                <div className="w-full h-full bg-white rounded-md">
                    <RichTextEditor
                        contestId={contestId}
                        value={statement}
                        onChange={(html) => setStatement(html)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Problem;
