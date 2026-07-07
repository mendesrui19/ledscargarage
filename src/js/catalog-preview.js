import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PX_PER_SEC = 72;

function setupAutoSwipeLoop(viewport, reducedMotion) {
  if (!viewport || reducedMotion) return () => {};

  let rafId = 0;
  let lastTs = 0;
  let resumeTimer = 0;
  let paused = false;
  let interacting = false;

  const speedPxPerSec = 28;

  const pauseTemporarily = (ms = 1800) => {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      if (!interacting) paused = false;
    }, ms);
  };

  const tick = (ts) => {
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    if (!paused && !interacting) {
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      if (maxScroll > 0) {
        const next = viewport.scrollLeft + speedPxPerSec * dt;
        viewport.scrollLeft = next >= maxScroll - 1 ? 0 : next;
      }
    }

    rafId = requestAnimationFrame(tick);
  };

  const onPointerDown = () => {
    interacting = true;
    paused = true;
    clearTimeout(resumeTimer);
  };

  const onPointerUp = () => {
    interacting = false;
    pauseTemporarily(1400);
  };

  const onWheel = () => pauseTemporarily(1200);
  const onScroll = () => pauseTemporarily(900);
  const onVisibility = () => {
    paused = document.hidden || interacting;
  };

  viewport.addEventListener('pointerdown', onPointerDown, { passive: true });
  viewport.addEventListener('pointerup', onPointerUp, { passive: true });
  viewport.addEventListener('pointercancel', onPointerUp, { passive: true });
  viewport.addEventListener('touchstart', onPointerDown, { passive: true });
  viewport.addEventListener('touchend', onPointerUp, { passive: true });
  viewport.addEventListener('wheel', onWheel, { passive: true });
  viewport.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility, { passive: true });

  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    clearTimeout(resumeTimer);
    viewport.removeEventListener('pointerdown', onPointerDown);
    viewport.removeEventListener('pointerup', onPointerUp);
    viewport.removeEventListener('pointercancel', onPointerUp);
    viewport.removeEventListener('touchstart', onPointerDown);
    viewport.removeEventListener('touchend', onPointerUp);
    viewport.removeEventListener('wheel', onWheel);
    viewport.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}

function setupSwipe(viewport, track) {
  viewport.classList.add('catalog-preview__viewport--swipe');
  track.classList.remove('is-animated');
  track.style.removeProperty('--catalog-marquee-dur');

  return () => {
    viewport.classList.remove('catalog-preview__viewport--swipe');
  };
}

function setupMarquee(viewport, track, originals) {
  viewport.classList.remove('catalog-preview__viewport--swipe');

  track.querySelectorAll('.catalog-card[aria-hidden="true"]').forEach((clone) => clone.remove());

  if (track.querySelectorAll('.catalog-card').length === originals.length) {
    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('tabindex', '-1');
      track.appendChild(clone);
    });
  }

  const setDuration = () => {
    const half = track.scrollWidth / 2;
    const seconds = Math.max(24, half / PX_PER_SEC);
    track.style.setProperty('--catalog-marquee-dur', `${seconds}s`);
  };

  track.classList.add('is-animated');
  requestAnimationFrame(setDuration);

  const onResize = () => requestAnimationFrame(setDuration);
  window.addEventListener('resize', onResize);
  Promise.all(
    [...track.querySelectorAll('img')].map((img) => (
      img.complete ? Promise.resolve() : new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      })
    )),
  ).then(setDuration);

  return () => {
    window.removeEventListener('resize', onResize);
    track.classList.remove('is-animated');
    track.style.removeProperty('--catalog-marquee-dur');
    track.querySelectorAll('.catalog-card[aria-hidden="true"]').forEach((clone) => clone.remove());
  };
}

export function initCatalogPreview(reducedMotion) {
  const section = document.querySelector('.catalog-preview');
  const viewport = section?.querySelector('.catalog-preview__viewport');
  const track = section?.querySelector('.catalog-preview__track');
  if (!section || !viewport || !track) return;

  const originals = [...track.querySelectorAll('.catalog-card')];
  if (!originals.length) return;

  let revealSt = null;

  const bindReveal = () => {
    if (reducedMotion || revealSt) return;
    revealSt = gsap.fromTo(section, { opacity: 0, y: 16 }, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 88%', once: true },
    });
  };

  if (reducedMotion) {
    setupSwipe(viewport, track);
    return;
  }

  ScrollTrigger.matchMedia({
    '(max-width: 767px)': () => {
      const cleanup = setupSwipe(viewport, track);
      const cleanupAutoLoop = setupAutoSwipeLoop(viewport, reducedMotion);
      bindReveal();
      return () => {
        cleanupAutoLoop();
        cleanup();
      };
    },

    '(min-width: 768px)': () => {
      const cleanup = setupMarquee(viewport, track, originals);
      bindReveal();
      return cleanup;
    },
  });
}
