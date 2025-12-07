import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/fetch";

const UserSubmissionsContext = createContext(null);

const useUserSubmissionsQuery = () => {
    return useQuery({
        queryKey: ["user-submissions"],
        queryFn: async () => {
            const data = await apiFetch("/api/user/submissions");
            // data = { contestId, questions, submissions, latestSubmissions }

            const rawSubmissions = data?.submissions || [];
            const rawLatest = data?.latestSubmissions || [];

            // Normalize shape so we always have { problemId, createdAt }
            const submissions = rawSubmissions.map((s) => ({
                problemId: s.problemId || s.problem, // supports old/new backend
                createdAt: s.createdAt,
            }));

            const latestSubmissions = rawLatest.map((s) => ({
                problemId: s.problemId || s.problem,
                latest: s.latest,
            }));

            return {
                contestId: data?.contestId || "", // ✅ keep contestId
                questions: data?.questions || [],
                submissions, // [{ problemId, createdAt }]
                latestSubmissions, // [{ problemId, latest }]
            };
        },
        staleTime: 1000 * 10,
        refetchOnWindowFocus: false,
    });
};

export const UserSubmissionsProvider = ({ children }) => {
    const { data, isLoading, error, refetch } = useUserSubmissionsQuery();

    const value = {
        contestId: data?.contestId || "", // ✅ expose contestId
        questions: data?.questions || [],
        submissions: data?.submissions || [],
        latestSubmissions: data?.latestSubmissions || [],
        isLoading,
        error,
        refetch,
    };

    return (
        <UserSubmissionsContext.Provider value={value}>
            {children}
        </UserSubmissionsContext.Provider>
    );
};

export const useUserSubmissions = () => {
    const ctx = useContext(UserSubmissionsContext);
    if (!ctx) {
        throw new Error(
            "useUserSubmissions must be used inside <UserSubmissionsProvider>",
        );
    }
    return ctx;
};
