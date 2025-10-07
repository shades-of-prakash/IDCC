import { createContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../utils/fetch";

export const AuthContext = createContext({
	admin: null,
	isLoading: true,
	login: async () => {},
	logout: async () => {},
	refetchUser: async () => {},
});

export const AuthProvider = ({ children }) => {
	const queryClient = useQueryClient();

	const {
		data: admin,
		isLoading,
		refetch: refetchUser,
	} = useQuery({
		queryKey: ["authAdmin"],
		queryFn: () => apiFetch("/api/admin/auth/me"),
		retry: false,
	});

	const loginMutation = useMutation({
		mutationFn: (credentials) =>
			apiFetch("/api/admin/auth/login", {
				method: "POST",
				body: credentials,
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries(["authAdmin"]);
		},
	});

	const logoutMutation = useMutation({
		mutationFn: () =>
			apiFetch("/api/admin/auth/logout", {
				method: "POST",
			}),
		onSuccess: async () => {
			queryClient.setQueryData(["authAdmin"], null);
		},
	});

	const value = {
		admin,
		isLoading,
		login: loginMutation.mutateAsync,
		logout: logoutMutation.mutateAsync,
		refetchUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
