import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useSession } from "../../contexts/SessionContext";
import { useUser } from "../../contexts/UserContext";
import Banner from "../../assets/banner.jpg";

import {
    Clock8,
    CircleQuestionMark,
    UserCog,
    Flame,
    ChevronUp,
    ChevronDown,
    Trophy,
    Info,
    CodeXml,
} from "lucide-react";
import Logo from "../../assets/images/logo.webp";
import { useContests } from "../../contexts/ContestContext";
import Loader from "../Loader";

const DEFAULT_GUIDELINES = [
    {
        title: "General Rules",
        points: [
            "This contest consists of coding problems that must be solved individually.",
            "The timer starts once you begin and cannot be paused.",
            "The contest must be attempted in full-screen mode.",
            "No use of external resources or search engines allowed.",
            "Ensure a stable internet connection to prevent disconnections.",
        ],
    },
    {
        title: "Submission Rules",
        points: [
            "Your solutions are auto-saved, but always click 'Submit' when done.",
            "Each problem can be submitted multiple times; best score is considered.",
            "Read each problem carefully and test your code thoroughly before submission.",
        ],
    },
    {
        title: "Conduct & Integrity",
        points: [
            "The contest is monitored to ensure fairness.",
            "Plagiarism or malpractice will lead to disqualification.",
            "The decision of the organizers is final and binding.",
            "Keep your workspace free from distractions.",
        ],
    },
];

