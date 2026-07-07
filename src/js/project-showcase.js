import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateChars } from './text-effects.js';

gsap.registerPlugin(ScrollTrigger);

function bindMobileGallery(wrap, photos, progress) {
  if (!wrap || photos.length <= 1) return () => {};

  const setActive = () => {
    const center = wrap.getBoundingClientRect().left + wrap.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    photos.forEach((photo, i) => {
      const rect = photo.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - center);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    photos.forEach((p, i) => p.classList.toggle('is-active', i === closest));
    if (progress) progress.style.width = `${(closest / Math.max(photos.length - 1, 1)) * 100}%`;
  };

  wrap.addEventListener('scroll', setActive, { passive: true });
  wrap.addEventListener('scrollend', setActive, { passive: true });
  setActive();

  return () => {
    wrap.removeEventListener('scroll', setActive);
    wrap.removeEventListener('scrollend', setActive);
  };
}

function bindReveal(section, heading, reducedMotion) {
  if (reducedMotion) return () => {};

  const st = ScrollTrigger.create({
    trigger: section,
    start: 'top 88%',
    once: true,
    onEnter: () => {
      if (heading) animateChars(heading, { stagger: 0.015, duration: 0.45 });
      gsap.fromTo(section.querySelectorAll('.project-showcase__list li, .project-showcase__thanks, .project-showcase__actions > *'), {
        opacity: 0, y: 14,
      }, {
        opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out', delay: 0.1,
      });
    },
  });

  return () => st.kill();
}

function getNavOffset() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
}

function initProject(section, reducedMotion) {
  const layout = section.querySelector('.project-showcase__layout');
  const track = section.querySelector('.project-showcase__track');
  const wrap = section.querySelector('.project-showcase__gallery-wrap');
  const progress = section.querySelector('.project-showcase__progress-fill');
  const heading = section.querySelector('.split-heading');
  if (!layout || !track || !wrap) return;

  const photos = [...track.querySelectorAll('.project-photo')];

  if (reducedMotion) {
    gsap.set(photos, { opacity: 1, scale: 1, x: 0 });
    gsap.set(track, { x: 0 });
    bindMobileGallery(wrap, photos, progress);
    return;
  }

  ScrollTrigger.matchMedia({
  '(max-width: 767px)': () => {
    gsap.set(photos, { opacity: 1, scale: 1, x: 0 });
    gsap.set(track, { x: 0, clearProps: 'transform' });

    const unbindGallery = bindMobileGallery(wrap, photos, progress);
    const unbindReveal = bindReveal(section, heading, false);

    return () => {
      unbindGallery();
      unbindReveal();
    };
  },

  '(min-width: 768px)': () => {
    const getScroll = () => Math.max(track.scrollWidth - wrap.offsetWidth + 80, 0);
    const scrollLen = () => getScroll() + window.innerHeight * 0.28;

    const setPinLayout = (active) => {
      section.classList.toggle('is-pin-active', active);
      if (active) {
        layout.style.minHeight = `${window.innerHeight - getNavOffset()}px`;
      } else {
        layout.style.removeProperty('min-height');
      }
    };

    const onResize = () => {
      if (section.classList.contains('is-pin-active')) {
        layout.style.minHeight = `${window.innerHeight - getNavOffset()}px`;
      }
    };
    window.addEventListener('resize', onResize, { passive: true });

    const tween = gsap.to(track, {
      x: () => -getScroll(),
      ease: 'none',
      scrollTrigger: {
        trigger: layout,
        start: () => `top top+=${getNavOffset()}`,
        end: () => `+=${scrollLen()}`,
        pin: layout,
        pinSpacing: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onEnter: () => setPinLayout(true),
        onLeave: () => setPinLayout(false),
        onEnterBack: () => setPinLayout(true),
        onLeaveBack: () => setPinLayout(false),
        onUpdate: (self) => {
          if (progress) progress.style.width = `${self.progress * 100}%`;
          const active = Math.round(self.progress * Math.max(photos.length - 1, 0));
          photos.forEach((p, i) => p.classList.toggle('is-active', i === active));
        },
      },
    });

    const unbindReveal = bindReveal(section, heading, false);

    return () => {
      window.removeEventListener('resize', onResize);
      tween.scrollTrigger?.kill();
      tween.kill();
      setPinLayout(false);
      gsap.set(track, { x: 0, clearProps: 'transform' });
      unbindReveal();
    };
  },
  });
}

export function initProjectShowcase(reducedMotion) {
  const hub = document.querySelector('.projects-hub__header');
  if (hub && !reducedMotion) {
    const hubHeading = hub.querySelector('.split-heading');
    ScrollTrigger.create({
      trigger: hub,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        if (hubHeading) animateChars(hubHeading, { stagger: 0.012, duration: 0.4 });
        gsap.fromTo(hub.querySelector('.eyebrow'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      },
    });
  }

  document.querySelectorAll('.project-showcase').forEach((section) => {
    initProject(section, reducedMotion);
  });
}
