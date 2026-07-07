import './js/site-guard.js';
import './styles/main.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from './data/projects.js';
import { renderProjectArticle } from './data/render-project.js';
import { initPreloader } from './js/preloader.js';
import { initSmoothScroll } from './js/smooth-scroll.js';
import { initNavigation } from './js/navigation.js';
import { splitChars, animateChars } from './js/text-effects.js';
import { initMagnetic } from './js/magnetic.js';
import { initProjectShowcase } from './js/project-showcase.js';
import { initTilt } from './js/tilt.js';
import { initReveals } from './js/stats.js';
import { initForm } from './js/form.js';
import { isTouchDevice } from './js/device.js';

function mountProjects() {
  const container = document.getElementById('catalog-projects');
  if (!container) return;
  container.innerHTML = projects.map((p) => renderProjectArticle(p)).join('\n');
}

function scrollToHash(lenis) {
  const { hash } = window.location;
  if (!hash) return;

  const target = document.querySelector(hash);
  if (!target) return;

  const navOffset = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72) - 16;

  const scroll = () => {
    if (lenis) lenis.scrollTo(target, { offset: navOffset });
    else {
      const top = target.getBoundingClientRect().top + window.scrollY + navOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    setTimeout(scroll, 120);
  });
}

async function boot() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = isTouchDevice();

  window.scrollTo(0, 0);
  history.scrollRestoration = 'manual';

  mountProjects();
  splitChars(document);
  await initPreloader(reducedMotion);

  const lenis = initSmoothScroll(reducedMotion);
  if (lenis) lenis.scrollTo(0, { immediate: true });

  initNavigation(lenis);
  initMagnetic();
  initProjectShowcase(reducedMotion);
  initTilt(reducedMotion);
  initReveals(reducedMotion);
  initForm();

  const heroHeading = document.querySelector('.catalog-page-hero .split-heading');
  if (heroHeading && !reducedMotion) {
    animateChars(heroHeading, { stagger: 0.012, duration: 0.45 });
    gsap.fromTo('.catalog-page-hero .section-sub, .catalog-page-hero__meta', {
      opacity: 0, y: 12,
    }, {
      opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out', delay: 0.15,
    });
  }

  document.body.classList.add('is-ready');
  ScrollTrigger.refresh(true);

  let resizeTimer;
  const onLayoutChange = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(true), 200);
  };
  window.addEventListener('resize', onLayoutChange, { passive: true });
  window.addEventListener('orientationchange', onLayoutChange, { passive: true });

  if (window.location.hash) {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
      scrollToHash(lenis);
    });
  }

  if (!isTouch && !reducedMotion && window.innerWidth >= 1200) {
    import('./js/cursor.js').then((m) => m.initCursor());
  }
}

boot().catch(console.error);
