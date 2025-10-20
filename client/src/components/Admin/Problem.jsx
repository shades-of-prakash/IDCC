import React, { useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ProblemHeader from "./ProblemHeader";
import { AuthContext } from "../../contexts/adminAuthContext";

const fetchContests = async () => {
  const res = await fetch("/api/contest/list/without-questions");
  if (!res.ok) throw new Error("Failed to fetch contests");
  const data = await res.json();
  return data.data.map((contest) => ({
    value: contest._id,
    label: contest.name,
  }));
};

const fetchProblemsByAdmin = async (adminId, contestId) => {
  if (!adminId || !contestId) return [];
  const res = await fetch(
    `/api/contest/admin/problems?adminId=${adminId}&contestId=${contestId}`
  );
  if (!res.ok) throw new Error("Failed to fetch problems");
  const data = await res.json();
  return data.data;
};

const Problem = () => {
  const { admin } = useContext(AuthContext);
  const adminId = admin.id;
  const [selectedContest, setSelectedContest] = useState(null);

  const { data: contests = [], isLoading, isError } = useQuery({
    queryKey: ["contestsWithoutQuestions"],
    queryFn: fetchContests,
    staleTime: 60 * 60 * 1000,
  });

  const { data: problems = [] } = useQuery({
    queryKey: ["problemsByAdmin", adminId, selectedContest?.value],
    queryFn: () => fetchProblemsByAdmin(adminId, selectedContest.value),
    enabled: !!selectedContest && !!adminId,
  });

  const [dummyProblems, setDummyProblems] = useState([]);

  useEffect(() => {
    if (problems) {
      setDummyProblems(
        problems.map((p) => ({
          name: p.name || "",
        }))
      );
    }
  }, [problems]);

  const handleAddDummy = () => {
    setDummyProblems((prev) => [...prev, { name: "" }]);
  };

  const handleInputChange = (index, value) => {
    setDummyProblems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: value } : item))
    );
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-red-900 text-white">
        Loading contests...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-red-900 text-white">
        Failed to load contests. Please try again later.
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-900 text-white space-y-4">
        <h1 className="text-2xl font-bold">No Contests Available</h1>
        <p>There are currently no contests without questions.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-red-900">
      <ProblemHeader
        options={contests}
        selected={selectedContest}
        setSelected={setSelectedContest}
        isLoading={isLoading}
        isError={isError}
      />

      {selectedContest && (
        <div className="w-full flex items-center h-14 px-4 py-2 bg-white gap-2">
          <div className="flex gap-2 h-10">
            {dummyProblems.map((_, index) => (
              <div
                key={index}
                className="w-10 h-10 bg-red-900 text-white flex items-center justify-center rounded"
              >
                <span>{index + 1}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddDummy}
            className="w-10 h-10 border-2 border-red-900 text-red-900 flex items-center justify-center rounded hover:bg-red-900 hover:text-white transition"
          >
            +
          </button>
        </div>
      )}

      {selectedContest && dummyProblems.length > 0 && (
        <div className="flex flex-col space-y-4 mt-4 px-4">
          {dummyProblems.map((problem, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded shadow flex flex-col space-y-2"
            >
              <h3 className="font-bold text-red-900">
                Problem {index + 1}
              </h3>
              <input
                type="text"
                value={problem.name}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="Enter problem name..."
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Problem;
