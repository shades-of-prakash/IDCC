import Navbar from "./Navbar";
import ProblemNavbar from "./ProblemNavbar";
import ProblemDescription from "./ProblemDescription";
import ActualPlayground from "./AcutalPlayground";
import TestCase from "./TestCase";
import SplitPane from "react-split-pane";
import ProblemList from "./ProblemList";
import { useState, useRef } from "react";
import { Toaster, toast } from "sonner";

const problems = [
  { id: 1, slug: "Two Sum", points: 1 },
  { id: 2, slug: "Add Two Numbers", points: 2 },
  { id: 3, slug: "Longest Substring Without Repeating Characters", points: 3 },
  { id: 4, slug: "Median of Two Sorted Arrays", points: 9 },
  { id: 5, slug: "Longest Palindromic Substring", points: 3 },
  { id: 6, slug: "Zigzag Conversion", points: 2 },
  { id: 7, slug: "Reverse Integer", points: 10 },
  { id: 8, slug: "String to Integer (atoi)", points: 5 },
  { id: 9, slug: "Regular Expression Matching", points: 8 },
];

const Playground = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(0);

  const toastIdRef = useRef(null);
  const toastTimeoutRef = useRef(null);

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

  return (
    <div className="relative w-screen h-dvh flex flex-col">
      <Navbar />
      <ProblemNavbar
        toggle={toggle}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
      />

      <div className="w-full h-[calc(100%-6rem)] flex overflow-hidden">
        <SplitPane
          allowResize
          split="vertical"
          maxSize={900}
          minSize={600}
          defaultSize="50%"
          className="w-full h-full"
          style={{ height: "calc(100dvh - 6rem)" }}
        >
          <div className="w-full h-full p-2 pr-1.5">
            <ProblemDescription problem={problems[active].slug} />
          </div>

          <SplitPane
            allowResize
            split="horizontal"
            minSize={300}  
            maxSize={480}
            defaultSize="70%"
            pane1Style={{overflow:"auto"}}
            pane2Style={{overflow:"auto"}}
            className="gap-1 p-2 pl-1.5 overflow-hidden" 
          >
            <div className="h-full w-full flex flex-col">
              <ActualPlayground problem={problems[active]} />
            </div>
            <div className="h-full w-full">
              <TestCase />
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