import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import RichTextEditor from "./RichTextEditor";
import InfoCard from "../InfoCard";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../../utils/fetch";
import { toast } from "sonner";
import Loader from "../Loader";

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

    // Once API returns, fill the editor
    useEffect(() => {
        if (problemData) {
            setStatement(problemData.statement || "");
        }
    }, [problemData]);

    // Mutation to save statement
    const mutation = useMutation({
        mutationFn: async ({ problemId, statement }) => {
            return apiFetch("/api/contest/admin/problem/add/statement", {
                method: "POST",
                body: { problemId, statement },
            });
        },
        onSuccess: () => {
            toast.success("Problem statement saved successfully!");
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
        mutation.mutate({ problemId, statement });
    };

    // Loading state
    if (isLoading) {
        return <Loader />;
    }

    // Error state
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

    // Extract problem fields from API
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
                                ? `${contestName} • Conducted by ${conductedBy}`
                                : "Coding Contest Problem"}
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
