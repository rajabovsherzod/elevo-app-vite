
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/lib/api/endpoints";
import { useAuthStore } from "@/store/auth.store";
import { getAccessToken } from "@/lib/api/client";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const MODAL_STORAGE_PREFIX = "elevo_welcomed_v1";

export function DebugPanel() {
  const [initData, setInitData] = useState<string>("Loading...");
  const [backendStatus, setBackendStatus] = useState<string>("Boshlanmadi");
  const [tgUser, setTgUser] = useState<any>(null);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [devMsg, setDevMsg] = useState("");

  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const appUser = useAuthStore(s => s.user);
  const setUser  = useAuthStore(s => s.setUser);

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Capture console.error
    const origError = console.error;
    console.error = (...args) => {
      setLogs(prev => [...prev, args.join(" ")].slice(-5));
      origError.apply(console, args);
    };

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      try {
        const tg = (window as typeof window & { Telegram?: any }).Telegram?.WebApp;
        if (tg?.initData) {
          setInitData(tg.initData.substring(0, 30) + "... (topildi)");
          if (tg.initDataUnsafe?.user) {
            setTgUser(tg.initDataUnsafe.user);
          }
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

    setHasToken(!!getAccessToken());

    return () => {
      clearInterval(interval);
      console.error = origError;
    };
  }, []);

  const flash = (msg: string) => { setDevMsg(msg); setTimeout(() => setDevMsg(""), 2500); };

  const resetWelcome = () => {
    if (appUser) localStorage.removeItem(`${MODAL_STORAGE_PREFIX}_${appUser.id}`);
    flash("✅ Welcome modal reset — reload to see modal");
  };

  const replaySplash = () => window.location.reload();

  const forceTrial = () => {
    if (!appUser) { flash("❌ No user in store"); return; }
    setUser({
      ...appUser,
      status: "REGULAR",
      trial: { active: true, days_left: 2, ends_at: null },
      global_quota: { kind: "trial_daily", total: 25, remaining: 18, resets_at: "" },
    });
    flash("✅ Trial injected — see banner above");
  };

  const clearTrial = () => {
    if (!appUser) { flash("❌ No user in store"); return; }
    setUser({ ...appUser, trial: { active: false, days_left: 0, ends_at: null } });
    flash("✅ Trial cleared");
  };

  const forceFreeQuota = () => {
    if (!appUser) { flash("❌ No user in store"); return; }
    setUser({
      ...appUser,
      status: "REGULAR",
      trial: { active: false, days_left: 0, ends_at: null },
      global_quota: { kind: "free_daily", total: 1, remaining: 1, resets_at: "" },
    });
    flash("✅ Free quota injected (1/1)");
  };

  const forceFreeQuotaExhausted = () => {
    if (!appUser) { flash("❌ No user in store"); return; }
    const tomorrow = new Date(Date.now() + 23 * 3_600_000).toISOString();
    setUser({
      ...appUser,
      status: "REGULAR",
      trial: { active: false, days_left: 0, ends_at: null },
      global_quota: { kind: "free_daily", total: 1, remaining: 0, resets_at: tomorrow },
    });
    flash("✅ Free quota exhausted injected");
  };

  const pingBackend = async () => {
    setBackendStatus("Ulanilmoqda...");
    try {
      const res = await axios.get(`${API_BASE}/api/exams/`);
      setBackendStatus(`Ishlayapti (Status: ${res.status})`);
    } catch (err: any) {
      if (err.response) {
        setBackendStatus(`Backend ishladi, lekin xato qaytardi (Status: ${err.response.status}) - ${JSON.stringify(err.response.data)}`);
      } else {
        setBackendStatus(`Ulanib bo'lmadi! Xato: ${err.message}`);
      }
    }
  };

  return (
    <div className="mt-8 p-4 bg-surface-container rounded-xl border border-error/30 text-xs overflow-hidden break-words mb-20">
      <h3 className="font-bold text-error mb-2 text-sm uppercase">DEBUG PANEL (DEV)</h3>

      <div className="space-y-3">
        <div>
          <span className="font-bold">Backend API URL:</span>
          <code className="block bg-background p-2 rounded mt-1 select-all">{API_BASE}</code>
        </div>

        <div>
          <span className="font-bold">Telegram initData:</span>
          <code className="block bg-background p-2 rounded mt-1 text-warning">{initData}</code>
        </div>

        {tgUser && (
          <div>
            <span className="font-bold">Telegram User (Unsafe):</span>
            <code className="block bg-background p-2 rounded mt-1">{tgUser.first_name} (@{tgUser.username})</code>
          </div>
        )}

        <div>
          <span className="font-bold">App Login Holati:</span>
          <code className="block bg-background p-2 rounded mt-1 text-primary">
            {isAuthenticated ? `✅ Tizimga kirdi (${appUser?.full_name || appUser?.username})` : `❌ Hali kirmadi`}
            {hasToken === null ? "" : hasToken ? ` (Token bor)` : ` (Token yo'q)`}
          </code>
        </div>

        <div>
          <span className="font-bold">User status / trial / global_quota:</span>
          <code className="block bg-background p-2 rounded mt-1 text-[10px] break-all">
            status: {appUser?.status ?? "null"}{" | "}
            trial.active: {String(appUser?.trial?.active ?? "undefined")}{" | "}
            gq.kind: {appUser?.global_quota?.kind ?? "undefined"}{" | "}
            gq.remaining: {appUser?.global_quota?.remaining ?? "undefined"}{" / "}
            {appUser?.global_quota?.total ?? "undefined"}
          </code>
        </div>

        {hasToken && (
          <div>
            <span className="font-bold">Access Token (to'liq):</span>
            <code className="block bg-background p-2 rounded mt-1 text-warning text-[10px] break-all select-all">
              {getAccessToken()}
            </code>
          </div>
        )}

        {/* ── DEV CONTROLS ── */}
        <div className="border-t border-error/30 pt-3">
          <span className="font-bold block mb-2">Dev Controls:</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={resetWelcome}  className="bg-primary/20 text-primary px-3 py-1 rounded font-bold">Reset Welcome</button>
            <button onClick={replaySplash}  className="bg-primary/20 text-primary px-3 py-1 rounded font-bold">Replay Splash</button>
            <button onClick={forceTrial}             className="bg-primary/20 text-primary px-3 py-1 rounded font-bold">Force Trial</button>
            <button onClick={clearTrial}             className="bg-error/20   text-error   px-3 py-1 rounded font-bold">Clear Trial</button>
            <button onClick={forceFreeQuota}         className="bg-primary/20 text-primary px-3 py-1 rounded font-bold">Free Quota</button>
            <button onClick={forceFreeQuotaExhausted} className="bg-error/20  text-error   px-3 py-1 rounded font-bold">Quota Limit</button>
          </div>
          {devMsg && (
            <div className="mt-2 bg-background p-2 rounded text-primary text-[10px]">{devMsg}</div>
          )}
        </div>

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

        {logs.length > 0 && (
          <div className="mt-4 border-t border-error/30 pt-2">
            <span className="font-bold text-error">Console Xatoliklar:</span>
            <div className="bg-background p-2 rounded mt-1 text-error text-[10px] space-y-1">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
