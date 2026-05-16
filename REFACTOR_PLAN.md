# Elevo Refactor Plan — 2026-05-14

Hozirgi tizim tahlilidan keyin tuzilgan ketma-ketlik. Har bir blok mustaqil PR-ga loyiq, lekin **mantiqiy tartibda** bajariladi (1 → 2 → 3 → 4). Tasdiqlashdan keyin boshlayman.

---

## 0. Hozirgi tizim qanday ishlaydi (qisqacha audit)

### 0.1 Boot ketma-ketligi
1. `index.html` → inline FOUC script: theme class qo'yiladi, body bg darhol set bo'ladi (`#f8fafc` / `#09090b`).
2. `index.html` → inline Telegram script: `tg.ready()` + `requestFullscreen()` / `expand()` chaqiriladi **React mount qilinishidan oldin**.
3. `main.tsx` → `ThemeProvider → QueryProvider → BrowserRouter → RouteProvider → TelegramAutoAuth → SplashProvider → AppShell`.
4. `TelegramAutoAuth` → `initData` topib `useTelegramAuth.mutate(...)` chaqiradi → `/auth/telegram` → backenddan `user + tokens` keladi (lekin **`user.skills`, `user.trial`, `user.global_quota` keladi-yo'qmi backend javobiga bog'liq**).
5. `SplashProvider` → `useCurrentUser()` chaqiradi → `/auth/me` so'rovi → to'liq `user` (skills/trial/global_quota bilan) keladi → `_meLoaded = true`.
6. Splash MIN 900ms + dataReady bo'lganda chiqib ketadi.

### 0.2 Aniqlangan muammolar

| # | Muammo | Sabab |
|---|--------|-------|
| A | App **to'liq fullscreen** ochilmayapti | `index.html` da `requestFullscreen` chaqiriladi, lekin Telegram SDK hali yuklanmagan bo'lishi mumkin (async). Polling yo'q. `safe-area-inset-top` qo'llanilgan, lekin **bottom safe-area** va `viewportStableHeight` bilan ishlanmagan. |
| B | App ochilishida **qora fon flash** ko'rinadi | `index.html` da critical CSS bor (`bg #f8fafc` / `#09090b`), lekin Telegram WebView **default qora fon**ni `tg.setBackgroundColor()` orqali o'zgartirilmagan. Shu sababli `index.html` parse qilinguncha qisqa muddat qora fon ko'rinadi. |
| C | Splash uzoq turadi (cold start) | `SPLASH_MIN_MS = 900`, lekin `/auth/me` 200–500ms. Min timer bekor o'lgan vaqt. Shuningdek `staleTime: 0` + `refetchOnMount: "always"` har boot da network majbur qilyapti. |
| D | Skills page-da **PRO badge** kichkina pill — Upgrade page corner ribbon dizayniga to'g'ri kelmaydi | `skills.tsx` da `<span className="absolute top-2 right-2 ...">PRO</span>` — alohida primitiv stil. Upgrade page (`pricing-card.tsx`, `active-plan-card.tsx`) esa 45° aylantirilgan corner ribbon ishlatadi (`width 84/84`, `transform: rotate(45deg)`). |
| E | Skill card-da **paid status** umuman ko'rsatilmayapti | Faqat `isPaid` bool bor → "PRO" badge chiqaradi. Lekin `paid && active` (AKTIV) yoki `paid && expired/empty` (YANGILASH) farqlanmayapti. ActivePlanCard kabi mantiq Skills card-da yo'q. |
| F | Skills page → **TrialBanner / FreeQuotaBanner kechikib chiqyapti** (flickering) | `TrialBanner` `_meLoaded` ni kutadi va `<TrialBannerSkeleton/>` ko'rsatadi. Warm start-da `user` allaqachon cache-da bor (`global_quota` ham), lekin `_meLoaded` session-only → har boot-da `false` boshlanadi → skeleton → keyin banner. Bu **flicker manbai**. |
| G | Upgrade page-da `useQuery` qayta chaqiriladi | `upgrade.tsx` ichida yana bir `useQuery({queryKey: CURRENT_USER_KEY})` bor — `SplashProvider` allaqachon shu queryni chaqirgan. Duplikatsiya, lekin React Query dedupe qiladi. Muammo emas, lekin tozalash mumkin. ActivePlanCard `user.skills` dan o'qiyapti — `_meLoaded` ni kutmaydi → **shuning uchun flicker yo'q**. Bu — to'g'ri pattern. |

