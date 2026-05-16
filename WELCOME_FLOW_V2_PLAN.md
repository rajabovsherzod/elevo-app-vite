# Welcome Flow V2 — `elevo-app-vite` to‘liq tuzatish rejasi

> **Maqsad:** Splash screen → Home Page → (Welcome Trial Modal, agar birinchi NEW user bo‘lsa) flow’ini Swiss Watch dek aniq, flickeringsiz, va inventrix-miniapp dizayniga moslab yana professionalroq qilib qayta tuzish.
>
> **Eslatma:** Bu reja **faqat** `elevo-app-vite` (Vite + React Router) uchun. `elevo-app` (Next.js) ga tegmaymiz.

---

## 1. Hozirgi muammolar — aniq diagnostika

Asoslangan: `src/` bo‘yicha har bir faylni o‘qib chiqildi (2026-05-12).

### 1.1 Welcome Card noto‘g‘ri rolni bajarmoqda — **ASOSIY XATO**

**Konseptual farq:**

| Komponent              | Aslida nima | Hozir nima qilmoqda                     |
| ---------------------- | ----------- | --------------------------------------- |
| **Welcome Card**       | Dashboard’dagi doimiy *“Salom, {ism}”* hero card — **HAMMA user uchun har doim** ko‘rinadi | ❌ Faqat birinchi kirayotgan NEW userga chiqadi, `onDismiss` bilan yo‘qoladi |
| **Welcome Trial Modal**| Pastdan ko‘tarilib chiqadigan 3‑kunlik trial modal — **faqat birinchi kirayotgan NEW user uchun** | ✅ To‘g‘ri (`welcome-trial-modal.tsx`, `main.tsx`’da renderlangan) |

**Joriy `welcome-card.tsx`** (XATO):
- `AnimatePresence + motion.section` collapse animatsiyasi
- `onDismiss` prop, “Boshlash” CTA tugmasi
- Crown/Flame/Zap pill’lari (daraja/streak/XP)
- `Xush kelibsiz` + “Tayyorgarlik boshlansin!” subtitle
- HomeScreen’da `{isFirstTime && <WelcomeCard ...>}` shartida

**Aslida kerak**:
- **Doimiy** — har bir userga doim ko‘rinadi (regular, trial, new — farqi yo‘q)
- *“Salom, {ism}!”* yoki *“Assalomu alaykum, {ism}”* greeting
- Dismiss tugmasi YO‘Q
- Streak / XP / daraja statistika (motivatsion)
- Vaqtga bog‘liq tabriklash (Xayrli tong / Xayrli kech)

### 1.2 Splash screen — dizayn bo‘lib ketgan

**Joriy `splash-screen.tsx`**:
- ✅ SVG brand chevronlar (to‘g‘ri)
- ✅ Letter‑by‑letter “Elevo” (to‘g‘ri)
- ❌ Progress bar (56×2px) — *qo‘shimcha shovqin*
- ❌ Tagline “MULTILEVEL PREPARATION” + loading hint “Ma’lumotlar yuklanmoqda” — *bir vaqtda 2 ta text element ortiqcha*
- ❌ Ambient glow 320×320 radial gradient — *inventrix’da yengilroq blur*
- ❌ Icon konteyner 104×104 border + shadow — *inventrix’da hech qanday qutib yo‘q, SVG ochiq turadi*

**Inventrix‑miniapp asl dizayni** (`inventrix-miniapp/src/App.tsx:18-123`):
```
[soft glow blur(28px) 120×120]
    [SVG 96×96 — 2 chevron stroke→fill]
    
[ Inventrix Driver ]   ← 2 ta word, letter-by-letter, spring easing
```
- Bitta SVG, bitta glow, bitta wordmark — sodda, toza, tez
- Hech qanday progress bar, loading hint, tagline
- `splash-fade-out` keyframe — faqat `opacity: 0` (transform’siz)
- `SPLASH_MIN_MS = 2600`

