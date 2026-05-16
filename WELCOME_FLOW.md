# Welcome Flow & Trial Banner — Pattern Reference

Bu hujjat **WelcomeTrialModal** va **TrialBanner** komponentlari uchun "Swiss watch" pattern'ini belgilaydi: bir martagina, kechikishsiz, splash bilan sinxron, hech qachon false-positive yoki blink qilmaydigan.

---

## 1. Hozirgi muammolar (root cause)

| # | Muammo | Sabab |
|---|--------|-------|
| 1 | TrialBanner appga kirganda darhol ko'rinmaydi, navigatsiyadan keyin chiqadi | `useAuthStore` boshida `user = null`. `/auth/me` javobi kelguncha banner mount bo'lmaydi. Lekin re-render sodir bo'lmaydi (StrictMode + cached null → render skip). Navigatsiya re-mount qilganda yangi store value ushlanadi |
| 2 | Modal har safar yoki noto'g'ri vaqtda chiqishi mumkin | "first time" shartini faqat `localStorage` orqali tekshiramiz, lekin backend `trial.active` flag bilan sinxron emas |
| 3 | Sound effect kechga qoladi | Sound `setTimeout(..., 350)` ichida — sheet animatsiyasidan keyin. To'g'risi sheet **boshlanishi bilan** chalinishi |
| 4 | Skill chiplar rainbow | Har skill alohida rang → Trial **bepul** belgisi sifatida konsistensiyani buzadi |
| 5 | Confetti splash davrida otiladi | Splash hali chiqib turganda modal mount bo'ladi |

---

## 2. Single Source of Truth: ready-state

App tahlilida 3 ta asynchronous signal bor:

```
splash      —  SplashProvider tomonidan boshqariladi (sessionStorage-based)
auth        —  TelegramAutoAuth → /auth/me → useAuthStore (persist)
trial flag  —  user.trial.active (backend tomondan)
```

**Qoida:** UI dialoglari va trial-bog'liq elementlar **faqat uchchala signal ham hal bo'lganidan keyin** ko'rinishi kerak.

```
ready = splashDone && authResolved && user !== null
```

`authResolved` — `/auth/me` javobi kelganmi (success YOKI failure), `loading` emas.

---

## 3. WelcomeTrialModal pattern

### 3.1 Trigger shartlari (AND)

```ts
splashDone === true
authResolved === true
user !== null
user.trial?.active === true
user.trial?.is_first_session === true   // backend yangi field, pastda ko'r
localStorage[`elevo_welcomed_v1_${user.id}`] !== "1"
```

> `is_first_session` — backend `/auth/me` javobida `trial.is_first_session: true` qiladi **bitta marta**: birinchi login’dan keyin keyingi javoblarda `false`. Bu localStorage'ga qo'shimcha guard.
> Server-side guard bo'lmasa: user telefon almashtirsa modal yana chiqib qoladi.

### 3.2 Timing (asosiy)

```
t=0   user clicks app / mini-app opens
t≈?   splash chiqib turadi (logo + animatsiya)
t=Sd  splash onComplete → splashDone=true
       │
       ├─ 80ms delay  → modal mount, animIn=false
       │  rAF×2       → animIn=true (sheet slayd boshlanadi)
       │
       ├─ 0ms (animIn=true bilan bir freym) → playSuccess()
       │  Sound sheet 50% chiqqanda yetib boradi — UX'da bir vaqtda his qilinadi
       │
       └─ 180ms      → fireConfetti() (sheet to'liq chiqishidan oz oldin)
```

**Sabab:** `<audio>.play()` ~80–120ms latency oladi. Sound'ni rasman erta chaqirish — sheet bilan **sinxron** eshitiladi. 350ms juda kech.

### 3.3 Confetti palette

Trial yorqin nishonlash — lekin **brand korkasiz**: 8–10 ta hayotbaxsh rang ishlatamiz, **primary indigo** umuman aralashmaydi (uni TrialBanner egallaydi):

```ts
colors: [
  "#f44336", "#e91e63", "#9c27b0", "#3f51b5",
  "#2196f3", "#00bcd4", "#4caf50", "#ffeb3b",
  "#ff9800", "#ff5722",
]
```

