import React, { useState } from "react";
import { useUserSubmissions } from "../../contexts/userSubmissionContext";
import Timer from "./Timer";
import FinishPopup from "./FinishPopup";

const Navbar = ({ problems, setActive }) => {
    const { refetch } = useUserSubmissions();

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [submittedQuestions, setSubmittedQuestions] = useState([]);
    const [lastSubmittedAt, setLastSubmittedAt] = useState({});

    const handleFinish = async () => {
        try {
            const result = await refetch();
            const questions = result?.data?.questions || [];
            const submissions = result?.data?.submissions || [];

            setSubmittedQuestions(questions);

            // Build map: problemId -> lastSubmittedAt
            const map = {};

            submissions.forEach((s) => {
                // with your new API shape this is usually s.problem & s.createdAt
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
                submittedQuestions={submittedQuestions}
                lastSubmittedAt={lastSubmittedAt}
            />
        </>
    );
};

export default Navbar;
