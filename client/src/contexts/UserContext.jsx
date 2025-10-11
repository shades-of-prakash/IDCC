import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem("session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [remainingTime, setRemainingTime] = useState(
    Number(session?.user?.remainingTime ?? 0)
  );

  const { refetch } = useQuery(
    ["session"],
    async () => {
      if (!session) return null;
      const res = await fetch(`/api/user/session/${session.sessionId}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data;
    },
    {
      enabled: !!session,
      onSuccess: (data) => {
        if (data) {
          setSession(data);
          setRemainingTime(Number(data.user.remainingTime ?? 0));
        } else {
          setSession(null);
          localStorage.removeItem("session");
        }
      },
    }
  );

  // Timer
  useEffect(() => {
    if (!session) return;

    const durationMs = Number(session.user.contestDurationMinutes ?? 0) * 60 * 1000;
    if (!durationMs) {
      setRemainingTime(0);
      return;
    }

    const lastActive = session.user.lastActiveAt
      ? new Date(session.user.lastActiveAt).getTime()
      : Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActive;
      const updatedRemaining = Math.max(durationMs - elapsed, 0);
      setRemainingTime(updatedRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Save elapsed time
  useEffect(() => {
    if (!session) return;

    const saveElapsed = async () => {
      const totalDuration = Number(session.user.contestDurationMinutes ?? 0) * 60 * 1000;
      let elapsedTime = totalDuration - Number(remainingTime ?? 0);
      if (isNaN(elapsedTime) || elapsedTime < 0) elapsedTime = 0;

      try {
        await fetch(`/api/user/session/${session.sessionId}/elapsed`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({ elapsedTime }),
        });
      } catch (err) {
        console.error("Failed to update elapsed time", err);
      }
    };

    const interval = setInterval(saveElapsed, 60 * 1000);
    window.addEventListener("beforeunload", saveElapsed);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", saveElapsed);
    };
  }, [session, remainingTime]);

  const login = async (data) => {
    const res = await fetch("/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Login failed");
    }
    const resData = await res.json();
    const sessionData = resData.data;

    setSession(sessionData);
    setRemainingTime(Number(sessionData.user.remainingTime ?? 0));
    localStorage.setItem("session", JSON.stringify(sessionData));
  };

  const logout = async () => {
    if (session) {
      const totalDuration = Number(session.user.contestDurationMinutes ?? 0) * 60 * 1000;
      let elapsedTime = totalDuration - Number(remainingTime ?? 0);
      if (isNaN(elapsedTime) || elapsedTime < 0) elapsedTime = 0;

      await fetch(`/api/user/session/${session.sessionId}/elapsed`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ elapsedTime }),
      });

      await fetch("/api/user/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });
    }

    setSession(null);
    localStorage.removeItem("session");
    queryClient.clear();
  };

  return (
    <UserContext.Provider
      value={{ session, login, logout, remainingTime, refetch }}
    >
      {children}
    </UserContext.Provider>
  );
};
