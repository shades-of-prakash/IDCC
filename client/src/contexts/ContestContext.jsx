import React, { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const ContestContext = createContext();

const fetchAllContests = async () => {
    const res = await fetch("/api/contest/list/without-questions");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
};

const fetchRunningContests = async () => {
    const res = await fetch("/api/contest/list/running/without-questions");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
};

export const ContestProvider = ({ children }) => {
    const [selectedContest, setSelectedContest] = useState(null);

    // Fetch ALL contests
    const allContestsQuery = useQuery({
        queryKey: ["all-contests-without-questions"],
        queryFn: fetchAllContests,
        staleTime: 1000 * 60 * 5,
    });

    // Fetch RUNNING contests
    const runningContestsQuery = useQuery({
        queryKey: ["running-contests-without-questions"],
        queryFn: fetchRunningContests,
        staleTime: 1000 * 60 * 5,
    });

    return (
        <ContestContext.Provider
            value={{
                allContests: allContestsQuery.data,
                runningContests: runningContestsQuery.data,

                allContestsQuery,
                runningContestsQuery,

                selectedContest,
                setSelectedContest,
            }}
        >
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
