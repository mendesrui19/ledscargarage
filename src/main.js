import './js/site-guard.js';
import './styles/main.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initPreloader } from './js/preloader.js';
import { initSmoothScroll } from './js/smooth-scroll.js';
import { initNavigation } from './js/navigation.js';
import { splitChars } from './js/text-effects.js';
import { initHeroCinematic } from './js/hero-cinematic.js';
import { initMagnetic } from './js/magnetic.js';
import { initVehicleViewer } from './js/vehicle-viewer.js';
import { initTilt } from './js/tilt.js';
import { initStats, initReveals } from './js/stats.js';
import { initForm } from './js/form.js';
import { isTouchDevice } from './js/device.js';
import { initCatalogPreview } from './js/catalog-preview.js';
import { initProjectShowcase } from './js/project-showcase.js';

gsap.registerPlugin(ScrollTrigger);

async function boot() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = isTouchDevice();

  window.scrollTo(0, 0);
  history.scrollRestoration = 'manual';

  splitChars(document);
  await initPreloader(reducedMotion);

  const lenis = initSmoothScroll(reducedMotion);
  if (lenis) lenis.scrollTo(0, { immediate: true });

  initNavigation(lenis);

  initVehicleViewer(reducedMotion);

  await initHeroCinematic(reducedMotion);

  initMagnetic();
  initProjectShowcase(reducedMotion);
  initCatalogPreview(reducedMotion);
  initTilt(reducedMotion);
  initStats(reducedMotion);
  initReveals(reducedMotion);
  initForm();

  document.body.classList.add('is-ready');

  ScrollTrigger.refresh(true);

  let resizeTimer;
  const onLayoutChange = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(true), 200);
  };
  window.addEventListener('resize', onLayoutChange, { passive: true });
  window.addEventListener('orientationchange', onLayoutChange, { passive: true });

  if (!isTouch && !reducedMotion && window.innerWidth >= 1200) {
    import('./js/cursor.js').then((m) => m.initCursor());
  }
}

boot().catch(console.error);
