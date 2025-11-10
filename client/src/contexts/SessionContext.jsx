// src/contexts/SessionContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../utils/fetch";
import { formatTime } from "../utils/time";

const SessionContext = createContext();
export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await apiFetch("/api/user/session/get", {
          method: "GET",
          credentials: "include",
        });
        if (res && res.sessionId) {
          const { sessionId, remainingTime, user, contest } = res;
          setSession({ sessionId, user, contest });
          setRemainingTime(remainingTime);
        } else {
          setSession(null);
          setRemainingTime(0);
        }
      } catch {
        setSession(null);
        setRemainingTime(0);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const startSessionMutation = useMutation({
    mutationFn: async () =>
      apiFetch("/api/user/session/start", {
        method: "POST",
        credentials: "include",
      }),
    onSuccess: (data) => {
      const { sessionId, remainingTime, user, contest } = data;
      setSession({ sessionId, user, contest });
      setRemainingTime(remainingTime);
    },
    onError: () => {
      setSession(null);
      setRemainingTime(0);
    },
  });

  const updateTimeMutation = useMutation({
    mutationFn: (payload) =>
      apiFetch("/api/user/session/update-elapsed", {
        method: "PUT",
        body: payload,
        credentials: "include",
      }),
    onSuccess: (data) => {
      if (data.success) setRemainingTime(data.data.remainingTime);
    },
  });

  const value = {
    session,
    setSession,
    remainingTime,
    setRemainingTime,
    formatTime,
    startSession: startSessionMutation.mutateAsync,
    updateElapsedTime: updateTimeMutation.mutateAsync,
    startSessionLoading: startSessionMutation.isPending,
    loading,
  };

  return (
    <SessionContext.Provider value={value}>
      {!loading && children}
    </SessionContext.Provider>
  );
};
