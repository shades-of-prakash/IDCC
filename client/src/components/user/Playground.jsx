import Navbar from "./Navbar";
import ProblemNavbar from "./ProblemNavbar";
import ProblemDescription from "./ProblemDescription";
import ActualPlayground from "./AcutalPlayground";
import TestCase from "./TestCase";
import SplitPane from "react-split-pane";
import ProblemList from "./ProblemList";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import Loader from "../Loader";
import InfoCard from "../InfoCard";
import { useUser } from "../../contexts/UserContext";
import { useUserSubmissions } from "../../contexts/userSubmissionContext";
import TabWarningPopup from "./TabWarningPopup";
import { useFinish } from "../../contexts/finishContext";

const MAX_WARNINGS = 3; // show popup on first 3 switches
const MAX_TAB_SWITCHES = 4; // 4th time => auto submit + finish

const SECRET = 13;

// 🔐 encode key name itself (XOR chars + base64)
const encodeKey = (key) => {
    try {
        const obfuscated = key
            .split("")
            .map((ch) => String.fromCharCode(ch.charCodeAt(0) ^ SECRET))
            .join("");
        return typeof btoa !== "undefined" ? btoa(obfuscated) : key;
    } catch {
        // fallback to original key if something goes wrong
        return key;
    }
};

const TAB_COUNT_KEY = encodeKey("contest_tab_count_v1");
const TAB_AUTO_SUBMITTED_KEY = encodeKey("contest_tab_auto_submitted_v1");

// 🔄 clear ONLY tab-tracking keys (old + encoded)
const clearTabTracking = () => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return;
        const { localStorage } = window;

        // old plain keys
        localStorage.removeItem("contest_tab_count_v1");
        localStorage.removeItem("contest_tab_auto_submitted_v1");

        // new encoded keys
        localStorage.removeItem(TAB_COUNT_KEY);
        localStorage.removeItem(TAB_AUTO_SUBMITTED_KEY);
    } catch (err) {
        console.error(
            "Failed to clear tab tracking keys from localStorage:",
            err,
        );
    }
};

// Clears all saved "code:*" drafts + old + encoded tab keys from localStorage
const clearCodeDrafts = () => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return;

        const { localStorage } = window;
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;

            // remove all code drafts
            if (key.startsWith("code:")) {
                keysToRemove.push(key);
            }

            // remove any older (non-encoded) contest tracking keys
            if (
                key === "contest_tab_count_v1" ||
                key === "contest_tab_auto_submitted_v1"
            ) {
                keysToRemove.push(key);
            }
        }

        // remove collected keys
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // also remove the new encoded keys explicitly
        localStorage.removeItem(TAB_COUNT_KEY);
        localStorage.removeItem(TAB_AUTO_SUBMITTED_KEY);
    } catch (err) {
        console.error("Failed to clear contest items from localStorage:", err);
    }
};

// simple "encoding": XOR with secret, then base64
const encodeCount = (count) => {
    try {
        const obfuscated = (count ^ SECRET).toString(); // XOR
        if (typeof window === "undefined" || !window.btoa) return "";
        return window.btoa(obfuscated); // base64 encode
    } catch {
        return "";
    }
};

const decodeCount = (encoded) => {
    if (!encoded) return 0;
    try {
        if (typeof window === "undefined" || !window.atob) return 0;
        const decoded = window.atob(encoded); // base64 decode
        const num = parseInt(decoded, 10);
        if (Number.isNaN(num)) return 0;
        return num ^ SECRET; // XOR to get original
    } catch {
        return 0;
    }
};

