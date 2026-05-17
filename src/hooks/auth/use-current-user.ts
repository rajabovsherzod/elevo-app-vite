import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export const CURRENT_USER_KEY = ["auth", "me"] as const;

export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser         = useAuthStore((s) => s.setUser);
  const setMeLoaded     = useAuthStore((s) => s.setMeLoaded);

  const query = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async () => {
      const user = await authService.getMe();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    // Fresh on every app boot — global_quota changes daily, trial state matters at startup
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // CRITICAL: use isFetchedAfterMount (not isSuccess) — this is true ONLY after
  // an actual NETWORK fetch completes since mount, NOT for cache-hits.
  // Otherwise splash exits with stale cached data, then fresh data "pops in" later.
  useEffect(() => {
    if (query.isFetchedAfterMount) {
      setMeLoaded(true);
    }
  }, [query.isFetchedAfterMount, setMeLoaded]);

  // Also handle the case where query is disabled (not authenticated yet)
  // and then transitions to error — still need to unblock splash via timeout.
  useEffect(() => {
    if (query.isError && !query.isFetching) {
      setMeLoaded(true);
    }
  }, [query.isError, query.isFetching, setMeLoaded]);

  return query;
};
