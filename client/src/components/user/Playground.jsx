import Navbar from "./Navbar";
import ProblemNavbar from "./ProblemNavbar";
import ProblemDescription from "./ProblemDescription";
import ActualPlayground from "./AcutalPlayground";
import TestCase from "./TestCase";
import SplitPane from "react-split-pane";
import ProblemList from "./ProblemList";
import { useState, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../utils/fetch";
import Loader from "../Loader";
import InfoCard from "../InfoCard";

const Playground = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(0);
  const editorRef = useRef(null);
  const [selectedLang, setSelectedLang] = useState(null);
  const setLang = (lang) => setSelectedLang(lang);
  const toastIdRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [activeTab, setActiveTab] = useState("testcase");

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
  const nProblems = problems.length;
  const toggle = () => setIsOpen((prev) => !prev);

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

    setIsRunning(true);
    setRunResult(null);
    setActiveTab("result");

    try {
      const res = await fetch("/api/contest/runcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLang?.toLowerCase(),
          code,
          input: "",
          problem: problems[active]._id,
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

  return (
    <div className="relative w-screen h-dvh flex flex-col">
      <Navbar />

      <ProblemNavbar
        toggle={toggle}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        handleRunCode={handleRunCode}
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
                Failed to load problems: {error.message || "Unknown error"}
              </div>
            ) : nProblems === 0 ? (
              <div className="h-full w-full border border-neutral-300 rounded-lg overflow-y-auto bg-white">
                <InfoCard
                  title="No Problems Found"
                  description="There are currently no problems available for this contest. Please check back later or contact the organizer."
                />
              </div>
            ) : (
              <ProblemDescription problem={problems[active]} sno={active} />
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
            <div className="h-full w-full flex flex-col">
              <ActualPlayground
                problem={problems[active]}
                editorRef={editorRef}
                onLangChange={setLang}
              />
            </div>
            <div className="h-full w-full">
              <TestCase
                visible={problems[active]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isRunning={isRunning}
                result={runResult}
              />
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
    </div>
  );
};

export default Playground;