**Yanada professional qilish bo‘yicha qo‘shimcha takomillashtirish:**
- SVG’ning 2 chevronlari sekvensial draw (kichik birinchi, katta keyin) — *bu allaqachon to‘g‘ri*
- Wordmark 2‑word: `Elevo` (katta, primary text) + `Multilevel` (kichikroq, brand color) — *inventrix kabi*
- Bottom’da subtle dot pulse (3 dot loader) — *progress bar o‘rniga, soddaroq*
- Background — `bg-secondary` (theme’ga moslangan, qattiq oq emas)
- Brand glow — radial blur, 28px (inventrix’dagidek)
- Exit — pure opacity fade, transform’siz (inventrix’dagidek)
- Mount time `2600ms` (inventrix kabi)

### 1.3 Splash gate (boot logic) — to‘g‘ri, lekin tushuntirish kerak

Joriy `splash-provider.tsx` mantiqi to‘g‘ri:
- `SPLASH_MIN_MS = 2200` → animatsiya tugashini kafolatlaydi
- `SPLASH_MAX_MS = 8000` → safety net
- `dataReady`: warm start (persisted user) ↔ cold start (`_meLoaded`)
- Content `opacity: 0` orqada turadi → splash chiqayotganda parallel fade
- `BootPhase`: `BOOT → AUTHENTICATING → HYDRATING → READY → ERROR`

> Yagona o‘zgarish: `SPLASH_MIN_MS` ni `2600ms` ga ko‘taramiz (inventrix bilan moslash). Splash screen ichidagi sekvensial animatsiyalar (1.55s tagline boshi, 1.20s letter boshi + 5 ta letter × 0.07s ≈ 1.55s) `~2.0s`’gacha tugaydi → 2.6s bo‘shroq nafas oluvchi nuqta.

### 1.4 Trial banner — to‘g‘ri, lekin tasdiqlash kerak

Joriy `trial-banner.tsx`:
- ✅ `authResolved` false bo‘lsa — skeleton (148px height) → layout shift yo‘q
- ✅ `user.trial.active` false bo‘lsa — render qilmaydi (null)
- ✅ `days_left`, `global_quota.remaining/total` real datadan keladi
- ✅ DaysRing circular progress, quota bar — barchasi animatsion

> Hech qanday o‘zgarish kerak emas. Faqat splash boot gate bilan koordinatsiyada ekanligini tekshirish.

### 1.5 Welcome Trial Modal — to‘g‘ri, lekin tasdiqlash kerak

Joriy `welcome-trial-modal.tsx`:
- ✅ `useAppReady` orqali splash tugagandan keyingina ishga tushadi
- ✅ `user.trial.active` + `is_first_session !== false` + `localStorage[elevo_welcomed_v1_{userId}]` yo‘q → ko‘rinadi
- ✅ 80ms settle delay → splash overlay to‘liq olib tashlangach
- ✅ rAF×2 → next paint cycle’da `animIn = true` → spring slide up
- ✅ Confetti, success sound, drag handle, glass blur backdrop
- ✅ Yopilganda: localStorage + zustand patch + `authService.welcomed()` fire‑and‑forget

> Hech qanday o‘zgarish kerak emas. Mavjud holati optimal.

---

## 2. Maqsadli flow (Swiss Watch tartibida)

```
┌─────────────────────────────────────────────────────────────────────┐
│ T = 0 ms       App mount                                            │
│                ├─ SplashProvider mount                              │
│                ├─ TelegramAutoAuth → /auth/telegram POST            │
│                ├─ useCurrentUser → /auth/me GET (auth tugagach)     │
│                └─ Splash chiqadi (z-9999), content opacity:0        │
│                                                                     │
│ T = 50-450 ms  Brand SVG 2 chevron draw (kichik → katta)            │
│ T = 1200 ms    "Elevo" letter-by-letter boshlanadi                  │
│ T = 1550 ms    "Multilevel" tagline letter-by-letter                │
│ T = 2200 ms    Data ready bo‘lsa — exit triggered                   │
│ T = 2600 ms    SPLASH_MIN_MS deadline (har holatda)                 │
│                ├─ Parallel: splash opacity 1→0, content 0→1         │
│ T = 3020 ms    Splash unmount, splashDone = true                    │
│                ↓                                                     │
│ T = 3100 ms    [Home Page ko‘rindi]                                 │
│                ├─ AppHeader (TopHeader analogi)                     │
│                ├─ WelcomeCard      ← hamma uchun, doimiy            │
│                ├─ TrialBanner      ← agar user.trial.active         │
│                ├─ ProgressCard, ExamStats, QuickPractice            │
│                └─ DebugPanel (dev only)                             │
│                                                                     │
│ T = 3180 ms    Welcome Trial Modal slide-up (faqat first-time NEW)  │
│                ├─ Backdrop blur fade-in 320ms                       │
│                ├─ Sheet translateY 100%→0% spring 420ms             │
│                └─ Confetti + success sound (200ms keyin)            │
└─────────────────────────────────────────────────────────────────────┘
```

