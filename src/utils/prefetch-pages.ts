/**
 * Prefetch all lazy page chunks during browser idle time.
 *
 * Called once after splash exits. Uses requestIdleCallback (with setTimeout
 * fallback) so prefetch never competes with user interactions or ongoing
 * network requests. Chunks are loaded sequentially — each starts only after
 * the previous finishes — to avoid saturating the connection.
 *
 * Result: first navigation to any page feels instant because the JS chunk
 * is already in the browser module cache.
 */

const PAGE_CHUNKS: Array<() => Promise<unknown>> = [
  // Bottom-nav pages — highest priority (user reaches these first)
  () => import("@/pages/skills"),
  () => import("@/pages/profile"),
  () => import("@/pages/stats"),
  // Secondary pages
  () => import("@/pages/upgrade"),
  () => import("@/pages/payment"),
  // Exam routes — large chunks, load last
  () => import("@/pages/reading-routes"),
  () => import("@/pages/listening-routes"),
  () => import("@/pages/speaking-routes"),
  () => import("@/pages/writing-routes"),
];

function scheduleIdle(fn: () => void): void {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(fn, { timeout: 4000 });
  } else {
    setTimeout(fn, 300);
  }
}

function prefetchSequential(queue: Array<() => Promise<unknown>>, index: number): void {
  if (index >= queue.length) return;
  scheduleIdle(() => {
    queue[index]()
      .catch(() => {/* ignore — prefetch is best-effort */})
      .finally(() => prefetchSequential(queue, index + 1));
  });
}

let _started = false;

export function prefetchPages(): void {
  if (_started) return;
  _started = true;
  // Small delay so the home screen's own render finishes first
  setTimeout(() => prefetchSequential(PAGE_CHUNKS, 0), 600);
}
