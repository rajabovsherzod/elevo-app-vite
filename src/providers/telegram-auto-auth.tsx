import { useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";

/**
 * TelegramAutoAuth — Telegram Mini App ichida ochilganda
 * avtomatik initData yuborib autentifikatsiya qiladi.
 * Hook tayyor bo'lgach useTelegramAuth bilan to'ldiring.
 */
export const TelegramAutoAuth = ({ children }: PropsWithChildren) => {
    const attempted = useRef(false);

    useEffect(() => {
        if (attempted.current) return;

        let tries = 0;
        const interval = setInterval(() => {
            tries++;
            const tg = (window as any).Telegram?.WebApp;

            if (tg?.initData) {
                clearInterval(interval);
                attempted.current = true;
                // TODO: useTelegramAuth hook bilan to'ldiring
                console.log("[TelegramAutoAuth] initData found, auth hook ready to call");
            } else if (tries >= 15) {
                clearInterval(interval);
                console.warn("[TelegramAutoAuth] Telegram WebApp topilmadi — dev muhitida ishlayapsiz.");
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return <>{children}</>;
};