**Eng muhim invariantlar:**
1. Hech bir element splash chiqayotganda ko‘rinmaydi (content `opacity: 0` orqada turadi)
2. Trial banner splash tugagandan keyin **darhol** ko‘rinadi (skeleton bo‘lsa ham, layout shift yo‘q)
3. Welcome Modal **faqat** content + trial banner ko‘ringandan **80ms keyin** chiqadi
4. Welcome Card hech qachon yo‘qolmaydi (doimiy)

---

## 3. Splash screen yangi dizayni (inventrix + extra polish)

### 3.1 Tarkib

```
       [120×120 brand glow, blur(32px), pulse breath]
           [96×96 SVG, 2 chevron sequential draw]

              [ Elevo  Multilevel ]   ← 2 word
              (52px,800) (24px,600,brand)

                  [ • • • ]   ← 3 dot loader (progress bar o‘rniga)
```

### 3.2 Aniq qiymatlar (inventrix bilan moslangan, sal kattaroq Elevo brendi uchun)

| Element              | Qiymat                                              |
| -------------------- | --------------------------------------------------- |
| Background           | `var(--bg-secondary)` yoki `bg-background`          |
| Glow                 | 120×120, `rgba(79,70,229,0.18)`, blur(32px)         |
| SVG container        | Yo‘q (raw SVG, inventrix kabi)                     |
| SVG dimensions       | 96×96 (viewBox 0 0 48 48)                          |
| Small chevron        | `opacity: 0.55`, `delay: 0.15s`, draw 1.1s         |
| Large chevron        | `opacity: 1`, `delay: 0.45s`, draw 1.1s            |
| Word 1 — "Elevo"     | 52px / 800 / `text-on-surface` / letter-spacing -0.03em |
| Word 2 — "Multilevel"| 24px / 600 / `text-primary` / letter-spacing -0.01em   |
| Letter delay         | `1.20s + i * 0.07s` (Elevo)                        |
| Word 2 boshi         | `1.20 + 5 × 0.07 + 0.08 = 1.63s`                   |
| Letter easing        | `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot spring) |
| 3-dot loader         | `2.3s` da appear, har dot `pulse 1.2s infinite` keladi-ketadi |
| Splash min duration  | 2600ms                                              |
| Exit                 | `opacity: 1 → 0`, 400ms ease, no scale              |

### 3.3 CSS keyframes (globals.css)

`splash-exit` ni `transform: scale(0.96)` siz qilamiz (inventrix kabi pure fade):

```css
@keyframes splash-exit {
  from { opacity: 1; }
  to   { opacity: 0; pointer-events: none; }
}