const Instructions = () => {
    const navigate = useNavigate();
    const { startSession, startSessionLoading, session } = useSession();
    const { user } = useUser();

    const {
        allContests,
        runningContests,
        allContestsQuery,
        runningContestsQuery,
        selectedContest,
        setSelectedContest,
    } = useContests();

    const [openIndexes, setOpenIndexes] = useState([0, 1]);

    const contestId = user?.user?.contestId;

    // Pick contest from allContests or runningContests (in case instructions exist only there)
    useEffect(() => {
        if (!contestId) return;

        if (selectedContest && selectedContest._id === contestId) return;

        const allList = allContests || [];
        const runningList = runningContests || [];

        let contest =
            allList.find((c) => c._id === contestId) ||
            runningList.find((c) => c._id === contestId);

        if (contest) {
            setSelectedContest(contest);
        }
    }, [
        contestId,
        allContests,
        runningContests,
        selectedContest,
        setSelectedContest,
    ]);

    const isContestRunning =
        !!selectedContest &&
        !!runningContests?.some((c) => c._id === selectedContest._id);

    const isLoadingContests =
        allContestsQuery.isLoading || runningContestsQuery.isLoading;

    const handleStart = async () => {
        if (!selectedContest) {
            alert("No contest is assigned to your account.");
            return;
        }

        if (!isContestRunning) {
            alert(
                "The contest has not started yet. Please wait for the organizers to start it.",
            );
            return;
        }

        if (session) {
            navigate(`/user/playground`);
            return;
        }

        try {
            await startSession();
            navigate(`/user/playground`);
        } catch (err) {
            console.error("Failed to start session:", err);
            alert(
                `Error starting contest: ${err?.message || "Please try again."}`,
            );
        }
    };

    const toggleDropdown = (index) => {
        setOpenIndexes((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index],
        );
    };

    const DEFAULT_CONTEST = {
        bannerImage: Logo,
        iconImage: Logo,
        name: "Loading...",
        conductedBy: "IDCC",
        numberOfProblems: 0,
        durationMinutes: 0,
        instructions: [],
        languages: [],
    };

    const uiContest = selectedContest || DEFAULT_CONTEST;

    const customInstructions = Array.isArray(uiContest.instructions)
        ? uiContest.instructions
        : uiContest.instructions
          ? [uiContest.instructions]
          : [];

    const contestUi = {
        bannerImage: uiContest.bannerImage || null,
        iconImage: uiContest.iconImage || null,
        name: uiContest.name,
        conductedBy: uiContest.conductedBy,
        numberOfProblems: uiContest.numberOfProblems ?? "-",
        durationText: uiContest.durationMinutes
            ? `${uiContest.durationMinutes} Minutes`
            : "-",
        languages: uiContest.languages || [],
        customInstructions,
    };

    const hasCustomInstructions = contestUi.customInstructions.length > 0;

    // Build the guidelines list (contest specific + default) – NO highlight
    const guidelines = hasCustomInstructions
        ? [
              {
                  title: "Contest Specific Instructions",
                  points: contestUi.customInstructions,
              },
              ...DEFAULT_GUIDELINES,
          ]
        : DEFAULT_GUIDELINES;

    // Auto-open the first section when contest has custom instructions
    useEffect(() => {
        if (hasCustomInstructions) {
            setOpenIndexes((prev) => (prev.includes(0) ? prev : [0, ...prev]));
        }
    }, [hasCustomInstructions]);

    if (isLoadingContests) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader />
            </div>
        );
    }

    const bannerSrc = contestUi.bannerImage
        ? `${import.meta.env.VITE_BACKEND_URL}${contestUi.bannerImage}`
        : Banner;

    const iconSrc =
        typeof contestUi.iconImage === "string" &&
        contestUi.iconImage.startsWith("/contests/")
            ? `${import.meta.env.VITE_BACKEND_URL}${contestUi.iconImage}`
            : contestUi.iconImage || Logo;

    return (
        <div className="flex items-center justify-center h-screen w-full bg-neutral-100 font-sans p-6">
            <div className="flex w-full h-full bg-white rounded-xl overflow-hidden border border-gray-300">
                {/* --- LEFT SIDE: Details & Branding --- */}
                <div className="w-5/12 h-full flex flex-col bg-neutral-50 border-r border-gray-300">
                    {/* Banner Area */}
                    <div className="relative w-full h-48 bg-neutral-200 shrink-0">
                        <img
                            src={bannerSrc}
                            alt="Contest Banner"
                            className="w-full h-full border-b border-gray-300 object-cover"
                        />
                        <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-xl bg-white border border-gray-500 p-2 shadow-lg">
                            <img
                                src={iconSrc}
                                alt="Icon"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col px-6 pt-12 pb-6 flex-1 overflow-y-auto">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-neutral-900 leading-tight">
                                {contestUi.name}
                            </h2>
                            <p className="text-sm text-neutral-600 font-medium mt-1">
                                Organized by {contestUi.conductedBy || "IDCC"}
                            </p>
                        </div>

                        {/* --- THE DETAILS TABLE --- */}
                        <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden mb-6 shrink-0">
                            {/* Row 1: Contest Name */}
                            <div className="flex items-center p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3 w-1/3 text-neutral-700">
                                    <Trophy
                                        size={18}
                                        className="text-neutral-500"
                                    />
                                    <span className="text-sm font-semibold">
                                        Contest Name
                                    </span>
                                </div>
                                <div className="w-2/3 text-sm font-bold text-black text-right truncate">
                                    {contestUi.name}
                                </div>
                            </div>

                            {/* Row 2: Conducted By */}
                            <div className="flex items-center p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3 w-1/3 text-neutral-700">
                                    <UserCog
                                        size={18}
                                        className="text-neutral-500"
                                    />
                                    <span className="text-sm font-semibold">
                                        Conducted By
                                    </span>
                                </div>
                                <div className="w-2/3 text-sm font-bold text-black text-right">
                                    {contestUi.conductedBy}
                                </div>
                            </div>

                            {/* Row 3: Problems */}
                            <div className="flex items-center p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3 w-1/3 text-neutral-700">
                                    <CircleQuestionMark
                                        size={18}
                                        className="text-neutral-500"
                                    />
                                    <span className="text-sm font-semibold">
                                        Problems
                                    </span>
                                </div>
                                <div className="w-2/3 text-sm font-bold text-black text-right">
                                    {contestUi.numberOfProblems} Questions
                                </div>
                            </div>

                            {/* Row 4: Duration */}
                            <div className="flex items-center p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3 w-1/3 text-neutral-700">
                                    <Clock8
                                        size={18}
                                        className="text-neutral-500"
                                    />
                                    <span className="text-sm font-semibold">
                                        Duration
                                    </span>
                                </div>
                                <div className="w-2/3 text-sm font-bold text-black text-right">
                                    {contestUi.durationText}
                                </div>
                            </div>

                            {/* Row 5: Languages */}
                            {contestUi.languages.length > 0 && (
                                <div className="flex items-start sm:items-center p-4">
                                    <div className="flex items-center gap-3 w-1/3 text-neutral-700 pt-1 sm:pt-0">
                                        <CodeXml
                                            size={18}
                                            className="text-neutral-500"
                                        />
                                        <span className="text-sm font-semibold">
                                            Languages
                                        </span>
                                    </div>
                                    <div className="w-2/3 flex flex-wrap justify-end gap-2">
                                        {contestUi.languages.map(
                                            (lang, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-0.5 bg-neutral-100 border border-gray-200 text-neutral-600 text-xs font-bold uppercase rounded-full"
                                                >
                                                    {lang}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-300">
                            <p className="text-sm text-neutral-800 italic font-medium">
                                "Success is not final, failure is not fatal: it
                                is the courage to continue that counts."
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDE: Guidelines & Action --- */}
                <div className="w-8/12 h-full flex flex-col bg-white relative">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-200 bg-white z-10 shrink-0">
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-black">
                            <Flame className="text-orange-600 fill-orange-600" />
                            Contest Guidelines
                        </h1>
                        <p className="text-neutral-600 font-medium text-sm mt-1 ml-8">
                            Please review all rules before beginning.
                        </p>

                        {!selectedContest && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium bg-red-50 text-red-700 p-2 rounded border border-red-200">
                                <Info size={14} /> No contest assigned. Preview
                                mode.
                            </div>
                        )}
                        {selectedContest && !isContestRunning && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-medium bg-orange-50 text-orange-700 p-2 rounded border border-orange-200">
                                <Clock8 size={14} /> Contest has not started
                                yet.
                            </div>
                        )}
                    </div>

                    {/* Scrollable Guidelines List */}
                    <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-4">
                        {guidelines.map((section, index) => (
                            <div
                                key={index}
                                className="border border-gray-300 rounded-lg transition-all duration-200 hover:border-neutral-400"
                            >
                                <button
                                    onClick={() => toggleDropdown(index)}
                                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                                >
                                    <span className="font-bold text-neutral-900">
                                        {section.title}
                                    </span>
                                    {openIndexes.includes(index) ? (
                                        <ChevronUp
                                            size={18}
                                            className="text-neutral-600"
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={18}
                                            className="text-neutral-600"
                                        />
                                    )}
                                </button>

                                {openIndexes.includes(index) && (
                                    <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <ul className="space-y-3">
                                            {section.points.map((point, i) => (
                                                <li
                                                    key={i}
                                                    className="flex gap-3 text-sm text-neutral-700 font-medium leading-relaxed"
                                                >
                                                    <span className="text-neutral-500 font-bold">
                                                        •
                                                    </span>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="h-24"></div>
                    </div>

                    {/* Sticky Footer Action Bar */}
                    <div className="absolute bottom-0 w-full bg-white/95 border-t border-gray-200 p-6 flex justify-end items-center z-20 ">
                        <div className="mr-6 text-right hidden lg:block">
                            <span className="block text-xs text-neutral-600 uppercase font-bold tracking-wider">
                                Status
                            </span>
                            <span
                                className={`text-sm font-bold ${
                                    isContestRunning
                                        ? "text-green-700"
                                        : "text-orange-600"
                                }`}
                            >
                                {session
                                    ? "Resuming..."
                                    : isContestRunning
                                      ? "Ready to Start"
                                      : "Waiting for Organizer"}
                            </span>
                        </div>
                        <button
                            onClick={handleStart}
                            disabled={
                                startSessionLoading ||
                                session ||
                                !selectedContest ||
                                !isContestRunning
                            }
                            className={`
                                min-w-[180px] px-8 py-3 rounded-md font-bold text-white shadow-lg transition-all transform active:scale-95
                                ${
                                    startSessionLoading ||
                                    session ||
                                    !selectedContest ||
                                    !isContestRunning
                                        ? "bg-neutral-500 cursor-not-allowed shadow-none opacity-80"
                                        : "bg-black hover:bg-neutral-900 hover:shadow-xl"
                                }
                            `}
                        >
                            {session ? (
                                "Resume Contest"
                            ) : startSessionLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader className="w-4 h-4" color="white" />{" "}
                                    Starting...
                                </div>
                            ) : !selectedContest ? (
                                "No Contest Found"
                            ) : !isContestRunning ? (
                                "Not Started Yet"
                            ) : (
                                "Start Contest"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Instructions;
