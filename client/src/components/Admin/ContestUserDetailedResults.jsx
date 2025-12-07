import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import Loader from "../Loader";
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Building2,
    BookOpen,
    ChevronDown,
} from "lucide-react";

// ✅ Shiki (keep github-light)
import { codeToHtml } from "shiki/bundle/web";

const normalizeLanguage = (langRaw) => {
    const lang = (langRaw || "").toLowerCase();

    if (lang.includes("cpp") || lang.includes("c++")) return "cpp";
    if (lang === "c") return "c";
    if (lang.includes("java")) return "java";
    if (lang.includes("python")) return "python";
    if (lang.includes("javascript") || lang === "js") return "javascript";
    if (lang.includes("typescript") || lang === "ts") return "ts";
    if (lang.includes("go")) return "go";
    if (lang.includes("c#") || lang.includes("csharp")) return "csharp";

    return "plaintext";
};

const ContestUserDetailedResults = () => {
    const { contestId, userId } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["contest-user-problems", contestId, userId],
        queryFn: () => apiFetch(`/api/user/${contestId}/${userId}/problems`),
        enabled: !!contestId && !!userId,
    });

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isUserOpen, setIsUserOpen] = useState(false);

    // 🔹 HTML from Shiki
    const [highlightedCode, setHighlightedCode] = useState("");

    // reset selected index when problems change
    useEffect(() => {
        if (data?.problems?.length > 0) {
            setSelectedIndex(0);
        }
    }, [data?.problems?.length]);

    // 🔹 Highlight code with Shiki whenever data / selectedIndex changes
    useEffect(() => {
        let cancelled = false;

        const runHighlight = async () => {
            const problems = data?.problems;
            if (!problems || problems.length === 0) {
                if (!cancelled) setHighlightedCode("");
                return;
            }

            const problem = problems[selectedIndex] || problems[0];
            const code =
                problem?.code || "// No code found for this submission";

            if (!code.trim()) {
                if (!cancelled) {
                    setHighlightedCode("// No code found for this submission");
                }
                return;
            }

            try {
                const lang = normalizeLanguage(problem?.language);

                // ✅ Shiki, still github-light
                const html = await codeToHtml(code, {
                    lang,
                    theme: "github-light",
                });

                if (!cancelled) {
                    setHighlightedCode(html);
                }
            } catch (err) {
                console.error("Shiki highlight error:", err);
                if (!cancelled) {
                    const escaped = code
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;");
                    setHighlightedCode(`<pre>${escaped}</pre>`);
                }
            }
        };

        runHighlight();

        return () => {
            cancelled = true;
        };
    }, [data, selectedIndex]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 text-red-600 text-sm">
                {error?.message || "Failed to load results"}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-4 text-sm text-gray-500">
                No data found for this user.
            </div>
        );
    }

    const { userDetails, problems } = data;

    if (!problems || problems.length === 0) {
        return (
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <ArrowLeft size={18} className="text-gray-700" />
                        <span className="text-gray-700">Back</span>
                    </button>
                    <span className="text-sm text-gray-500">
                        No submissions found for this user in this contest.
                    </span>
                </div>
            </div>
        );
    }

    const selectedProblem = problems[selectedIndex] || problems[0];

    return (
        <div className="w-full h-full">
            <div className="flex flex-col w-full h-full">
                {/* TOP: Back + User details card + Problems card (same UI style) */}
                <div className="flex items-center  justify-between w-full px-3 gap-3 h-14">
                    <div className="w-1/2  flex  items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className=" flex items-center gap-2 px-3 py-2.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50 shrink-0"
                        >
                            <ArrowLeft size={18} className="text-gray-700" />
                            <span className="hidden sm:inline text-gray-700">
                                Back
                            </span>
                        </button>

                        <div className="flex   border border-gray-300 rounded-md ">
                            {userDetails.participants?.map((p, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 text-sm border-r border-gray-300 px-3 py-2"
                                >
                                    <div className="flex gap-2 items-center">
                                        <span className="text-[10px] flex items-center gap-1 uppercase tracking-wide text-gray-500 font-semibold">
                                            <User
                                                size={12}
                                                className="text-gray-600 shrink-0"
                                            />
                                        </span>
                                        <span className="text-[10px] tracking-wide text-gray-500 font-semibold">
                                            :
                                        </span>
                                        <span className="text-gray-900 font-medium text-base flex items-center gap-1">
                                            <span className="truncate max-w-[220px] ">
                                                {p.name}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                ({p.regNo})
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Dropdown for remaining details */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setIsUserOpen((prev) => !prev)
                                    }
                                    className="flex items-center justify-center h-full px-3 gap-2 text-xs sm:text-sm hover:bg-gray-50"
                                >
                                    <span className="font-medium text-gray-800">
                                        More details
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-500 transition-transform ${
                                            isUserOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {isUserOpen && (
                                    <div className="absolute z-10 mt-2 w-64 sm:w-80 bg-white rounded-md shadow-xl text-xs">
                                        <div className="max-h-56 border border-gray-300 rounded-md overflow-auto">
                                            {/* Email */}
                                            <div className="border-b border-gray-300 rounded-t-md px-4 py-2">
                                                <div className="flex items-center gap-1 mb-0.5">
                                                    <Mail
                                                        size={12}
                                                        className="text-gray-500"
                                                    />
                                                    <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                                                        Email
                                                    </span>
                                                </div>
                                                <div className="text-gray-800 text-xs truncate">
                                                    {userDetails.email}
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className="border-b border-gray-300 px-4 py-2">
                                                <div className="flex items-center gap-1 mb-0.5">
                                                    <Phone
                                                        size={12}
                                                        className="text-gray-500"
                                                    />
                                                    <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                                                        Phone
                                                    </span>
                                                </div>
                                                <div className="text-gray-800 text-xs">
                                                    +91 {userDetails.phone}
                                                </div>
                                            </div>

                                            {/* College */}
                                            <div className="border-b border-gray-300 px-4 py-2">
                                                <div className="flex items-center gap-1 mb-0.5">
                                                    <Building2
                                                        size={12}
                                                        className="text-gray-500"
                                                    />
                                                    <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                                                        College
                                                    </span>
                                                </div>
                                                <div className="text-gray-800 text-xs truncate">
                                                    {userDetails.college}
                                                </div>
                                            </div>

                                            {/* Department */}
                                            <div className="rounded-e-md px-4 py-2">
                                                <div className="flex items-center gap-1 mb-0.5">
                                                    <BookOpen
                                                        size={12}
                                                        className="text-gray-500"
                                                    />
                                                    <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                                                        Department
                                                    </span>
                                                </div>
                                                <div className="text-gray-800 text-xs truncate">
                                                    {userDetails.dept}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-1/2 flex border border-gray-300 rounded-md overflow-hidden items-center">
                        {/* Problems title */}
                        <div className="w-24 px-3 py-3 border-r border-gray-300 flex items-center h-full bg-gray-50">
                            <span className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                                Problems
                            </span>
                        </div>

                        {/* Scrollable problem buttons */}
                        <div className="flex-1 overflow-x-auto scroll-2px">
                            <div className="flex flex-nowrap">
                                {[...problems].map((p, idx) => {
                                    const isActive = idx === selectedIndex;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() =>
                                                setSelectedIndex(idx)
                                            }
                                            className={`
                                                flex items-center gap-2 px-4 py-3 text-xs font-semibold border-r border-gray-300
                                                transition-all
                                                ${
                                                    isActive
                                                        ? "bg-blue-50"
                                                        : "bg-white hover:bg-gray-50"
                                                }
                                                flex-shrink-0
                                            `}
                                        >
                                            <span className="text-gray-800">
                                                {idx + 1}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM: DESCRIPTION + CODE */}
                <div className="w-full h-[calc(100%-3.5rem)] px-3 pb-3">
                    <div className="w-full h-full flex gap-2 rounded-md overflow-hidden">
                        {/* Question Description */}
                        <div className="bg-white w-[55%] h-full">
                            <div className="h-full border border-gray-300 overflow-hidden rounded-md">
                                <div className="h-12 bg-white flex items-center  border-b rounded-t-md border-gray-300 px-3">
                                    <div className="flex items-center w-full  justify-between">
                                        <h2 className="text-lg  font-semibold gap-3 flex items-center justify-center text-gray-900">
                                            {selectedProblem.problem?.name ||
                                                "Problem"}

                                            <span
                                                className={`px-2 py-1.5 rounded border text-xs  ${
                                                    selectedProblem.status ===
                                                    "Accepted"
                                                        ? "font-medium bg-green-50 text-green-800 border-green-400"
                                                        : "font-semibold  bg-amber-50 text-amber-700 border-amber-300"
                                                }`}
                                            >
                                                {selectedProblem.status}
                                            </span>
                                        </h2>
                                    </div>
                                </div>

                                <div
                                    className="text-base p-4 h-[calc(100%-3rem)] overflow-y-auto leading-snug
                                               prose prose-neutral max-w-none
                                               [&_p]:mb-3
                                               [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6
                                               [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6
                                               [&_li]:my-1
                                               [&_pre]:whitespace-pre-wrap
                                               [&_*]:break-words
                                               [&_img]:w-[420px] [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto [&_img]:my-10
                                               bg-white"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            selectedProblem.problem
                                                ?.statement ||
                                            "<p>No description available</p>",
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* submitted code */}
                        <div className="w-[45%] bg-white h-full rounded-md border border-gray-300 flex flex-col">
                            <div className="flex rounded-t-md border-b border-gray-300 px-3 h-12 justify-between items-center">
                                <h3 className="text-xs font-semibold text-gray-700">
                                    Submitted Code
                                </h3>
                                <div className="flex items-center gap-4">
                                    <span className="px-2 py-0.5 bg-gray-50 text-lg font-semibold border rounded text-gray-700">
                                        {selectedProblem.language}
                                    </span>
                                    <div className="text-xs text-gray-600 flex gap-4">
                                        <span>
                                            Points:{" "}
                                            <span className="font-semibold text-gray-900">
                                                {selectedProblem.awardedPoints}/
                                                {selectedProblem.problem
                                                    ?.assignedPoints ??
                                                    selectedProblem.maxPoints}
                                            </span>
                                        </span>

                                        <span>
                                            Tests:{" "}
                                            <span className="font-semibold text-gray-900">
                                                {selectedProblem.passedTests}/
                                                {selectedProblem.totalTests}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[calc(100%-3rem)]  overflow-auto font-mono">
                                {highlightedCode ? (
                                    <div
                                        className="[&_pre]:p-3 [&_pre]:m-0 [&_code]:text-base"
                                        dangerouslySetInnerHTML={{
                                            __html: highlightedCode,
                                        }}
                                    />
                                ) : (
                                    <pre className="p-3 whitespace-pre-wrap">
                                        {selectedProblem.code ||
                                            "// No code found for this submission"}
                                    </pre>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestUserDetailedResults;
