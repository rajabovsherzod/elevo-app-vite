# Speaking Part 1.1 — Professional Fix Plan

**Date:** 2026-05-17
**Author:** Senior Frontend Engineer (Claude)
**Target:** `elevo-app-vite/src/components/elevo/speaking/part-1-1/*` + `hooks/speaking/use-part1-1-flow.ts`
**Goal:** Make Part 1.1 recording flow work like a **Swiss watch** — micro-precise, zero data loss, identical behavior on desktop and mobile (iOS Safari + Android Chrome).

---

## 1. Joriy Muammolarning Aniq Tahlili (Root Cause Analysis)

### 1.1 Desktop bug — “Birinchi 2 audio bo‘sh, faqat 3-chisi yoziladi”

**Symptom:** Backend evaluation natijasida `question_1` va `question_2` uchun `transcript: ""` / `no response` qaytadi. Faqat `question_3` to'g'ri baholanadi.

**Root cause — bu siljish/shift bug emas, aksincha race + lifecycle muammosi:**

Hozirgi arxitekturada:

```
Parent (usePart1_1Flow) ──owns──> streamRef (shared MediaStream)
       │
       └─ <Part1_1QuestionStage key={phase.index} />   ← REMOUNT har savolda
             ├─ MediaRecorder (per-mount, yangi instance)
             ├─ chunksRef = []  (per-mount)
             └─ onstop → onAudioReady(file)
```

**Kritik nuqta:** `key={phase.index}` orqali har savolda butun Stage komponent **unmount** bo'lib, **yangidan mount** qilinadi. `chunksRef` va `recorderRef` ham yangidan yaratiladi.

Recorder `r.stop()` ASYNC ishlaydi:
1. `r.stop()` chaqiriladi → state darhol `"inactive"` bo'ladi
2. `ondataavailable` event **event queue**ga qo'shiladi (oxirgi chunk uchun)
3. `onstop` event queue'ga qo'shiladi

**Bu yerda 3 ta bir-biriga bog'liq muammo bor:**

**(A) `recorder.start(100)` timeslice — bir qator browserlarda final-chunk yetib bormaydi.**
Ba'zi Chromium versiyalarida (ayniqsa MediaRecorder + `audio/webm;codecs=opus` bilan) `timeslice` parametri qo'yilganida `stop()` chaqirilganda **oxirgi 100ms** ichidagi data tushib qoladi yoki `ondataavailable` `onstop`'dan **keyin** kelishi mumkin. Bu hozirgi spec'da to'g'ri bo'lsa-da, real implementation-larda glitch bor.

**(B) `onstop` davomida component allaqachon unmount qilinmoqda.**
- `r.stop()` → JS context bo'shaydi → setTimeout(0) callbacklari, microtaskslar, va event queue kelishi mumkin
- Cleanup `useEffect`'da: `if (r && r.state !== "inactive") r.stop()` — qayta `stop()` chaqiriladi
- `r.state === "inactive"` bo'lgani uchun no-op, **lekin** ba'zan brauzer queue'dagi `ondataavailable`ni `cancel` qilishi mumkin

**(C) "Stale closure" / "double-fire" — eng katta tahdid.**
Stage komponentda:
```js
recordStartedRef.current = false  // har mount-da false
useEffect(() => {
  if (phase !== "record" || recordStartedRef.current) return
  recordStartedRef.current = true
  startRecording()
}, [phase])
```
React 19 StrictMode'da mount→unmount→mount sxemasi ishlatilganda birinchi mount cleanup'da recorderRef tozalanadi. Ikkinchi mount-da yangi recorder ochiladi va birinchi recorder'ning `onstop`'i baribir trigger bo'ladi → `onAudioReady(empty file)` chaqirilishi mumkin (chunks tozalangan).

Lekin ENG ASOSIY muammo:

**(D) Parent darajada audio collection logic NON-DETERMINISTIC.**

```js
const handleAudioReady = useCallback((blob) => {
  const next = [...audiosRef.current, blob]
  audiosRef.current = next
  if (next.length < 3) {
    setPhase({ type: "question", index: next.length })
  } else {
    setPhase({ type: "calculating" })
    evaluate.mutate(next)
  }
}, [evaluate])
```

