# Changelog

All notable changes to the Elevo Vite project will be documented in this file.

## [Unreleased]

### Added
- Initial Vite setup with React 19
- Tailwind CSS v4 integration
- Elevo design system (indigo theme)
- Light/Dark mode support
- Base UI components (buttons, inputs, modals, etc.)
- Layout components (AppHeader, BottomNav)
- Dashboard components (WelcomeCard, ProgressCard, ExamStats, QuickPractice)
- Theme provider with localStorage persistence
- Telegram WebApp integration
- React Router 7 setup
- TanStack Query setup
- Splash screen provider
- Migration plan documentation

### Changed
- Migrated from Next.js to Vite for better performance
- Replaced Next.js routing with React Router
- Updated theme system to use CSS variables
- Improved build speed with Vite

### Fixed
- Theme conflict between UntitledUI and Elevo themes
- Default theme now set to light mode
- FOUC (Flash of Unstyled Content) prevention
- Tailwind CSS variable mapping

## [0.1.0] - 2024-01-XX

### Initial Release
- Project setup
- Basic structure
- Theme system
- Base components

---

## Migration Progress

### Phase 1: Foundation (In Progress)
- [ ] API client and endpoints
- [ ] TypeScript types
- [ ] Zod schemas
- [ ] Services (auth, speaking, writing)
- [ ] Zustand store
- [ ] Utility functions

### Phase 2: Authentication (Pending)
- [ ] Auth hooks
- [ ] Profile page
- [ ] User management

### Phase 3: Skills Pages (Pending)
- [ ] Skills overview page
- [ ] Stats page
- [ ] Upgrade page
- [ ] Payment page

### Phase 4: Reading Module (Pending)
- [ ] Reading components
- [ ] Reading hooks
- [ ] Reading pages (all parts + mock)

### Phase 5: Listening Module (Pending)
- [ ] Listening components
- [ ] Listening hooks
- [ ] Listening pages (all parts + mock)

### Phase 6: Speaking Module (Pending)
- [ ] Speaking components
- [ ] Speaking hooks
- [ ] Speaking pages

### Phase 7: Writing Module (Pending)
- [ ] Writing components
- [ ] Writing pages

### Phase 8: Polish & Testing (Pending)
- [ ] Full app testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation

---

**Legend:**
- ✅ Complete
- 🚧 In Progress
- ⏳ Pending
- ❌ Blocked