Bursts: 2 ta side (chap+o'ng) → 1 ta center → 2 ta tail. **interval/clearInterval ishlatma** — kechikkan otishlar foreground rasm bilan ziddiyatga tushadi.

### 3.4 Skill chips — rainbow YO'Q

Hozir har skill o'z rangida (ko'k/binafsha/sariq/yashil) — bu Skills sahifasiga mos, lekin **welcome card** trial nishonlashi → bitta rang oilasi.

Tavsiya: hammasi **on-surface-variant** ranglarida, ikonkalar `text-primary`:

```tsx
<div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                bg-on-surface/[0.04] border border-on-surface/10">
  <Icon className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
  <span className="text-sm font-bold text-on-surface">{label}</span>
</div>
```

### 3.5 Yopish va idempotency

- Yopilganda: `localStorage[key]="1"` + animatsiya tugagach `visible=false`
- Optional: backend'ga `POST /auth/welcomed` chaqirish — keyingi qurilmada ham qayta chiqarmaslik
- Modal **bir martagina** mount-da effekt ichida render bo'ladi. StrictMode-da effect 2 marta ishlasa, `mountedRef` guard ishlatish

```ts
const firedRef = useRef(false)
useEffect(() => {
  if (firedRef.current) return
  if (!ready || !shouldShow) return
  firedRef.current = true
  // ... fire
}, [ready, shouldShow])
```

---

## 4. TrialBanner pattern — "appga kirganda darhol"

### 4.1 Hozirgi muammo

`HomeScreen` ichida shunchaki:

```tsx
const user = useAuthStore((s) => s.user)
if (!user?.trial?.active) return null
```

`user` boshida `null` → banner mount **bo'lmaydi**. `/auth/me` javobi `useAuthStore.setState({ user })` qilganda re-render bo'lishi kerak — lekin `HomeScreen` allaqachon mount bo'lib bo'lgan, ichki "if return null" branchda joylashgan. Zustand selector pattern bilan to'g'ri ishlashi kerak ammo praktikada `persist` middleware **rehydration**ni kechiktiradi.

### 4.2 Yechim — 3 qatlam

#### Qatlam 1: Persist rehydration sinxron

`useAuthStore`'da:

```ts
persist(
  (set) => ({ ... }),
  {
    name: "elevo-auth",
    storage: createJSONStorage(() => localStorage),
    // ⬇ asosiy: rehydrate dastlab sinxron bo'lsin
    skipHydration: false,
    onRehydrateStorage: () => (state) => {
      // mark resolved sub-state
    },
  }
)
```

#### Qatlam 2: `authResolved` flag

Store'ga qo'shing:

```ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  authResolved: boolean   // /auth/me yoki rehydrate tugagandagi flag
}
```

`useTelegramAuth` muvaffaqiyat YOKI fail bo'lganda `authResolved = true` qilinadi. Rehydrate'da agar `user` topilsa — darhol `true`.

#### Qatlam 3: Skeleton (NEVER null while resolving)

```tsx
export function TrialBanner() {
  const { user, authResolved } = useAuthStore()

  if (!authResolved) return <TrialBannerSkeleton />
  if (!user?.trial?.active) return null

  // ... real banner
}
```

`TrialBannerSkeleton`:

```tsx
function TrialBannerSkeleton() {
  return (
    <div className="elevo-card elevo-card-border rounded-2xl h-[148px] animate-pulse" />
  )
}
```

Bu pattern bilan banner **kontent yuklangan zahoti** o'z joyida turadi, layout shift bo'lmaydi.

### 4.3 Re-render kafolati

`useAuthStore` selectorlarini stabil saqlash:

```ts
// ❌ YOMON — har render'da yangi obyekt
const { user, authResolved } = useAuthStore((s) => ({
  user: s.user, authResolved: s.authResolved
}))

// ✅ YAXSHI — atomic selectorlar
const user          = useAuthStore((s) => s.user)
const authResolved  = useAuthStore((s) => s.authResolved)
```

Aks holda Zustand shallow-compare qilmasa, ortiqcha re-render yoki — eng yomoni — boshlang'ich `null`da qotib qoladi.

---

## 5. Ready-state contract — global

Ikkala komponent ham bitta umumiy hook'dan foydalansin:

```ts
// src/hooks/auth/use-app-ready.ts
export function useAppReady() {
  const splashDone   = useSplashDone()
  const authResolved = useAuthStore((s) => s.authResolved)
  return splashDone && authResolved
}
```

Foydalanish:

```tsx
const ready = useAppReady()

useEffect(() => {
  if (!ready) return
  // ... open welcome modal
}, [ready])
```