Buni traceing qilamiz:
- Q1 stop → recorder1.onstop ASYNC → BUT — `onAudioReady` darhol setPhase chaqiradi → React batches updates → re-render
- Re-render to'g'ri navbat bilan keladi DEYIB OLDIN edi
- AMMO: agar Q1'ning `onstop`'i qachondir delay bilan chaqirilsa (browser-dependent), va shu vaqt orasida cleanup `r.stop()`'ni qayta chaqirsa, **`onstop` 2 marta** fire bo'lishi mumkin (yoki **0 marta**) — natijada `audiosRef`'ga noto'g'ri tartibda push bo'ladi.

**Eng muhimi:** `key={phase.index}` ishlatilganligi sababli, audio capture lifecycle **butun Stage component**'ning lifecycle'iga bog'lab qo'yilgan. Bu juda nozik (fragile) dizayn.

---

### 1.2 Mobile bug — “Wavesurfer qimirlamaydi, audio yozilmaydi”

**Symptom:** Mobilda 3 savolga ham `no response` keladi. Wave-form animatsiyasi umuman ishlamaydi.

**Root causes:**

**(A) iOS Safari MIME type qo'llab-quvvatlash:**
- iOS Safari `audio/webm` ni QO'LLAB-QUVVATLAMAYDI
- Hozirgi `getRecorderMimeType()` candidates ro'yxatida `audio/mp4` faqat **eng oxirida** turibdi
- Bu o'zi muammo emas (chunki webm/ogg false bo'lsa mp4'ga tushadi)
- AMMO: ba'zi Android Chrome versiyalari `audio/mp4`'ni `isTypeSupported` da `true` qaytaradi, lekin recorder ishga tushmaydi

**(B) iOS Safari `MediaRecorder.start(timeslice)` — JIDDIY:**
iOS Safari'da `start(100)` chaqirilganida `ondataavailable` event timeslice bo'yicha **MUTLAQO fire BO'LMAYDI**. Faqat `stop()` chaqirilganida bir marta fire bo'ladi. Lekin agar `stop()` chaqirilishidan oldin component unmount qilinsa, data yo'qoladi.

**(C) iOS Safari `MediaStream.clone()` — mavjud emas/buggy:**
```js
const visStream = stream.clone()  // ← iOS Safari'da ba'zan exception, ba'zan empty stream
```
Bu yerda `try/catch` ushlaydi va `visualizeMock()`'ga tushadi. Lekin recording uchun stream'ga ta'sir qilmaydi.

**(D) iOS Safari AudioContext autoplay policy:**
`new AudioContext()` mobilda **suspended** state'da yaratiladi. `ctx.resume()` faqat user gesture'da ishlaydi. Bizning flow'da intro'dan keyin auto-prep boshlanadi — user gesture yo'q. Shuning uchun AudioContext suspended qoladi, analyser data bermaydi → mock visualizer chaqiriladi, lekin u ham canvas ref'ga ulanishidan oldin component-state o'zgarib ulgurmasdan re-render bo'lib ketishi mumkin.

**(E) MediaStream'ni ikki marta ishlatish (recorder + analyser) iOS'da nooptimal:**
iOS WebKit MediaStream'ni 2 ta consumer'ga (MediaRecorder + AudioContext) bog'lashda audio rendering'ni buzishi mumkin. Bu document'lashtirilmagan, lekin real-world reports'da bor.

---

### 1.3 Umumiy arxitektura kamchiliklari

1. **Recording logic UI-component ichida** — bu lifecycle-bound, fragile.
2. **`onAudioReady` callback orqali parent'ga submit qilish** — async race-condition'larga ochiq.
3. **Bo'sh blob validatsiya yo'q** — backend'ga empty file submit qilinaveradi.
4. **Retry imkoniyati yo'q** — bitta audio fail bo'lsa ham, butun flow boshidan boshlanadi.
5. **iOS Safari uchun fallback yo'q** — webm-only assumption.
6. **AudioContext singleton emas** — har savolda qayta yaratiladi, mobilda suspend qoladi.
7. **Visualization stream'i alohida clone** — keraksiz murakkablik.

---

## 2. SWISS WATCH Arxitekturasi (Yangi Dizayn)

### 2.1 Asosiy printsiplar

