import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

const ContestContext = createContext();

const fetchContests = async () => {
  const res = await fetch("/api/contest/list/without-questions");
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const result = await res.json();
  return result.data; 
};

export const ContestProvider = ({ children }) => {
  const query = useQuery({
    queryKey: ["contests-without-questions"],
    queryFn: fetchContests,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <ContestContext.Provider value={query}>
      {children}
    </ContestContext.Provider>
  );
};

export const useContests = () => {
  const context = useContext(ContestContext);
  if (!context)
    throw new Error("useContests must be used within a ContestProvider");
  return context;
};