### 0.3 Asosiy g'oya
`AuthUser` ob'ekti **persist** qilingan (`zustand/persist` → localStorage `elevo-auth`). Cold start-da `null`, warm start-da to'liq user. **Hamma UI komponentlari shu cache-dan darhol render bo'lishi kerak** — `_meLoaded` gating-i faqat splash uchun, UI uchun emas. `/auth/me` keyin background-da refresh qiladi → store yangilanadi → UI re-render bo'ladi flickersiz.

ActivePlanCard allaqachon shu pattern bilan ishlaydi. PRO badge va TrialBanner ham shu pattern-ga o'tkaziladi.

---

## 1. Fullscreen + Black flash fix (Boot perf)

**Maqsad:** App ochilishi bilan **to'liq ekranda** ochilsin, qora flash bo'lmasin, splash mumkin qadar tez chiqsin.

### 1.1 `index.html`
- [ ] `<style>` ichiga `html, body { background: #f8fafc; height: 100vh; height: 100dvh; overflow: hidden; }` — qora flash imkoni qolmasin.
- [ ] Inline Telegram script-ga `tg.setBackgroundColor('#f8fafc')` va `tg.setBottomBarColor('#f8fafc')` qo'shish (theme-aware: dark bo'lsa `#09090b`).
- [ ] `disableVerticalSwipes` + `enableClosingConfirmation` (ixtiyoriy) qo'shish.
- [ ] Telegram SDK async yuklangani uchun: agar `window.Telegram?.WebApp` topilmasa, `script.onload` callback-da retry qilish (hozir polling faqat React tomonda).
- [ ] `viewport-fit=cover` meta tag qo'shish (safe-area-inset uchun).

### 1.2 `main.tsx` AppShell
- [ ] `paddingBottom` ni `calc(env(safe-area-inset-bottom, 0px) + 100px)` ga o'zgartirish — bottom nav fullscreen-da to'g'ri turadi.
- [ ] `minHeight: 100dvh` o'rniga `height: 100dvh` (overflow ichkarida).

### 1.3 `splash-provider.tsx` perf
- [ ] `SPLASH_MIN_MS` ni **900 → 500ms** ga tushirish (brand animation 500ms-da to'liq tugaydi, hozirgi 900 ko'p).
- [ ] `useCurrentUser` da: agar warm start (`_hasCachedUser === true`) → `setMeLoaded(true)` ni darhol set qilish, `/auth/me` background-da yangilash. Splash darhol chiqadi, data background-da yangilanadi.

**Tekshirish:** Telegram Mini App-da ochilish < 1s, qora flash yo'q, fullscreen darhol.

---

## 2. Eager rendering — flicker yo'qotish

**Maqsad:** TrialBanner / FreeQuotaBanner / PRO badge — splash chiqishi bilan **darhol ko'rinadi**, skeleton yoki keyin "pop in" yo'q.

### 2.1 `trial-banner.tsx`
- [ ] `_meLoaded` gate-ini olib tashlash. Faqat `user?.trial?.active` yoki `user?.global_quota` bo'yicha render.
- [ ] `TrialBannerSkeleton` faqat **mutlaq birinchi cold start-da** ko'rsatiladi (`!user`). Warm start-da skeleton umuman ko'rinmaydi.
- [ ] Background refetch `useCurrentUser` orqali bo'ladi → store yangilanadi → smooth update.

### 2.2 `auth.store.ts`
- [ ] `_meLoaded` initial state-ini `_hasCachedUser` bo'lsa `true` qilish (warm start uchun). Splash-ga ham foyda, banner-ga ham.
- [ ] `setAuth` action-ida `_meLoaded: true` ham qo'yish — agar backend `/auth/telegram` javobida `trial/global_quota/skills` qaytarsa, bu yetarli (qo'shimcha `/auth/me` kerak emas).
- [ ] **Backend qarashi:** `/auth/telegram` javobiga `skills + trial + global_quota` qo'shilganmi tekshirish. Agar yo'q bo'lsa, `useCurrentUser` cold start-da kerak bo'ladi (warm start-da kerak emas).