1. **Recording logic'ni hook ichiga ko'chirish** — UI component pure rendering.
2. **Promise-based per-question recorder** — har savol o'z `Promise<File>` qaytaradi, faqat `onstop` to'liq tugagandan keyin resolve bo'ladi.
3. **Audio'lar har savoldan keyin DARHOL session storage (parent useRef)'ga deterministik yoziladi** — index bo'yicha (`audios[0]`, `audios[1]`, `audios[2]`), append emas.
4. **Bo'sh blob validatsiyasi** — file.size < 1KB bo'lsa, retry option taklif qilinadi.
5. **iOS-first MIME selection** — `audio/mp4` ni Safari'da birinchi tekshiramiz.
6. **`recorder.start()` timeslice'siz** — bu cross-browser eng ishonchli.
7. **Single AudioContext** — intro'dagi user-gesture (audio.play) bilan resume qilinadi, butun session davomida ishlatiladi.
8. **Visualization optional** — recording'dan ajratiladi. Agar mobilda waveform ishlamasa, **recording baribir ishlaydi**.

### 2.2 Yangi fayl strukturasi

```
hooks/speaking/
├── use-part1-1-flow.ts           ← orchestrator (faqat phase + audio collection)
├── use-mic-recorder.ts           ← YANGI: promise-based recorder hook
└── use-audio-visualizer.ts       ← YANGI: ixtiyoriy waveform (recording'dan mustaqil)

components/elevo/speaking/part-1-1/
├── part1-1-introduction.tsx      ← o'zgarmaydi
├── part1-1-calculating.tsx       ← o'zgarmaydi
└── part1-1-question-stage.tsx    ← pure UI: phase, timer, waveform — props orqali
```

### 2.3 `use-mic-recorder.ts` API

```ts
export function useMicRecorder() {
  const recordOnce: (opts: { stream: MediaStream; maxSeconds: number }) => Promise<File>
  // resolves with File when stop fires OR maxSeconds reached
  // rejects on hardware error
  const stopCurrent: () => void  // erta tugatish uchun
}
```

**Promise hech qachon component unmount'i bilan reject bo'lmaydi** — chunki recorder lifecycle parent hook'ga bog'langan (Stage component remount qilinsa ham, recording davom etadi).

### 2.4 Yangi flow ketma-ketligi

```
mount (intro phase)
  └─ stream allaqachon olingan (mic permission)
  └─ AudioContext yaratilgan va INTRO audio.play() user-gesture orqali RESUMED
     ↓
intro audio tugadi → phase = question:0
     ↓
useEffect: phase=question:0 boshlanganida
  1. 5s prep countdown (UI)
  2. beep sound
  3. recordOnce(stream, 30s) → Promise<File>
  4. Promise resolved → audios[0] = file
  5. validate (size > 1KB)
  6. setPhase(question:1)
     ↓
useEffect: phase=question:1 boshlanganida
  ... (xuddi shu sxema)
     ↓
question:2 tugadi → audios = [f1, f2, f3]
  → barchasini validate qilamiz
  → setPhase(calculating)
  → evaluate.mutate(audios)
     ↓
success → result phase
error → retry option
```

**Asosiy nozik nuqta:** Recording promise'i Stage component'iga bog'liq EMAS. Stage faqat current phase'ni vizualizatsiya qiladi. Recording mantiqi parent hook'da yashaydi va lifecycle'i `phase`'ga bog'lanadi, mount/unmount'ga emas.

### 2.5 Mobile-specific fixes

| Muammo | Yechim |
|---|---|
| iOS Safari `audio/webm` ishlamaydi | MIME candidates: `audio/mp4` ni iOS'da birinchi (`/iPhone\|iPad\|iPod/.test(navigator.userAgent)`) |
| `start(100)` timeslice iOS'da ishlamaydi | `start()` ni timeslice'siz ishlatamiz — `ondataavailable` faqat stop'da fire bo'ladi, bu OK |
| AudioContext suspended qoladi | Intro audio.play() ichida `audioCtx.resume()` chaqiramiz (user-gesture) |
| `stream.clone()` iOS'da fail | Clone'siz: bitta stream'ga ham MediaRecorder, ham AudioContext analyzer ulanadi. iOS'da ishlaydi. |
| Waveform animation ishlamasa ham recording davom etishi kerak | Visualizer xato bo'lsa silent fallback (`mock` animatsiya), lekin recorder mustaqil ishlaydi |

### 2.6 Validation + Error UX

