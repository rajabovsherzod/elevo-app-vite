# 🚀 Elevo App: Next.js → Vite Migration Plan

## 📊 Migration Status Overview

### ✅ Already Migrated (100%)
- **Styles:** `globals.css`, `elevo-theme.css`, `typography.css`
- **Base Components:** All UntitledUI components (buttons, inputs, modals, etc.)
- **Foundation Components:** Logos, icons, featured icons
- **Shared Assets:** Background patterns, illustrations, mockups
- **Utils:** `cx.ts`, `countries.tsx`, `timezones.tsx`, `is-react-component.ts`
- **Hooks (Basic):** `use-breakpoint`, `use-clipboard`, `use-resize-observer`
- **Providers:** Query, Router, Splash, Telegram Auth, Theme
- **Layout:** AppHeader, BottomNav (Elevo components)
- **Dashboard:** WelcomeCard, ProgressCard, ExamStats, QuickPractice

### ❌ Not Yet Migrated

#### 1️⃣ **Core Infrastructure** (Priority: HIGH)
**Estimated Time: 2-3 hours**

- [ ] `src/lib/api/` - API client & endpoints
  - `client.ts` - Axios instance with interceptors
  - `endpoints.ts` - API endpoint constants
  - `reading.ts`, `listening.ts`, `writing.ts` - Skill-specific APIs
  - `reading-part5.ts`, `listening-mock.ts` - Part-specific APIs
  
- [ ] `src/types/` - TypeScript types
  - `api.types.ts` - API response/request types
  - `auth.types.ts` - Authentication types
  - `exam.types.ts` - Exam/question types
  - `speaking.types.ts`, `writing.types.ts` - Skill types

- [ ] `src/schemas/` - Zod validation schemas
  - `auth.schema.ts` - Auth validation
  - `speaking.schema.ts` - Speaking validation

- [ ] `src/services/` - Business logic services
  - `auth.service.ts` - Authentication service
  - `speaking.service.ts` - Speaking evaluation
  - `writing.service.ts` - Writing evaluation

- [ ] `src/store/` - Zustand state management
  - `auth.store.ts` - Auth state (user, tokens)

- [ ] `src/lib/utils/` - Utility functions
  - `a11y.ts` - Accessibility helpers
  - `validation.ts` - Form validation

- [ ] `src/lib/payment/` - Payment logic
  - `plans.ts` - Subscription plans

- [ ] `src/lib/schemas/` - Additional schemas
  - `reading.ts` - Reading validation

**Changes Needed:**
- Remove Next.js specific imports (`next/navigation`, `next/image`)
- Replace with React Router equivalents
- Update API client for Vite environment

---

#### 2️⃣ **Authentication & User Management** (Priority: HIGH)
**Estimated Time: 1-2 hours**

- [ ] `src/hooks/auth/`
  - `use-current-user.ts` - Get current user from store
  - `use-telegram-auth.ts` - Telegram WebApp authentication

- [ ] `src/app/profile/page.tsx` → `src/pages/profile.tsx`
  - User profile page
  - Settings, preferences

**Changes Needed:**
- Convert Next.js page to Vite page component
- Update routing from `useRouter()` to `useNavigate()`
- Remove `"use client"` directives

---

#### 3️⃣ **Skills Pages** (Priority: MEDIUM)
**Estimated Time: 3-4 hours**

- [ ] `src/app/skills/page.tsx` → `src/pages/skills.tsx`
  - Skills overview/selection page

- [ ] `src/app/upgrade/page.tsx` → `src/pages/upgrade.tsx`
  - Premium upgrade page
  - Payment integration

- [ ] `src/app/stats/page.tsx` → `src/pages/stats.tsx`
  - User statistics dashboard

- [ ] `src/app/payment/page.tsx` → `src/pages/payment.tsx`
  - Payment processing page

**Changes Needed:**
- Convert Next.js pages to Vite pages
- Update routing
- Remove Next.js metadata exports

---

#### 4️⃣ **Reading Module** (Priority: MEDIUM-HIGH)
**Estimated Time: 6-8 hours**

