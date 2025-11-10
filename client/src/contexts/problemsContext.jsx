import React, { createContext, useContext, useState } from "react";

const ProblemsContext = createContext();

export const ProblemsProvider = ({ initialProblems = [], children }) => {
  const [problems, setProblems] = useState(initialProblems);

  const updateProblem = (problemId, newData) => {
    setProblems((prev) =>
      prev.map((p) => (p._id === problemId ? { ...p, ...newData } : p)),
    );
  };

  return (
    <ProblemsContext.Provider value={{ problems, setProblems, updateProblem }}>
      {children}
    </ProblemsContext.Provider>
  );
};

export const useProblems = () => useContext(ProblemsContext);
