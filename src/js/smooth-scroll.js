import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { shouldUseNativeScroll } from './device.js';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ limitCallbacks: false });

export function initSmoothScroll(reducedMotion) {
  const progressFill = document.querySelector('.progress-hud__fill');

  const onProgress = (self) => {
    if (progressFill) progressFill.style.width = `${self.progress * 100}%`;
  };

  if (reducedMotion || shouldUseNativeScroll()) {
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: onProgress });

    let vvTimer;
    const refreshOnViewport = () => {
      clearTimeout(vvTimer);
      vvTimer = setTimeout(() => ScrollTrigger.refresh(true), 150);
    };
    window.visualViewport?.addEventListener('resize', refreshOnViewport, { passive: true });
    window.visualViewport?.addEventListener('scroll', refreshOnViewport, { passive: true });

    return null;
  }

  const lenis = new Lenis({
    lerp: 0.2,
    duration: 0.85,
    smoothWheel: true,
    wheelMultiplier: 1.15,
    touchMultiplier: 1.6,
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => lenis.raf(time * 1000));

  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: onProgress });

  ScrollTrigger.refresh();

  return lenis;
}
