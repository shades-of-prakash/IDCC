import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useNavigate, useParams } from "react-router";
import tick from "../../assets/tick.lottie";

const ratingOptions = [1, 2, 3, 4, 5];

const questions = [
    "How clear was the problem statement?",
    "How balanced was the difficulty?",
    "How strong were the test cases?",
    "How smooth was the coding environment?",
    "How satisfied are you overall?",
];

export default function ContestFeedback() {
    const { id: contestId } = useParams();
    console.log("contest", contestId);
    const navigate = useNavigate();

    const [answers, setAnswers] = useState(Array(questions.length).fill(0));
    const [feedback, setFeedback] = useState("");

    /* ---------- LOGIC ONLY ---------- */
    const isFormValid = answers.every((a) => a > 0);

    const updateRating = (qIndex, value) => {
        const updated = [...answers];
        updated[qIndex] = value;
        setAnswers(updated);
    };

    const feedbackMutation = useMutation({
        mutationFn: async ({ contestId, answers, feedback }) => {
            const res = await fetch("/api/user/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    contestId,
                    answers,
                    feedback,
                }),
            });

            const data = await res.json();

            if (!res.ok || data?.success === false) {
                throw new Error(data?.message || "Failed to submit feedback");
            }

            return data;
        },

        onSuccess: (data) => {
            if (data?.success) {
                navigate("/user/login", { replace: true });
            }
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isFormValid) return;

        feedbackMutation.mutate({ contestId, answers, feedback });
    };

    const handleSkip = () => {
        navigate("/user/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 flex justify-center items-center">
            <div className="w-[1000px]">
                <div className="flex rounded-md border border-gray-300 items-stretch">
                    {/* LEFT CARD */}
                    <div className="border-r border-gray-300 rounded-l-md p-8 w-[40%] flex flex-col items-center justify-between text-center">
                        <div className="flex flex-col items-center mt-6">
                            <div className="w-36 h-36">
                                <DotLottieReact
                                    src={tick}
                                    autoplay
                                    loop={false}
                                />
                            </div>

                            <h2 className="text-xl w-80 mb-4 font-semibold">
                                Response submitted successfully!
                            </h2>

                            <p className="text-sm text-slate-600 mt-3 max-w-xs">
                                Thank you for participating in this contest.
                                <br />
                                Take a moment to share how the contest felt so
                                we can improve future rounds.
                            </p>

                            <div className="mt-4 text-xs text-slate-500 max-w-xs">
                                This captures your overall contest experience.
                            </div>
                        </div>

                        <div className="mt-6 text-[11px] text-slate-500">
                            <p>Help us improve by sharing your feedback.</p>
                            <p className="mt-1 font-medium">
                                Logiq Team · IDCC
                            </p>
                        </div>
                    </div>

                    {/* RIGHT CARD */}
                    <form
                        onSubmit={handleSubmit}
                        className="w-[60%] p-6 bg-white flex flex-col gap-4 rounded-r-md"
                    >
                        <div>
                            <h2 className="text-base font-semibold mb-2">
                                Feedback
                            </h2>
                            <p className="text-xs text-slate-500 mb-4">
                                Rate your experience (1 = Poor, 5 = Excellent)
                            </p>

                            <div className="flex flex-col gap-5">
                                {questions.map((q, qIndex) => (
                                    <div
                                        key={qIndex}
                                        className={`flex justify-between items-center pb-4 ${
                                            qIndex !== questions.length - 1
                                                ? "border-b border-slate-200"
                                                : ""
                                        }`}
                                    >
                                        <p className="text-sm font-medium w-2/3 pr-4">
                                            {qIndex + 1}. {q}
                                        </p>

                                        <div className="flex gap-2">
                                            {ratingOptions.map((num) => (
                                                <button
                                                    type="button"
                                                    key={num}
                                                    onClick={() =>
                                                        updateRating(
                                                            qIndex,
                                                            num,
                                                        )
                                                    }
                                                    className={`h-8 w-8 rounded-full border text-sm flex items-center justify-center transition ${
                                                        answers[qIndex] === num
                                                            ? "bg-black text-white border-black"
                                                            : "border-slate-300 text-slate-600 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional feedback */}
                        <div className="mt-2">
                            <label className="text-sm font-semibold">
                                Additional feedback (optional)
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={3}
                                placeholder="Share anything about clarity, test cases, environment, or improvements…"
                                className="resize-none w-full mt-2 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-2 mt-2">
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100"
                                disabled={feedbackMutation.isPending}
                            >
                                Skip
                            </button>

                            <button
                                type="submit"
                                className="w-20 px-5 py-2 bg-black text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-70"
                                disabled={
                                    !isFormValid || feedbackMutation.isPending
                                }
                            >
                                {feedbackMutation.isPending ? "..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