### 2.3 `upgrade.tsx`
- [ ] Ichidagi qo'shimcha `useQuery` ni olib tashlash — `SplashProvider` allaqachon refetch qiladi. `refetchInterval: 60_000` kerak bo'lsa, `useCurrentUser` ga global-da qo'shamiz.

---

## 3. Skill card refactor (PRO ribbon + ActiveStatus)

**Maqsad:** Skills page-dagi 4 ta skill card Upgrade page-dagi card dizayniga **vizual mos** kelsin, va paid/active/expired status real vaqtda ko'rinsin.

### 3.1 Yangi component: `components/elevo/skills/skill-card.tsx`
Hozirgi `skills.tsx` ichidagi inline `SkillCard` ni alohida fayl-ga ko'chirish.

**Props:**
```ts
interface SkillCardProps {
  icon: LucideIcon
  title: string
  count: number
  href: string
  info?: SkillInfo  // user.skills[key] — undefined bo'lishi mumkin
}
```

**Render logic (3 holat):**

| Holat | Sharti | Corner ribbon | Border/shadow | Indikator |
|-------|--------|---------------|---------------|-----------|
| **Free** | `!info?.is_paid` | `PRO` (binafsha — `var(--el-primary)`) | default | yo'q |
| **Active premium** | `info.is_paid && quota_remaining > 0 && !expired` | `AKTIV` (yashil `#059669`) | yashil glow border | `quota_remaining / quota_total` mini progress dot/text |
| **Expired/empty** | `info.is_paid && (quota_remaining === 0 || expired)` | `YANGILASH` (qizil `#ef4444`) | qizil border | "Muddat tugadi" / "Quota tugadi" |

**Vizual style:** `pricing-card.tsx` va `active-plan-card.tsx` dagi **45° rotated corner ribbon** ni qayta foydalanish.
- `width: 84, height: 84` corner container
- `transform: rotate(45deg)` ribbon strip
- `fontSize: 7.5, fontWeight: 900, letterSpacing: 0.13em`

### 3.2 Reusable ribbon component (DRY)
`components/elevo/shared/corner-ribbon.tsx` — `pricing-card`, `active-plan-card`, `skill-card` uchun umumiy.

```ts
interface CornerRibbonProps {
  label: string
  color: string  // ribbon bg
}
```

PricingCard / ActivePlanCard ham shu component-ni ishlatadi (duplicate code yo'q).

### 3.3 `skills.tsx` ni soddalashtirish
- [ ] Inline `SkillCard` ni olib tashlash → yangi `<SkillCard info={skills?.[key]} ... />` ni ishlatish.
- [ ] Hech qanday loading state kerak emas — `skills?.[key]` `undefined` bo'lsa `PRO` (free) holatini ko'rsatadi.

---

## 4. (Optional) `/auth/telegram` javobini boyitish

Agar backend `/auth/telegram` ga `trial + global_quota + skills` qo'shsa, **cold start-da ham** `/auth/me` ga kerak qolmaydi. SplashProvider darhol `_meLoaded: true` qo'yadi, app ochilishi yana 200–500ms tezroq.

Bu **backend o'zgarishi** — agar shu kerak bo'lsa, alohida ko'rsataman.

---

## Bajarish tartibi

1. ✅ **Block 1**: Fullscreen + black flash + splash tezligi
2. ✅ **Block 2**: Eager rendering — `_meLoaded` ni faqat splash uchun ishlatish
3. ✅ **Block 3**: SkillCard ribbon refactor + reusable `CornerRibbon`
4. ⏸ **Block 4**: Backend `/auth/telegram` boyitish (tasdiqlasangiz)

Har blok-dan keyin manual test:
- Telegram-da ochib ko'rish (fullscreen, flash yo'qligi)
- Cold start (cache clear)
- Warm start (qayta ochish — skeleton ko'rinmasligi)
- Skills page → paid skill-da AKTIV ribbon, free-da PRO ribbon, quota=0 da YANGILASH ribbon

---

**Tasdiqlang yoki o'zgartirish kiriting:**
- Blok 1, 2, 3 ni shu tartibda qilamizmi?
- Blok 4 (backend) hozir bo'ladimi yoki keyinroq?
- Boshqa qo'shimcha?
