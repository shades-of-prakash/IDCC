import React, { useState } from "react";
import { useUserSubmissions } from "../../contexts/userSubmissionContext";
import Timer from "./Timer";
import FinishPopup from "./FinishPopup";

const Navbar = ({ problems, setActive }) => {
    const { refetch } = useUserSubmissions();

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [submittedQuestions, setSubmittedQuestions] = useState([]);
    const [lastSubmittedAt, setLastSubmittedAt] = useState({});
    const [contestId, setContestId] = useState(null);

    const handleFinish = async () => {
        try {
            const result = await refetch();
            // result.data is what queryFn returned:
            // { contestId, questions, submissions, latestSubmissions }
            const data = result?.data || {};

            const questions = data.questions || [];
            const submissions = data.submissions || [];
            const id = data.contestId || "";

            console.log("API response in Navbar:", data);
            console.log("Extracted contestId:", id);

            setSubmittedQuestions(questions);

            const map = {};

            submissions.forEach((s) => {
                let pid = null;

                if (typeof s === "string") {
                    pid = s;
                } else {
                    pid =
                        s.problemId ||
                        s.problem_id ||
                        s.problem ||
                        s.id ||
                        null;
                }

                if (!pid) return;

                const time =
                    s.createdAt || s.submittedAt || s.updatedAt || null;

                if (!map[pid]) {
                    map[pid] = time;
                } else if (time && new Date(time) > new Date(map[pid])) {
                    map[pid] = time;
                }
            });

            setContestId(id);
            setLastSubmittedAt(map);
            setIsPopupOpen(true);
        } catch (err) {
            console.error("Failed to fetch submissions summary", err);
        }
    };

    return (
        <>
            {/* NAVBAR */}
            <div className="w-full h-12 border-b border-gray-300 flex items-center justify-between">
                <div className="flex gap-2 px-4 items-center">
                    <span className="font-semibold">Logiq</span>
                    <div className="w-px bg-red-900 h-4" />
                    <span className="font-semibold">IDCC</span>
                </div>

                <div className="flex gap-4 px-4 items-center">
                    <Timer />

                    <button
                        onClick={handleFinish}
                        className="py-2 px-3 bg-red-900 rounded text-white hover:bg-red-800 transition"
                    >
                        Finish
                    </button>
                </div>
            </div>

            {/* POPUP */}
            <FinishPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                problems={problems}
                setActive={setActive}
                contestId={contestId}
                submittedQuestions={submittedQuestions}
                lastSubmittedAt={lastSubmittedAt}
            />
        </>
    );
};

export default Navbar;
