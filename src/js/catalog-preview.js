import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PX_PER_SEC = 72;

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
      bindReveal();
      return cleanup;
    },

    '(min-width: 768px)': () => {
      const cleanup = setupMarquee(viewport, track, originals);
      bindReveal();
      return cleanup;
    },
  });
}