@keyframes splash-dot {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
  40%           { opacity: 1;    transform: scale(1); }
}
```

(Qolgan keyframe’lar — `splash-draw`, `splash-glow`, `splash-letter`, `splash-tagline` — saqlanadi.)

### 3.4 Olib tashlanadigan elementlar

- `progress` state, `setProgress`, `filledRef`, `BAR_*` konstantalar
- Progress bar `<div>` (line 145-172)
- “Ma’lumotlar yuklanmoqda” loading hint (line 174-189) — *agar saqlanadi bo‘lsa: faqat HYDRATING fazasida, juda subtle*
- Icon konteyner border + shadow (line 73-82) — SVG to‘g‘ridan‑to‘g‘ri chiqadi

### 3.5 Qo‘shiladigan elementlar

- 3‑dot loader (3 ta `<span>` `splash-dot` animation bilan)
- Wordmark’da 2 ta word (Elevo + Multilevel) inventrix kabi

---

## 4. Welcome Card yangi dizayni (doimiy greeting)

### 4.1 Tarkib

```
┌────────────────────────────────────────────────┐
│  Xayrli tong, Sherzod 👋                       │  ← greeting + time-of-day
│  Bugun B1 darajada davom etamiz                │  ← motivational subtitle
│                                                │
│  🔥 5 kun streak   ⚡ 1,240 XP   👑 B1         │  ← stat pills
└────────────────────────────────────────────────┘
```

### 4.2 Props

```ts
interface WelcomeCardProps {
  name:   string;
  level:  string;   // "B1" | "B2" | ...
  streak: number;   // davomli kunlar
  xp:     number;   // jami XP
}
```

`onDismiss` **YO‘Q**. Komponent har doim ko‘rinadi.

### 4.3 Vaqtga bog‘liq greeting

```ts
function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return "Xayrli tong";
  if (h < 12) return "Xayrli tong";
  if (h < 17) return "Xayrli kun";
  if (h < 22) return "Xayrli kech";
  return "Xayrli tun";
}
```

### 4.4 Vizual

- `elevo-card elevo-card-border` (joriy karta sistemasi)
- `Sparkles` icon o‘ng yuqori burchakda (decoratif, 0.08 opacity)
- Padding `p-5`
- Pill’lar: Crown (daraja), Flame (streak), Zap (XP) — joriy `StatPill` saqlanadi
- AnimatePresence/motion **olib tashlanadi** (doimiy ekan, exit kerakmas)

### 4.5 HomeScreen integratsiyasi

```tsx
// home-screen.tsx
return (
  <div className="flex flex-col gap-5 relative z-10">
    <WelcomeCard
      name={displayName}
      level={level}
      streak={user?.streak ?? 0}
      xp={user?.xp ?? 0}
    />

    <TrialBanner />
    <ProgressCard ... />
    <ExamStats ... />
    <QuickPractice />
    <DebugPanel />
  </div>
);
```

`useIsFirstTimeUser` hook — endi shu yerda ishlatilmaydi. (U faqat `WelcomeTrialModal` ichida ishlatilmoqda, va u joyida o‘z mantiqi bor — localStorage `elevo_welcomed_v1_{userId}` + `trial.is_first_session`).

> `use-is-first-time-user.ts` hook’ini saqlash mumkin (kelajak uchun), lekin agar hech qaerda ishlatilmasa — o‘chiramiz.

---

## 5. Implementatsiya bosqichlari

### Bosqich 1 — Splash screen redesign
1. `splash-screen.tsx` ni qayta yozish:
   - Progress bar, loading hint, icon container border/shadow olib tashlash
   - 3‑dot loader qo‘shish
   - Wordmark’ni 2 word qilish (Elevo + Multilevel)
   - Glow’ni 320 → 120 ga kichraytirish
2. `globals.css`:
   - `splash-exit` keyframe’ni pure opacity qilish (scale’ni olib tashlash)
   - `splash-dot` keyframe qo‘shish
3. `splash-provider.tsx`:
   - `SPLASH_MIN_MS = 2600` (2200 → 2600)

### Bosqich 2 — Welcome Card revert
1. `welcome-card.tsx` ni qayta yozish:
   - Props’dan `onDismiss` olib tashlash
   - AnimatePresence/motion olib tashlash
   - `timeGreeting()` helper qo‘shish
   - Greeting + name + subtitle yangilash
   - Pill’lar saqlanadi
2. `home-screen.tsx`:
   - `useIsFirstTimeUser` import olib tashlash
   - `{isFirstTime && ...}` shartni olib tashlash
   - WelcomeCard ni doimiy render qilish
   - `streak`, `xp` props ulash (hozircha 0 / 0)

### Bosqich 3 — Hook tozalash
1. Agar `useIsFirstTimeUser` boshqa joyda ishlatilmasa — `use-is-first-time-user.ts` ni o‘chirish
2. `icons.ts`:
   - `ArrowRight` agar boshqa joyda ishlatilmasa — saqlanishi mumkin
3. `debug-panel.tsx`:
   - “Reset Welcome” tugmasi endi `elevo_welcomed_v1_{userId}` ga moslanadi (yoki WelcomeTrialModal storage’iga)

### Bosqich 4 — Welcome Modal storage sinxronlash
`debug-panel.tsx`’dagi “Reset Welcome” hozir `elevo-welcome-seen` ni o‘chiradi. Lekin haqiqiy modal storage `elevo_welcomed_v1_{userId}`. Tuzatamiz:

```ts
const resetWelcome = () => {
  const user = useAuthStore.getState().user;
  if (user) localStorage.removeItem(`elevo_welcomed_v1_${user.id}`);
  localStorage.removeItem("elevo-welcome-seen"); // legacy
  flash("✅ Welcome modal reset — reload to see");
};
```

### Bosqich 5 — TypeScript check
```bash
npx tsc --noEmit
```
Hech qanday xato bo‘lmasligi kerak.

### Bosqich 6 — Manual test plan

| Test | Qadam | Kutilgan natija |
|------|-------|-----------------|
| Cold start, new user | localStorage tozalash → reload | Splash 2.6s → Welcome Card (Salom...) + Trial Banner darhol → 80ms keyin Welcome Modal slide up |
| Warm start, regular user | reload | Splash 2.6s (warm, lekin min time saqlanadi) → Welcome Card + (Trial Banner yo‘q) |
| Warm start, trial active | reload | Splash 2.6s → Welcome Card + Trial Banner (X kun qoldi) |
| Modal dismiss | “Boshlash — 3 kun bepul” bos | Modal slide down → boshqa render yo‘q → reload’da ham chiqmaydi |
| Network slow | Offline → reload | Splash 8s max → Error screen (BootErrorScreen) |
| Force trial dev | DebugPanel → Force Trial | Trial Banner darhol ko‘rinadi |
| Force welcome | DebugPanel → Reset Welcome → reload | Welcome Modal yana chiqadi |

---

## 6. Acceptance criteria (yakuniy mezonlar)

1. ✅ Splash inventrix bilan dizayn jihatdan parallel: ambient glow + 2 chevron draw + 2 word letter‑by‑letter — qo‘shimcha shovqin yo‘q
2. ✅ Splash exit pure opacity fade (transform’siz)
3. ✅ Welcome Card doimiy ko‘rinadi (hamma user uchun, dismiss yo‘q)
4. ✅ Welcome Trial Modal **faqat** birinchi NEW user’ga splash tugagach 80ms keyin slide up
5. ✅ Trial Banner skeleton’dan real bannerga shift’siz o‘tadi
6. ✅ Splash chiqayotganda hech qaysi UI elementi ko‘rinmaydi (opacity:0 orqada)
7. ✅ TypeScript `noEmit` toza
8. ✅ Cold/warm/error har 3 scenario’da flickering yo‘q

---

## 7. Faylga aniq o‘zgarishlar ro‘yxati

| Fayl | O‘zgarish |
|------|-----------|
| `src/components/elevo/splash/splash-screen.tsx` | Qayta yoz: progress bar, loading hint, icon container border olib tashlash; 3‑dot loader qo‘shish; 2‑word wordmark |
| `src/styles/globals.css` | `splash-exit` ni pure opacity qil; `splash-dot` keyframe qo‘sh |
| `src/providers/splash-provider.tsx` | `SPLASH_MIN_MS = 2600` |
| `src/components/elevo/dashboard/welcome-card.tsx` | Qayta yoz: doimiy greeting card, `onDismiss` yo‘q, AnimatePresence yo‘q, `timeGreeting()` qo‘sh |
| `src/pages/home-screen.tsx` | `useIsFirstTimeUser` import olib tashlash; WelcomeCard doimiy render |
| `src/hooks/use-is-first-time-user.ts` | O‘chir (endi ishlatilmaydi) |
| `src/components/elevo/debug-panel.tsx` | `resetWelcome` ni `elevo_welcomed_v1_{userId}` ga moslash |

> **Tegilmaydi:** `auth.store.ts`, `use-telegram-auth.ts`, `use-current-user.ts`, `welcome-trial-modal.tsx`, `trial-banner.tsx`, `main.tsx` — barchasi hozir to‘g‘ri.

---

## 8. Keyingi qadam

Reja sizga mos kelsa, **“qil”** deng — barcha 7 ta fayl o‘zgarishi ketma‑ket qilinadi, oxirida `npx tsc --noEmit` natijasi ko‘rsatiladi.
