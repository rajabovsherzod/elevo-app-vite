# 📋 TODO - Elevo Vite Migration

## 🔥 Ertaga Boshlash (Day 1)

### Phase 1: Foundation (4-5 hours)

#### 1. API & Types (2-3 hours)

**Step 1: Copy Files**
```bash
# API client
cp -r ../elevo-app/src/lib/api src/lib/

# Types
cp ../elevo-app/src/types/api.types.ts src/types/
cp ../elevo-app/src/types/auth.types.ts src/types/
cp ../elevo-app/src/types/exam.types.ts src/types/
cp ../elevo-app/src/types/speaking.types.ts src/types/
cp ../elevo-app/src/types/writing.types.ts src/types/

# Schemas
cp -r ../elevo-app/src/schemas src/

# Services
cp -r ../elevo-app/src/services src/

# Store
cp -r ../elevo-app/src/store src/

# Utils
cp -r ../elevo-app/src/lib/utils src/lib/
cp -r ../elevo-app/src/lib/payment src/lib/
cp -r ../elevo-app/src/lib/schemas src/lib/
```

**Step 2: Fix Imports (1 hour)**
- [ ] Open `src/lib/api/client.ts`
  - Remove `next/navigation` imports
  - Update environment variables: `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*`
  
- [ ] Open all files in `src/lib/api/`
  - Check for Next.js specific imports
  - Update to React Router equivalents

- [ ] Open all files in `src/services/`
  - Check for Next.js specific imports
  - Update to React Router equivalents

**Step 3: Create .env File (10 min)**
```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env
```

Add:
```env
VITE_API_URL=https://your-backend-api.com/api
VITE_API_TIMEOUT=30000
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

**Step 4: Test API Client (30 min)**
- [ ] Create test page: `src/pages/test-api.tsx`
- [ ] Import API client
- [ ] Make a test API call
- [ ] Check console for errors
- [ ] Verify response format

---

#### 2. Auth Hooks (1 hour)

**Step 1: Copy Auth Hooks**
```bash
cp -r ../elevo-app/src/hooks/auth src/hooks/
```

**Step 2: Fix Imports**
- [ ] Open `src/hooks/auth/use-current-user.ts`
  - Check imports
  - Update if needed

- [ ] Open `src/hooks/auth/use-telegram-auth.ts`
  - Check Telegram WebApp integration
  - Update if needed

**Step 3: Test Auth**
- [ ] Add auth test to test page
- [ ] Try to get current user
- [ ] Check if Telegram auth works

---

#### 3. Profile Page (1 hour)

**Step 1: Copy Profile Page**
```bash
cp ../elevo-app/src/app/profile/page.tsx src/pages/profile.tsx
```

**Step 2: Convert to Vite Page**
- [ ] Remove `"use client"` directive
- [ ] Remove Next.js metadata exports
- [ ] Update imports:
  ```tsx
  // Before
  import { useRouter } from 'next/navigation'
  
  // After
  import { useNavigate } from 'react-router'
  ```

**Step 3: Add Route**
- [ ] Open `src/main.tsx`
- [ ] Add profile route:
  ```tsx
  import { ProfilePage } from '@/pages/profile'
  
  <Route path="/profile" element={<ProfilePage />} />
  ```

**Step 4: Test**
- [ ] Navigate to `/profile`
- [ ] Check if page renders
- [ ] Test navigation

---

## ✅ End of Day 1 Checklist

- [ ] API client works
- [ ] Types are imported
- [ ] Services work
- [ ] Store works
- [ ] Auth hooks work
- [ ] Profile page renders
- [ ] No console errors
- [ ] Git commit: "feat: Phase 1 - Foundation complete"

---

## 📅 Day 2 Plan (Simple Pages)

### Phase 3: Simple Pages (3-4 hours)

1. **Skills Page** (1 hour)
   - Copy from Next.js
   - Convert to Vite
   - Add route
   - Test

2. **Stats Page** (1 hour)
   - Copy from Next.js
   - Convert to Vite
   - Add route
   - Test

3. **Upgrade Page** (1 hour)
   - Copy from Next.js
   - Convert to Vite
   - Add route
   - Test

4. **Payment Page** (1 hour)
   - Copy from Next.js
   - Convert to Vite
   - Add route
   - Test

---

## 🎯 Success Criteria for Day 1

- [ ] Can make API calls
- [ ] Can authenticate
- [ ] Profile page works
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] App runs without crashes

---

## 🚨 Common Issues & Quick Fixes

### Issue: "Cannot find module 'next/navigation'"
**Fix:** Replace with React Router:
```tsx
import { useNavigate, useParams, useSearchParams } from 'react-router'
```

### Issue: "process.env is undefined"
**Fix:** Use Vite env:
```tsx
const apiUrl = import.meta.env.VITE_API_URL
```

### Issue: "Image component not found"
**Fix:** Use regular img tag:
```tsx
<img src="/logo.png" alt="Logo" />
```

### Issue: "useRouter is not a function"
**Fix:** Use useNavigate:
```tsx
const navigate = useNavigate()
navigate('/path')
```

---

## 📝 Notes

- **Commit often** - After each successful step
- **Test frequently** - Don't wait until the end
- **Ask for help** - If stuck for more than 15 minutes
- **Take breaks** - Every 1-2 hours

---

## 🎉 Motivation

**You got this!** 💪

Remember:
- Start small
- Test often
- Commit frequently
- Ask questions
- Take breaks

**Good luck!** 🚀
