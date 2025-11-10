import { useNavigate } from "react-router";
import { useSession } from "../../contexts/SessionContext";
import { useUser } from "../../contexts/UserContext";
import {
  Clock8,
  CircleQuestionMark,
  UserCog,
  Flame,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Logo from "../../assets/images/logo.webp";
import { useContests } from "../../contexts/ContestContext";
import { useState } from "react";
import Loader from "../Loader";

const Instructions = () => {
  const navigate = useNavigate();
  const { startSession, startSessionLoading, session } = useSession();
  const { user } = useUser();
  const { data: contests } = useContests();

  const [openIndexes, setOpenIndexes] = useState([0]);

  const selectedContest = contests?.find(
    (contest) => contest._id === user.user.contestId,
  );

  const handleStart = async () => {
    if (session) {
      navigate(`/user/playground`);
      return;
    }

    try {
      await startSession();
      navigate(`/user/playground`);
    } catch (err) {
      console.error("Failed to start session:", err);
      alert(`Error starting contest: ${err.message || "Please try again."}`);
    }
  };

  const toggleDropdown = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const guidelines = [
    [
      "This contest consists of coding problems that must be solved individually by each participant.",
      "The total duration is fixed. The timer starts once you begin and cannot be paused.",
      "The contest must be attempted in full-screen mode. Exiting full-screen may lead to auto-submission.",
      "No use of external resources, search engines, or communication tools is allowed during the contest.",
      "Avoid switching tabs or minimizing the window; multiple violations may result in disqualification.",
      "Ensure a stable internet connection to prevent disconnections.",
    ],
    [
      "Your solutions are auto-saved, but always click 'Submit' when done.",
      "Each problem can be submitted multiple times; your best score will be considered.",
      "Read each problem carefully and test your code thoroughly before submission.",
      "Manage your time effectively and prioritize accuracy over speed.",
    ],
    [
      "The contest is monitored to ensure fairness and integrity.",
      "Any form of plagiarism or malpractice will lead to disqualification.",
      "The decision of the organizers is final and binding.",
      "If you encounter technical issues, contact support immediately.",
      "Keep your workspace free from distractions during the contest.",
    ],
  ];

  const guidelineTitles = [
    "General Rules",
    "Submission Rules",
    "Conduct and Disqualification",
  ];

  return (
    <div className="flex items-center justify-center h-screen p-4 bg-white">
      {/* Left side */}
      <div className="flex flex-col w-1/2 h-full rounded-s-md  border border-neutral-300 border-r-gray-200  p-4">
        <div className="w-[80px] flex items-center justify-center rounded-full border border-neutral-300 text-black p-1">
          <span className="text-sm font-bold">Logiq</span>
        </div>

        <div className="w-max flex gap-3 items-center rounded-md my-10">
          <div className="w-12 h-12 items-center justify-center flex rounded-md bg-white border border-neutral-400">
            <img
              src={
                selectedContest.bannerImage === null
                  ? Logo
                  : selectedContest.bannerImage
              }
              alt=""
              className="w-6"
            />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl font-bold tracking-wider">
              {selectedContest.name}
            </span>
            <span className="text-sm">{selectedContest.conductedBy}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="font-semibold">
            <span>Contest Details</span>
          </div>
          <div className="flex flex-col font-medium w-[calc(100%-6rem)] border border-neutral-400 rounded-md">
            <div className="flex items-center border-b border-neutral-400">
              <div className="flex items-center gap-2 w-[70%] border-r border-neutral-400 p-4">
                <UserCog size={16} />
                <span>Conducted By</span>
              </div>
              <span className="flex-1 flex items-center justify-center">
                {selectedContest.conductedBy}
              </span>
            </div>
            <div className="flex items-center border-b border-neutral-400">
              <div className="flex items-center gap-2 w-[70%] border-r border-neutral-400 p-4">
                <CircleQuestionMark size={16} />
                <span>Number of Problems</span>
              </div>
              <span className="flex-1 flex items-center justify-center">
                {selectedContest.numberOfProblems}
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center gap-2 w-[70%] border-r border-neutral-400 p-4">
                <Clock8 size={16} />
                <span>Duration</span>
              </div>
              <span className="flex-1 flex items-center justify-center">
                {selectedContest.durationMinutes}m
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 w-[calc(100%-6rem)] rounded-xl">
          <div className="flex flex-col gap-4">
            <p className="text-xl font-semibold text-neutral-800">Welcome!</p>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-neutral-700 text-justify">
                We’re excited to have you join Logiq, a platform built for
                engaging and challenging coding competitions. This is your
                chance to showcase your logic, creativity, and coding expertise.
              </p>
              <p className="text-sm text-neutral-700 text-justify">
                Take your time to understand each problem, plan wisely, write
                clean, efficient code — stay focused, think smart, and most
                importantly, enjoy the challenge!
              </p>
            </div>
            <p className="text-base text-left text-neutral-600 font-medium">
              The Logiq Team
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex flex-col  h-full rounded-e-md border border-gray-300  border-l-0 overflow-y-auto">
        <div className="flex flex-col justify-center p-6 gap-2">
          <h1 className="text-2xl font-bold  flex items-center gap-1">
            <Flame />
            Guidelines
          </h1>
          <p className="w-max text-sm text-gray-600">
            Please read all instructions carefully before starting the contest.
          </p>
        </div>

        <div className=" overflow-y-auto flex flex-col gap-3  px-6">
          {guidelines.map((items, index) => (
            <div key={index} className=" border border-neutral-300 rounded-md">
              <button
                onClick={() => toggleDropdown(index)}
                className="w-full text-left px-4 py-3 font-medium flex justify-between items-center"
              >
                <span>{guidelineTitles[index]}</span>
                {openIndexes.includes(index) ? (
                  <ChevronUp size={18} className="text-neutral-600" />
                ) : (
                  <ChevronDown size={18} className="text-neutral-500" />
                )}
              </button>

              {openIndexes.includes(index) && (
                <ul className="flex flex-col rounded-md leading-6 py-2 px-4 bg-white gap-2 text-sm transition-all duration-300 ease-in-out">
                  {items.map((point, i) => (
                    <li key={i} className="flex gap-2">
                      <span>&bull;</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="flex  px-6 py-1 justify-start  items-center h-24">
          <button
            onClick={handleStart}
            disabled={startSessionLoading || session}
            className={`w-[160px] py-2 rounded-md font-medium transition-all
            ${
              startSessionLoading || session
                ? "bg-black/90 text-white cursor-not-allowed"
                : "bg-black/90 text-white hover:bg-black"
            }`}
          >
            {session ? (
              "Resume Contest"
            ) : startSessionLoading ? (
              <Loader className="w-full h-full" color="white" />
            ) : (
              "Start Contest"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
