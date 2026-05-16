import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function DebugPanel() {
  const [initData, setInitData] = useState<string>("Loading...");
  const [backendStatus, setBackendStatus] = useState<string>("Boshlanmadi");
  const [tgUser, setTgUser] = useState<{ first_name?: string; username?: string } | null>(null);

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      try {
        const tg = (window as typeof window & { Telegram?: any }).Telegram?.WebApp;
        if (tg?.initData) {
          setInitData(tg.initData.substring(0, 30) + "... (topildi)");
          if (tg.initDataUnsafe?.user) setTgUser(tg.initDataUnsafe.user);
          clearInterval(interval);
        } else if (attempts >= 10) {
          setInitData("Topilmadi (Telegram ichida emassiz yoki yuklanmadi)");
          clearInterval(interval);
        }
      } catch (e: any) {
        setInitData("Xatolik: " + e.message);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const pingBackend = async () => {
    setBackendStatus("Ulanilmoqda...");
    try {
      const res = await fetch(`${API_BASE}/api/exams/`);
      setBackendStatus(`Ishlayapti (Status: ${res.status})`);
    } catch (err: any) {
      setBackendStatus(`Ulanib bo'lmadi! Xato: ${err.message}`);
    }
  };

  return (
    <div className="mt-8 p-4 bg-surface-container rounded-xl border border-error/30 text-xs overflow-hidden break-words mb-20">
      <h3 className="font-bold text-error mb-2 text-sm uppercase">DEBUG PANEL (DEV)</h3>

      <div className="space-y-3">
        <div>
          <span className="font-bold">Backend API URL:</span>
          <code className="block bg-background p-2 rounded mt-1 select-all">{API_BASE || "(VITE_API_BASE_URL not set)"}</code>
        </div>

        <div>
          <span className="font-bold">Telegram initData:</span>
          <code className="block bg-background p-2 rounded mt-1" style={{ color: "var(--el-primary)" }}>{initData}</code>
        </div>

        {tgUser && (
          <div>
            <span className="font-bold">Telegram User (Unsafe):</span>
            <code className="block bg-background p-2 rounded mt-1">{tgUser.first_name} (@{tgUser.username})</code>
          </div>
        )}

        <div>
          <span className="font-bold">Backend Aloqa:</span>
          <code className="block bg-background p-2 rounded mt-1 text-primary">{backendStatus}</code>
          <button
            onClick={pingBackend}
            className="mt-2 bg-primary/20 text-primary px-3 py-1 rounded font-bold"
          >
            Backendni tekshirish
          </button>
        </div>
      </div>
    </div>
  );
}
