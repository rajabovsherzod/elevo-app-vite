import { useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";
import { useTelegramAuth } from "@/hooks/auth/use-telegram-auth";

/**
 * TelegramAutoAuth — Telegram Mini App ichida ochilganda
 * avtomatik initData yuborib autentifikatsiya qiladi.
 *
 * expand/requestFullscreen index.html inline scriptida qilinadi —
 * React renderidan oldin, shu sababli app birinchi paintda to'liq balandlikda ochiladi.
 */
export const TelegramAutoAuth = ({ children }: PropsWithChildren) => {
    const attempted = useRef(false);
    const { mutate: telegramAuth } = useTelegramAuth();

    useEffect(() => {
        if (attempted.current) return;

        const tryAuth = () => {
            const tg = (window as any).Telegram?.WebApp;
            if (tg?.initData) {
                attempted.current = true;
                telegramAuth({ init_data: tg.initData });
                return true;
            }
            return false;
        };

        if (tryAuth()) return;

        // SDK hali yuklanmagan bo'lsa polling (dev muhiti uchun)
        let tries = 0;
        const interval = setInterval(() => {
            tries++;
            if (tryAuth()) {
                clearInterval(interval);
            } else if (tries >= 40) {
                clearInterval(interval);
                console.warn("[TelegramAutoAuth] Telegram WebApp topilmadi — dev muhitida ishlayapsiz.");
            }
        }, 50);

        return () => clearInterval(interval);
    }, [telegramAuth]);

    return <>{children}</>;
};