**Components:**
- [ ] `src/components/elevo/reading/` - Reading UI components
  - Question renderers (MCQ, True/False, Matching, etc.)
  - Passage display
  - Answer selection
  - Timer display
  - Progress indicators

**Hooks:**
- [ ] `src/hooks/reading/`
  - `part-1/`, `part-2/`, `part-3/`, `part-4/`, `part-5/` - Part-specific logic
  - `mock/` - Mock exam logic

**Pages:**
- [ ] `src/app/reading/page.tsx` → `src/pages/reading/index.tsx`
- [ ] `src/app/reading/part-1-1/` → `src/pages/reading/part-1-1.tsx`
- [ ] `src/app/reading/part-2/` → `src/pages/reading/part-2.tsx`
- [ ] `src/app/reading/part-3/` → `src/pages/reading/part-3.tsx`
- [ ] `src/app/reading/part-4/` → `src/pages/reading/part-4.tsx`
- [ ] `src/app/reading/part-5/` → `src/pages/reading/part-5.tsx`
- [ ] `src/app/reading/mock/` → `src/pages/reading/mock.tsx`

**Shared Hooks:**
- [ ] `src/hooks/shared/`
  - `use-exam-loader.ts` - Load exam data
  - `use-exam-submit.ts` - Submit answers
  - `use-exam-timer.ts` - Countdown timer

**Changes Needed:**
- Convert Next.js dynamic routes to React Router routes
- Update `useRouter()` to `useNavigate()` and `useParams()`
- Remove `"use client"` directives
- Update API calls to use Vite environment

---

#### 5️⃣ **Listening Module** (Priority: MEDIUM-HIGH)
**Estimated Time: 6-8 hours**

**Components:**
- [ ] `src/components/elevo/listening/` - Listening UI components
  - Audio player
  - Question renderers
  - Transcript display (if any)
  - Timer display

**Hooks:**
- [ ] `src/hooks/listening/`
  - `mock/` - Mock exam logic
  - Part-specific hooks (if any)

**Pages:**
- [ ] `src/app/listening/page.tsx` → `src/pages/listening/index.tsx`
- [ ] `src/app/listening/part-1/` → `src/pages/listening/part-1.tsx`
- [ ] `src/app/listening/part-2/` → `src/pages/listening/part-2.tsx`
- [ ] `src/app/listening/part-3/` → `src/pages/listening/part-3.tsx`
- [ ] `src/app/listening/part-4/` → `src/pages/listening/part-4.tsx`
- [ ] `src/app/listening/part-5/` → `src/pages/listening/part-5.tsx`
- [ ] `src/app/listening/part-6/` → `src/pages/listening/part-6.tsx`
- [ ] `src/app/listening/mock/` → `src/pages/listening/mock.tsx`

**Changes Needed:**
- Same as Reading module
- Ensure audio player works in Vite (Plyr integration)

---

#### 6️⃣ **Speaking Module** (Priority: MEDIUM)
**Estimated Time: 4-5 hours**

**Components:**
- [ ] `src/components/elevo/speaking/` - Speaking UI components
  - Audio recorder
  - Question display
  - Recording controls
  - Playback controls
  - Evaluation display

**Hooks:**
- [ ] `src/hooks/speaking/`
  - `use-speaking-evaluate.ts` - AI evaluation

**Pages:**
- [ ] `src/app/speaking/page.tsx` → `src/pages/speaking/index.tsx`
- [ ] `src/app/speaking/part-1-1/` → `src/pages/speaking/part-1-1.tsx`

**Changes Needed:**
- Ensure audio recording works in Vite
- Update API calls for AI evaluation
- Convert Next.js pages to Vite pages

---

#### 7️⃣ **Writing Module** (Priority: MEDIUM)
**Estimated Time: 4-5 hours**

**Components:**
- [ ] `src/components/elevo/writing/` - Writing UI components
  - Text editor
  - Word counter
  - Timer display
  - Evaluation display