const Playground = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [active, setActive] = useState(0);
    const editorRef = useRef(null);
    const [selectedLang, setSelectedLang] = useState(null);
    const setLang = (lang) => setSelectedLang(lang);
    const toastIdRef = useRef(null);
    const toastTimeoutRef = useRef(null);
    const { user } = useUser();
    const { hasFinishedRef } = useFinish();

    const { refetch } = useUserSubmissions();

    const [isRunning, setIsRunning] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [resultMode, setResultMode] = useState("run");

    const [activeTab, setActiveTab] = useState("testcase");
    const [userTestcases, setUserTestcases] = useState([]);

    // tab monitoring
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

    const [isFinishing, setIsFinishing] = useState(false);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["contestProblems"],
        queryFn: async () => {
            const res = await apiFetch("/api/user/session/problems");
            return res || {};
        },
        staleTime: 5400000,
        gcTime: 5400000,
    });

    const problems = data?.problems || [];
    const languages = data?.languages || [];
    const nProblems = problems.length;

    const toggle = () => setIsOpen((prev) => !prev);

    // ✅ On mount: start fresh tab-tracking state (but keep code drafts)
    useEffect(() => {
        clearTabTracking();
        setTabSwitchCount(0);
        setHasAutoSubmitted(false);
    }, []);

    // restore state from encoded keys (if any set after mount in same tab)
    useEffect(() => {
        if (typeof window === "undefined" || !window.localStorage) return;

        try {
            const storedCount = window.localStorage.getItem(TAB_COUNT_KEY);
            const restoredCount = decodeCount(storedCount);
            if (restoredCount > 0 && restoredCount < MAX_TAB_SWITCHES) {
                setTabSwitchCount(restoredCount);
            }

            const storedAuto = window.localStorage.getItem(
                TAB_AUTO_SUBMITTED_KEY,
            );
            if (storedAuto === "1") {
                setHasAutoSubmitted(true);
            }
        } catch (err) {
            console.error("Failed to restore tab state:", err);
        }
    }, []);

    // default language when data loads
    useEffect(() => {
        if (!selectedLang && languages.length > 0) {
            setSelectedLang(languages[0]);
        }
    }, [languages, selectedLang]);

    const showToast = (message) => {
        if (toastIdRef.current) return;
        toastIdRef.current = toast.info(message, {
            duration: 1500,
            onDismiss: () => {
                toastIdRef.current = null;
            },
        });

        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
            toastIdRef.current = null;
        }, 500);
    };

    const handlePrevious = () => {
        setActive((prev) => {
            if (prev === 0) {
                showToast("You're at the start of the problems.");
                return 0;
            }
            return prev - 1;
        });
    };

    const handleNext = () => {
        setActive((prev) => {
            if (prev === nProblems - 1) {
                showToast("You've reached the end of the problems.");
                return nProblems - 1;
            }
            return prev + 1;
        });
    };

    const handleRunCode = async () => {
        const code = editorRef.current?.getValue();
        if (!code) return;

        if (!selectedLang) {
            toast.error("Please select a language before running the code.");
            return;
        }

        const currentProblem = problems[active];
        if (!currentProblem) return;

        const visibleTests = currentProblem.testcases;

        setIsRunning(true);
        setRunResult(null);
        setResultMode("run");
        setActiveTab("result");

        try {
            const res = await fetch("/api/contest/runcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: selectedLang?.toLowerCase(),
                    code,
                    problem: currentProblem.id,
                    testcases: visibleTests,
                    userTestcases,
                }),
            });

            const data = await res.json();
            setRunResult(data);
        } catch (err) {
            setRunResult({ error: "Failed to run code.", err });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = useCallback(async () => {
        const code = editorRef.current?.getValue();
        if (!code) return;

        if (!selectedLang) {
            toast.error("Please select a language before submitting the code.");
            return;
        }

        const currentProblem = problems[active];
        if (!currentProblem) return;

        if (!user?.user?._id) {
            toast.error("You must be logged in to submit code.");
            return;
        }

        setIsRunning(true);
        setRunResult(null);
        setResultMode("submit");
        setActiveTab("result");

        try {
            const res = await fetch("/api/contest/submitcode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.user._id,
                    language: selectedLang?.toLowerCase(),
                    contestId: user.user.contestId,
                    code,
                    problem: currentProblem.id,
                }),
            });

            const data = await res.json();
            setRunResult(data);
            refetch();
        } catch (err) {
            setRunResult({ error: "Failed to submit code.", err });
        } finally {
            setIsRunning(false);
        }
    }, [active, problems, refetch, selectedLang, user]);

    const handleFinish = useCallback(async () => {
        if (hasFinishedRef.current) return;
        hasFinishedRef.current = true;

        if (isFinishing) return;

        // clear all drafts + tab-related keys when finishing
        clearCodeDrafts();
        clearTabTracking();

        try {
            setIsFinishing(true);

            await fetch("/api/user/contest/finish", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            toast.success(
                "Your contest was auto-submitted due to repeated tab switches. Redirecting to summary...",
            );

            const contestId = user?.user?.contestId;

            if (contestId) {
                window.location.href = `/thankyou/${contestId}`;
            } else {
                window.location.href = "/thankyou";
            }
        } catch (err) {
            console.error(err);
            window.location.href = "/user/login";
        } finally {
            setIsFinishing(false);
        }
    }, [isFinishing, hasFinishedRef]);

    // persist tab count
    useEffect(() => {
        if (typeof window === "undefined" || !window.localStorage) return;
        const encoded = encodeCount(tabSwitchCount);
        try {
            window.localStorage.setItem(TAB_COUNT_KEY, encoded);
        } catch (err) {
            console.error("Failed to persist tab count:", err);
        }
    }, [tabSwitchCount]);

    // persist auto submitted flag
    useEffect(() => {
        if (typeof window === "undefined" || !window.localStorage) return;
        try {
            window.localStorage.setItem(
                TAB_AUTO_SUBMITTED_KEY,
                hasAutoSubmitted ? "1" : "0",
            );
        } catch (err) {
            console.error("Failed to persist auto-submitted flag:", err);
        }
    }, [hasAutoSubmitted]);

    // TAB DETECTION + AUTO SUBMIT + FINISH
    useEffect(() => {
        if (typeof document === "undefined") return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitchCount((prev) => {
                    const next = prev + 1;

                    if (next <= MAX_WARNINGS) {
                        setShowTabWarning(true);
                    }

                    if (
                        next >= MAX_TAB_SWITCHES &&
                        !hasAutoSubmitted &&
                        !hasFinishedRef.current
                    ) {
                        // 💣 hard reset tab keys right when auto-submitting
                        clearTabTracking();

                        setShowTabWarning(false);
                        setHasAutoSubmitted(true);
                        toast.error(
                            "Too many tab switches. Auto-submitting and finishing your contest.",
                        );

                        // 1️⃣ Auto-submit current code
                        handleSubmitCode();

                        // 2️⃣ Finish contest (clears drafts + logout)
                        handleFinish();
                    }

                    return next;
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, [handleSubmitCode, handleFinish, hasAutoSubmitted, hasFinishedRef]);

    return (
        <div className="relative w-screen h-dvh flex flex-col">
            <Navbar problems={problems} setActive={setActive} />

            <ProblemNavbar
                toggle={toggle}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
                handleRunCode={handleRunCode}
                handleSubmitCode={handleSubmitCode}
            />

            <div className="w-full h-[calc(100%-6rem)] flex overflow-x-hidden">
                <SplitPane
                    allowResize
                    split="vertical"
                    maxSize={900}
                    minSize={600}
                    defaultSize="50%"
                    className="w-full h-full"
                    style={{ height: "calc(100dvh - 6rem)", zIndex: 1 }}
                >
                    <div className="w-full h-full p-2 pr-1.5">
                        {isLoading ? (
                            <div className="h-full w-full border border-neutral-300 rounded-lg overflow-y-auto bg-white">
                                <Loader className="h-full" />
                            </div>
                        ) : isError ? (
                            <div className="flex items-center justify-center h-full text-red-500 font-semibold">
                                Failed to load problems:{" "}
                                {error?.message || "Unknown error"}
                            </div>
                        ) : nProblems === 0 ? (
                            <div className="h-full w-full border border-neutral-300 rounded-lg overflow-y-auto bg-white">
                                <InfoCard
                                    title="No Problems Found"
                                    description="There are currently no problems available for this contest. Please check back later or contact the organizer."
                                />
                            </div>
                        ) : (
                            <ProblemDescription
                                problem={problems[active]}
                                sno={active}
                            />
                        )}
                    </div>

                    <SplitPane
                        allowResize
                        split="horizontal"
                        minSize={30}
                        maxSize={480}
                        defaultSize="72%"
                        pane1Style={{ overflow: "auto", minHeight: "6.5%" }}
                        pane2Style={{ overflow: "auto" }}
                        className="gap-1 p-2 pl-1.5 overflow-hidden"
                    >
                        <div className="h-full w-full flex flex-col rounded-lg  border border-neutral-300 overflow-hidden">
                            {nProblems > 0 && (
                                <ActualPlayground
                                    problem={problems[active]}
                                    editorRef={editorRef}
                                    languages={languages}
                                    selectedLang={selectedLang}
                                    onLangChange={setLang}
                                />
                            )}
                        </div>
                        <div className="h-full w-full rounded-lg  border border-neutral-300 overflow-hidden">
                            {nProblems > 0 && (
                                <TestCase
                                    visible={problems[active]}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    isRunning={isRunning}
                                    result={runResult}
                                    onCustomCasesChange={setUserTestcases}
                                    resultMode={resultMode}
                                />
                            )}
                        </div>
                    </SplitPane>
                </SplitPane>
            </div>

            <ProblemList
                isOpen={isOpen}
                toggle={toggle}
                problems={problems}
                active={active}
                setActive={setActive}
            />

            <TabWarningPopup
                visible={showTabWarning}
                count={tabSwitchCount}
                maxWarnings={MAX_WARNINGS}
                onClose={() => setShowTabWarning(false)}
            />
        </div>
    );
};

export default Playground;
