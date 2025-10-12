// src/contexts/UserContext.jsx
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [session, setSession] = useState(() => {
		const stored = localStorage.getItem("session");
		return stored ? JSON.parse(stored) : null;
	});
	const [remainingTime, setRemainingTime] = useState(
		session?.user?.remainingTime || 0
	);
	const [timerActive, setTimerActive] = useState(false);

	// --- Format helper
	const formatTime = useCallback((ms) => {
		const totalSeconds = Math.max(0, Math.floor(ms / 1000));
		const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
		const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
		const s = String(totalSeconds % 60).padStart(2, "0");
		return `${h}:${m}:${s}`;
	}, []);

	// --- Save session to localStorage
	const saveSession = (data) => {
		localStorage.setItem("session", JSON.stringify(data));
		setSession(data);
		setRemainingTime(data.user.remainingTime);
	};

	// --- Login
	const login = async (credentials) => {
		const res = await fetch("/api/user/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(credentials),
		});
		const data = await res.json();

		if (data.success) {
			saveSession(data.data);
			setTimerActive(true);
			navigate(`/user/${data.data.user.username}/playground`);
		} else {
			alert(data.message);
		}
	};

	// --- Resume session (called at startup)
	const fetchSession = async (sessionId, token) => {
		const res = await fetch(`/api/user/session/${sessionId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		if (data.success) {
			saveSession(data.data);
			setTimerActive(true);
		} else {
			console.warn("[Session expired or invalid]:", data.message);
			localStorage.removeItem("session");
			setSession(null);
			setTimerActive(false);
			navigate("/user/login");
		}
		return data;
	};

	// --- Logout (pause session)
	const logout = async () => {
		if (!session) return;
		try {
			await fetch("/api/user/logout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId: session.sessionId }),
			});
		} catch {}
		localStorage.removeItem("session");
		setSession(null);
		setTimerActive(false);
		navigate("/user/login");
	};

	// --- Timer countdown
	useEffect(() => {
		if (!timerActive) return;
		const interval = setInterval(() => {
			setRemainingTime((prev) => {
				if (prev <= 1000) {
					clearInterval(interval);
					logout(); // auto logout when time runs out
					return 0;
				}
				return prev - 1000;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [timerActive]);

	// --- On unload: sync elapsed time to backend
	useEffect(() => {
		const handleUnload = async () => {
			if (!session) return;
			const elapsedTime =
				session.user.contest.durationMinutes * 60000 - remainingTime;

			await fetch(`/api/user/session/${session.sessionId}/elapsed`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ elapsedTime }),
			});
		};
		window.addEventListener("beforeunload", handleUnload);
		return () => window.removeEventListener("beforeunload", handleUnload);
	}, [session, remainingTime]);

	// --- ✅ Auto resume on reload
	useEffect(() => {
		if (session?.sessionId && session?.token) {
			fetchSession(session.sessionId, session.token);
		}
	}, []);

	// --- ✅ React Query: Auto sync remainingTime every 30s
	useQuery({
		queryKey: ["sessionSync", session?.sessionId],
		queryFn: async () => {
			if (!session?.sessionId || !session?.token) return null;
			const result = await fetchSession(session.sessionId, session.token);
			return result.data;
		},
		refetchInterval: 30000, // every 30 seconds
		enabled: !!session?.sessionId && !!session?.token,
	});

	return (
		<UserContext.Provider
			value={{
				session,
				login,
				logout,
				remainingTime,
				formatTime,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