**Pages:**
- [ ] `src/app/writing/page.tsx` → `src/pages/writing/index.tsx`
- [ ] `src/app/writing/part-1-1/` → `src/pages/writing/part-1-1.tsx`

**Changes Needed:**
- Convert Next.js pages to Vite pages
- Update API calls for AI evaluation

---

#### 8️⃣ **Shared Components** (Priority: LOW)
**Estimated Time: 2-3 hours**

- [ ] `src/components/elevo/shared/` - Shared Elevo components
  - Common UI elements used across skills
  - Question wrappers
  - Answer feedback

- [ ] `src/components/elevo/splash/` - Splash screen
  - Loading animation
  - App initialization

- [ ] `src/components/elevo/upgrade/` - Upgrade components
  - Premium features showcase
  - Pricing cards

- [ ] `src/components/dev/` - Development tools
  - `dev-console.tsx` - Debug console

**Changes Needed:**
- Minimal changes needed
- Just copy and test

---

## 📋 Migration Workflow (Step-by-Step)

### Phase 1: Foundation (Day 1 - 4-5 hours)
**Goal:** Get core infrastructure working

1. **API & Types** (2-3 hours)
   ```bash
   # Copy files
   cp -r elevo-app/src/lib/api elevo-app-vite/src/lib/
   cp -r elevo-app/src/types/*.ts elevo-app-vite/src/types/
   cp -r elevo-app/src/schemas elevo-app-vite/src/
   cp -r elevo-app/src/services elevo-app-vite/src/
   cp -r elevo-app/src/store elevo-app-vite/src/
   cp -r elevo-app/src/lib/utils elevo-app-vite/src/lib/
   cp -r elevo-app/src/lib/payment elevo-app-vite/src/lib/
   cp -r elevo-app/src/lib/schemas elevo-app-vite/src/lib/
   ```

2. **Fix Imports** (1 hour)
   - Remove `next/navigation` → use `react-router`
   - Remove `next/image` → use `<img>`
   - Update environment variables (`process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*`)

3. **Test API Client** (30 min)
   - Create test page
   - Make API call
   - Verify response

### Phase 2: Auth & User (Day 1 - 1-2 hours)
**Goal:** Get authentication working

1. **Copy Auth Hooks** (30 min)
   ```bash
   cp -r elevo-app/src/hooks/auth elevo-app-vite/src/hooks/
   ```

2. **Create Profile Page** (1 hour)
   ```bash
   cp elevo-app/src/app/profile/page.tsx elevo-app-vite/src/pages/profile.tsx
   ```

3. **Update Routing** (30 min)
   - Add route to `main.tsx`
   - Test navigation

### Phase 3: Simple Pages (Day 2 - 3-4 hours)
**Goal:** Get non-exam pages working

1. **Skills Page** (1 hour)
2. **Stats Page** (1 hour)
3. **Upgrade Page** (1 hour)
4. **Payment Page** (1 hour)

### Phase 4: Reading Module (Day 3-4 - 6-8 hours)
**Goal:** Get Reading fully working

1. **Copy Components** (1 hour)
2. **Copy Hooks** (1 hour)
3. **Create Pages** (2 hours)
4. **Test Each Part** (2-3 hours)
5. **Fix Bugs** (1 hour)

### Phase 5: Listening Module (Day 5-6 - 6-8 hours)
**Goal:** Get Listening fully working

1. **Copy Components** (1 hour)
2. **Copy Hooks** (1 hour)
3. **Create Pages** (2 hours)
4. **Test Audio Player** (1 hour)
5. **Test Each Part** (2-3 hours)
6. **Fix Bugs** (1 hour)

### Phase 6: Speaking Module (Day 7 - 4-5 hours)
**Goal:** Get Speaking fully working

1. **Copy Components** (1 hour)
2. **Copy Hooks** (1 hour)
3. **Create Pages** (1 hour)
4. **Test Audio Recording** (1-2 hours)
5. **Fix Bugs** (1 hour)

### Phase 7: Writing Module (Day 8 - 4-5 hours)
**Goal:** Get Writing fully working