---

## 6. Backend contract (kerakli minimum)

`/auth/me` javobi:

```json
{
  "id": 123,
  "trial": {
    "active": true,
    "days_left": 3,
    "is_first_session": true   // ← BITTA marta true
  },
  "global_quota": { "remaining": 25, "total": 25 }
}
```

- `is_first_session` faqat **birinchi** `/auth/me` chaqirig'ida `true`. Server cache flag.
- Optional: `POST /auth/welcomed` — frontend yopgan paytida chaqiriladi, `is_first_session=false` qilib qo'yadi.

---

## 7. To'liq lifecycle diagrammasi

```
Telegram MiniApp open
  │
  ├─► SplashScreen mount (logo animatsiya)
  │       │
  │       └─ TelegramAutoAuth: initData → /auth/me (parallel)
  │             │
  │             ├─ success → store.user, authResolved=true
  │             └─ fail    → authResolved=true (user=null)
  │
  ├─► splash onComplete → splashDone=true
  │
  ├─► useAppReady() = true
  │
  ├─► HomeScreen render
  │       ├─ WelcomeCard (always)
  │       ├─ TrialBanner
  │       │     ├─ authResolved=false → Skeleton
  │       │     ├─ trial.active=true  → Banner (instant)
  │       │     └─ else               → null
  │       └─ ...
  │
  └─► WelcomeTrialModal effect
          ├─ ready && trial.active && is_first_session && !localStorage
          │     └─ +80ms → mount sheet
          │           └─ rAF×2 → animIn=true
          │                 ├─ +0ms   → playSuccess()
          │                 └─ +180ms → fireConfetti()
          └─ else → no-op
```

---

## 8. Anti-patterns (qilmaslik kerak)

- ❌ `setTimeout(..., 600)` — splash davomiyligini "taxmin qilish". Har doim **signal-based** kuting.
- ❌ Modal'ni `ErrorBoundary` tashqarisida render — import xatosi butun appni o'ldiradi. Modal **ErrorBoundary ichida** bo'lsin.
- ❌ Banner-ni `user?.trial?.active && <Banner />` bilan to'g'ridan-to'g'ri shartli render. `authResolved` flag'i bo'lmasa, blink/late bo'ladi.
- ❌ Confetti'da `setInterval` — sound bilan sinxronni buzadi.
- ❌ Sound'ni animatsiya tugagandan keyin chaqirish — kech keladi.
- ❌ `useAuthStore((s) => ({...}))` — yangi obyekt har render'da.

---

## 9. Implementation checklist

- [ ] `useAuthStore` ga `authResolved: boolean` qo'shish
- [ ] `useTelegramAuth` success/error'da `authResolved=true`
- [ ] `SplashProvider` allaqachon `useSplashDone()` export qiladi ✓
- [ ] `useAppReady` hook yaratish
- [ ] `TrialBanner` ga skeleton fallback qo'shish
- [ ] `TrialBannerSkeleton` komponent
- [ ] `WelcomeTrialModal`:
   - [ ] `useAppReady` ishlatish
   - [ ] `firedRef` guard (StrictMode)
   - [ ] Sound — `animIn=true` bilan birga, **delay yo'q**
   - [ ] Skill chip ranglari neutral (rainbow yo'q)
   - [ ] Confetti palette — primary indigo aralashmaydi
- [ ] Backend `/auth/me` ga `trial.is_first_session` field
- [ ] (Optional) `POST /auth/welcomed` endpoint

---

## 10. "Swiss watch" felt-test

Tugatgandan keyin tekshirilishi kerak:

1. **Cold start** (sessionStorage tozalangan, yangi user)
   - Splash → keyin Home darhol skeleton → keyin banner solid → 80ms → modal pastdan chiqadi, sound bilan
2. **Warm start** (splash o'tkazib yuborilgan, mavjud user)
   - Home darhol banner ko'rsatadi, modal **chiqmaydi**
3. **Navigation** (Home → Profile → Home)
   - Banner hamma tabda darhol turadi (skeleton flicker yo'q)
4. **Trial tugagan**
   - Banner mount bo'lmaydi, modal chiqmaydi
5. **localStorage tozalangan, lekin `is_first_session=false`**
   - Modal chiqmaydi (backend guard)

Hammasida: **blink yo'q, kechikish yo'q, qayta otish yo'q**.
