import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../utils/fetch";
import { useSession } from "./SessionContext";

const UserContext = createContext({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refetchUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { setSession } = useSession();

  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: () => apiFetch("/api/user/me", { credentials: "include" }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials) =>
      apiFetch("/api/user/login", {
        method: "POST",
        body: credentials,
        credentials: "include",
      }),
    onSuccess: async (data) => {
      if (data?.session) {
        setSession({
          sessionId: data.session._id,
          user: data.session.userId,
          contest: data.session.contestId,
        });
      }

      await refetchUser();
      await queryClient.invalidateQueries(["authUser"]);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () =>
      apiFetch("/api/user/logout", {
        method: "POST",
        credentials: "include",
      }),
    onSettled: () => {
      queryClient.setQueryData(["authUser"], null);
      setSession(null);
    },
  });

  const value = {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    loginLoading: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    logoutLoading: logoutMutation.isPending,
    refetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