1. **Copy Components** (1 hour)
2. **Create Pages** (1 hour)
3. **Test Text Editor** (1 hour)
4. **Test AI Evaluation** (1-2 hours)
5. **Fix Bugs** (1 hour)

### Phase 8: Polish & Testing (Day 9 - 4-6 hours)
**Goal:** Final testing and bug fixes

1. **Copy Remaining Components** (1 hour)
2. **Full App Testing** (2-3 hours)
3. **Bug Fixes** (1-2 hours)
4. **Performance Optimization** (1 hour)

---

## ⏱️ Total Estimated Time

| Phase | Time | Cumulative |
|-------|------|------------|
| Phase 1: Foundation | 4-5 hours | 4-5 hours |
| Phase 2: Auth & User | 1-2 hours | 5-7 hours |
| Phase 3: Simple Pages | 3-4 hours | 8-11 hours |
| Phase 4: Reading | 6-8 hours | 14-19 hours |
| Phase 5: Listening | 6-8 hours | 20-27 hours |
| Phase 6: Speaking | 4-5 hours | 24-32 hours |
| Phase 7: Writing | 4-5 hours | 28-37 hours |
| Phase 8: Polish | 4-6 hours | 32-43 hours |

**Total: 32-43 hours (4-5 working days)**

---

## 🎯 Recommended Approach

### Option 1: Full Migration (4-5 days)
- Migrate everything at once
- Test thoroughly
- Switch to Vite completely

### Option 2: Incremental Migration (2-3 weeks)
- Migrate one module per day
- Keep Next.js running in parallel
- Test each module before moving to next
- Gradual transition

### Option 3: Priority-Based (1-2 weeks)
- Start with most-used features (Reading, Listening)
- Then less-used features (Speaking, Writing)
- Finally, admin/settings pages

---

## 🚨 Common Issues & Solutions

### Issue 1: Next.js Routing → React Router
**Problem:** `useRouter()`, `usePathname()`, `useSearchParams()` don't exist
**Solution:**
```tsx
// Before (Next.js)
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/path')

// After (Vite + React Router)
import { useNavigate } from 'react-router'
const navigate = useNavigate()
navigate('/path')
```

### Issue 2: Environment Variables
**Problem:** `process.env.NEXT_PUBLIC_*` undefined
**Solution:**
```tsx
// Before
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// After
const apiUrl = import.meta.env.VITE_API_URL
```

### Issue 3: Image Optimization
**Problem:** `next/image` doesn't exist
**Solution:**
```tsx
// Before
import Image from 'next/image'
<Image src="/logo.png" width={100} height={100} alt="Logo" />

// After
<img src="/logo.png" width={100} height={100} alt="Logo" />
```

### Issue 4: Metadata & SEO
**Problem:** `export const metadata` doesn't work
**Solution:**
```tsx
// Use react-helmet or similar
import { Helmet } from 'react-helmet-async'

<Helmet>
  <title>Page Title</title>
  <meta name="description" content="..." />
</Helmet>
```

---

## ✅ Checklist Before Starting

- [ ] Backup Next.js app
- [ ] Create git branch for migration
- [ ] Set up Vite environment variables
- [ ] Test Vite dev server
- [ ] Verify Tailwind CSS works
- [ ] Test API client connection
- [ ] Verify Telegram WebApp SDK works

---

## 🎉 Success Criteria

- [ ] All pages render correctly
- [ ] All API calls work
- [ ] Authentication works
- [ ] All exam modules work (Reading, Listening, Speaking, Writing)
- [ ] Audio recording/playback works
- [ ] Timer works correctly
- [ ] Answer submission works
- [ ] AI evaluation works
- [ ] Payment integration works
- [ ] No console errors
- [ ] Performance is good (fast load times)
- [ ] Mobile responsive
- [ ] Dark/Light mode works

---

## 📝 Notes

- **Start with Phase 1** - Foundation is critical
- **Test frequently** - Don't wait until the end
- **Commit often** - Small, incremental commits
- **Document issues** - Keep track of problems and solutions
- **Ask for help** - If stuck, ask questions

**Good luck! 🚀**