- Har audio yozib olinganidan keyin `file.size`ni check qilamiz
- Agar `< 1024 bytes` bo'lsa: **shu savolni qayta yozish** uchun option ko'rsatamiz (yoki butun flow'ni retry)
- 3 audio tayyor bo'lsagina backend'ga submit qilinadi
- Submit'dan oldin barcha 3 ta blob non-empty ekanligini final-check qilamiz

---

## 3. Implementatsiya Bosqichlari (Tasklar Ketma-ketligi)

> Har bir bosqich mustaqil tekshiriladi va keyingisiga o'tishdan oldin tasdiqlanadi.

### **Bosqich 1: `useMicRecorder` hook'ini yaratish**
- [ ] `src/hooks/speaking/use-mic-recorder.ts` yaratish
- [ ] Promise-based `recordOnce(stream, maxSeconds)` API
- [ ] iOS-first MIME detection
- [ ] timeslice'siz `start()`
- [ ] `onstop` ichida fully await chunks, then resolve(File)
- [ ] `stopCurrent()` — erta tugatish (Erta tugatish tugmasi uchun)
- [ ] Empty blob detection (size < 1KB)

### **Bosqich 2: `useAudioVisualizer` hook'i (optional)**
- [ ] `src/hooks/speaking/use-audio-visualizer.ts`
- [ ] Single AudioContext lifecycle
- [ ] Canvas ref qabul qiladi
- [ ] `attach(stream, canvas)` / `detach()` API
- [ ] Suspended state'da silent mock fallback
- [ ] Recording mantiqiga ta'sir qilmaydi

### **Bosqich 3: `usePart1_1Flow` refactor**
- [ ] `audiosRef`'ni index-based qilamiz: `audios = [null, null, null]`
- [ ] Phase change effect'i ichida recording orchestrate qilinadi
- [ ] AudioContext intro audio.play() ichida resume qilinadi (user-gesture)
- [ ] Empty blob bo'lsa shu question'ni qayta yozish (retry button)
- [ ] All 3 valid bo'lganda `evaluate.mutate()`

### **Bosqich 4: `Part1_1QuestionStage`'ni pure UI'ga aylantirish**
- [ ] Recorder lifecycle olib tashlandi
- [ ] Props: `phase ("prep"|"beep"|"record")`, `timeLeft`, `questionText`, `questionNumber`, `analyser?` (yoki `level: number 0-1`)
- [ ] Canvas faqat o'qiydi, hech narsa boshqarmaydi
- [ ] "Erta tugatish" tugmasi parent callback chaqiradi

### **Bosqich 5: Cross-browser testing checklist**
- [ ] Desktop Chrome — 3 savol to'liq yozilishi, submit ishlashi
- [ ] Desktop Firefox — xuddi shunday
- [ ] Desktop Safari — xuddi shunday
- [ ] iOS Safari (real device) — 3 savol to'liq + waveform animatsiya
- [ ] Android Chrome — 3 savol to'liq + waveform animatsiya
- [ ] Slow network — submit timeout 120s ishlashi
- [ ] Mic permission deny — error UX
- [ ] Mid-recording navigation away — stream tracks to'g'ri release

### **Bosqich 6: Validatsiya va Error UX**
- [ ] Bo'sh audio detection
- [ ] Per-question retry button
- [ ] Network error → retry option (audio'lar saqlanadi)
- [ ] Mic disconnected mid-recording → clear error message

### **Bosqich 7: Cleanup va final review**
- [ ] Eski kodning izlari yo'q
- [ ] Memory leak'lar yo'q (stream tracks, audio context, animation frames)
- [ ] Console.log'lar yo'q
- [ ] TypeScript strict mode'da xato yo'q

---

## 4. Kafolatlanadigan Natijalar

✅ Desktop'da 3 ta audio ham to'liq yoziladi va backend to'liq response qaytaradi
✅ Mobile'da (iOS + Android) 3 ta audio ham to'liq yoziladi
✅ Wavesurfer mobilda ham (yoki silent fallback bilan, lekin recording har doim ishlaydi)
✅ Race-condition yo'q — har audio deterministik index'ga yoziladi
✅ Empty blob backend'ga yuborilmaydi
✅ Network/mic error'larda graceful UX

---

## 5. Tasdiqlash

Iltimos shu rejani ko'rib chiqing:
- Agar **OK** desangiz → Bosqich 1'dan boshlayman, har bosqichdan keyin sizga xabar beraman
- Agar biror bosqichni o'zgartirish/qo'shish kerak bo'lsa → ayting, planni yangilayman
- Agar arxitekturada boshqacha yo'l istasangiz → muhokama qilamiz

**Bo'sh modullar yaratmayman, eski kod refactoring orqali qayta tuziladi.**
