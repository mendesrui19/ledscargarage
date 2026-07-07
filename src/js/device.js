export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isMobileViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

export function isCoarsePointer() {
  return window.matchMedia('(pointer: coarse)').matches;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function shouldUseNativeScroll() {
  return prefersReducedMotion() || isTouchDevice() || isMobileViewport();
}
