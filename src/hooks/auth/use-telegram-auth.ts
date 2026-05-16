import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { TelegramAuthRequest } from "@/types/auth.types";

export const useTelegramAuth = () => {
  const setAuth         = useAuthStore((s) => s.setAuth);
  const setAuthResolved = useAuthStore((s) => s.setAuthResolved);

  const setBootStatus = useAuthStore((s) => s.setBootStatus);

  return useMutation({
    mutationFn: (payload: TelegramAuthRequest) => authService.telegramLogin(payload),
    onMutate: () => setBootStatus("pending"),
    // setAuth already sets _bootStatus: "done" + authResolved: true
    onSuccess: (data) => setAuth(data),
    onError: (err: any) => {
      setBootStatus("error");
      setAuthResolved();
      console.error("[TelegramAuth]", err.response?.data || err.message);
    },
  });
};
