import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setVideoProgress, prepareVideo } from './video-scrub.js';

gsap.registerPlugin(ScrollTrigger);

function runCountUp(cards, selector = '[data-count]') {
  cards.forEach((card, i) => {
    const numEl = card.querySelector(selector);
    const target = parseInt(numEl?.dataset.count || '0', 10);
    if (!numEl) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.1,
      delay: i * 0.08,
      ease: 'power2.out',
      onUpdate: () => { numEl.textContent = String(Math.round(obj.val)); },
    });
  });
}

function setupBrandMarquees(hero) {
  hero.querySelectorAll('.hero-cine__marquee-track').forEach((track) => {
    const logos = [...track.querySelectorAll('.hero-cine__brand')];
    logos.forEach((logo) => track.appendChild(logo.cloneNode(true)));
    const half = track.scrollWidth / 2;
    const seconds = Math.max(22, half / 55);
    track.style.setProperty('--marquee-dur', `${seconds}s`);
  });
}

function runIntroEntrance(nav, intro, introStats, scrollInd, introCountedRef) {
  const introTl = gsap.timeline({ delay: 0.15 });
  introTl.to(nav, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' });
  introTl.to(intro, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2');
  introTl.to(introStats, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out' }, '-=0.25');
  introTl.add(() => {
    if (!introCountedRef.counted) {
      introCountedRef.counted = true;
      runCountUp(introStats);
    }
  }, '-=0.2');
  if (scrollInd) introTl.to(scrollInd, { opacity: 1, duration: 0.35 }, '-=0.1');
  return introTl;
}

export async function initHeroCinematic(reducedMotion) {
  const hero = document.querySelector('.hero-cine');
  const pin = hero?.querySelector('.hero-cine__pin');
  const video = hero?.querySelector('.hero-cine__video');
  const scrollInd = document.getElementById('scroll-indicator');
  const nav = document.getElementById('nav');

  if (!hero || !pin) return;

  const intro = hero.querySelector('[data-stage="intro"]');
  const services = hero.querySelector('[data-stage="services"]');
  const brands = hero.querySelector('[data-stage="brands"]');
  const brandsShow = brands?.querySelector('.hero-cine__brands-show');

  const serviceItems = [...(services?.querySelectorAll('.hero-cine__service') || [])];
  const introStats = [...(intro?.querySelectorAll('.hero-cine__intro-stat') || [])];
  const marqueeTracks = [...(brands?.querySelectorAll('.hero-cine__marquee-track') || [])];

  setupBrandMarquees(hero);

  if (video) {
    await prepareVideo(video);
  }

  if (reducedMotion) {
    if (video) {
      video.loop = true;
      video.muted = true;
      video.play().catch(() => {});
    }
    gsap.set([nav, intro, services, brands], { opacity: 1, y: 0 });
    gsap.set([...serviceItems, ...introStats], { opacity: 1, x: 0, y: 0 });
    if (brandsShow) gsap.set(brandsShow, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' });
    introStats.forEach((card) => {
      const num = card.querySelector('[data-count]');
      if (num) num.textContent = num.dataset.count;
    });
    if (scrollInd) gsap.set(scrollInd, { opacity: 0 });
    return;
  }

  const introCountedRef = { counted: false };

  const setScrollHint = (visible) => {
    if (!scrollInd) return;
    scrollInd.classList.toggle('is-hidden', !visible);
    gsap.set(scrollInd, {
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
    });
  };

  ScrollTrigger.matchMedia({
    '(max-width: 768px)': () => {
      hero.classList.add('hero-cine--mobile');

      gsap.set(nav, { y: -16, opacity: 0 });
      gsap.set(scrollInd, { opacity: 0 });
      gsap.set(intro, { opacity: 0, y: 24 });
      gsap.set(introStats, { opacity: 0, y: 12 });
      gsap.set(services, { opacity: 0, y: 30 });
      gsap.set(brands, { opacity: 0, y: 30 });
      gsap.set(serviceItems, { opacity: 0 });
      if (brandsShow) gsap.set(brandsShow, { opacity: 0 });
      marqueeTracks.forEach((t) => t.classList.remove('is-animated'));

      if (video) {
        video.loop = true;
        video.muted = true;
        video.play().catch(() => {});
      }

      runIntroEntrance(nav, intro, introStats, scrollInd, introCountedRef);

      if (scrollInd) {
        scrollInd.classList.add('is-hidden');
        gsap.set(scrollInd, { opacity: 0, visibility: 'hidden' });
        gsap.to(scrollInd, { opacity: 0, delay: 2.8, duration: 0.45, ease: 'power2.in' });
      }

      const triggers = [];

      const servicesSt = ScrollTrigger.create({
        trigger: services,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(services, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
          gsap.to(serviceItems, { opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' });
        },
        once: true
      });
      triggers.push(servicesSt);

      const brandsSt = ScrollTrigger.create({
        trigger: brands,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(brands, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
          if (brandsShow) gsap.to(brandsShow, { opacity: 1, duration: 0.6, ease: 'power2.out' });
          marqueeTracks.forEach((t) => t.classList.add('is-animated'));
        },
        once: true
      });
      triggers.push(brandsSt);

      return () => {
        hero.classList.remove('hero-cine--mobile');
        setScrollHint(false);
        triggers.forEach((t) => t.kill());
        gsap.set([services, brands, serviceItems], { clearProps: 'all' });
      };
    },

    '(min-width: 769px)': () => {
      hero.classList.remove('hero-cine--mobile');

      gsap.set(nav, { y: -16, opacity: 0 });
      gsap.set(scrollInd, { opacity: 0 });
      gsap.set(intro, { opacity: 0, y: 24 });
      gsap.set(services, { opacity: 0, visibility: 'visible' });
      gsap.set(brands, { opacity: 0, visibility: 'visible' });
      gsap.set(serviceItems, { opacity: 0, x: -40 });
      gsap.set(introStats, { opacity: 0, y: 12 });
      if (brandsShow) gsap.set(brandsShow, { opacity: 0, y: 28, scale: 0.96, filter: 'blur(8px)' });
      marqueeTracks.forEach((t) => t.classList.remove('is-animated'));

      introCountedRef.counted = false;
      runIntroEntrance(nav, intro, introStats, scrollInd, introCountedRef);

      const revealed = new WeakSet();
      let brandsAnimated = false;

      const revealItem = (el, fromX, delay = 0) => {
        if (revealed.has(el)) return;
        revealed.add(el);
        gsap.to(el, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', delay });
      };
      const hideItem = (el, fromX) => {
        if (!revealed.has(el)) return;
        revealed.delete(el);
        gsap.to(el, { opacity: 0, x: fromX, duration: 0.3, ease: 'power2.in' });
      };

      let navHidden = null;
      const setNavHidden = (hide) => {
        if (!nav || navHidden === hide) return;
        navHidden = hide;
        nav.classList.toggle('is-hero-hidden', hide);
        gsap.to(nav, {
          y: hide ? -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72) : 0,
          opacity: hide ? 0 : 1,
          duration: 0.38,
          ease: hide ? 'power2.in' : 'power2.out',
          overwrite: true,
        });
      };

      const st = ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: '+=360%',
        pin,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onToggle: (self) => {
          hero.classList.toggle('is-hero-active', self.isActive);
          if (!self.isActive) setScrollHint(false);
        },
        onLeave: () => {
          setNavHidden(false);
          setScrollHint(false);
          hero.classList.remove('is-hero-active');
        },
        onLeaveBack: () => {
          setNavHidden(false);
          setScrollHint(true);
        },
        onUpdate(self) {
          const p = self.progress;
          const hideNav = self.isActive && p > 0.05;
          setNavHidden(hideNav);

          if (video) setVideoProgress(video, p);

          const introOut = gsap.utils.clamp(0, 1, (p - 0.07) / 0.09);
          gsap.set(intro, { opacity: 1 - introOut, y: -introOut * 40 });

          if (p >= 0.14 && p < 0.44) {
            gsap.set(services, { opacity: 1 });
            const inner = (p - 0.16) / 0.24;
            serviceItems.forEach((el, i) => {
              const thresh = i / serviceItems.length;
              if (inner >= thresh) revealItem(el, -40);
              else hideItem(el, -40);
            });
          } else if (p < 0.14) {
            gsap.set(services, { opacity: 0 });
            serviceItems.forEach((el) => hideItem(el, -40));
          } else {
            const fade = gsap.utils.clamp(0, 1, (p - 0.42) / 0.05);
            gsap.set(services, { opacity: 1 - fade });
          }

          if (p >= 0.48) {
            gsap.set(brands, { opacity: 1 });
            const inner = gsap.utils.clamp(0, 1, (p - 0.5) / 0.12);
            if (brandsShow) {
              gsap.set(brandsShow, {
                opacity: inner,
                y: 28 * (1 - inner),
                scale: 0.96 + inner * 0.04,
                filter: `blur(${8 * (1 - inner)}px)`,
              });
            }
            if (inner > 0.6 && !brandsAnimated) {
              brandsAnimated = true;
              marqueeTracks.forEach((t) => t.classList.add('is-animated'));
            }
          } else {
            gsap.set(brands, { opacity: 0 });
            if (brandsShow) gsap.set(brandsShow, { opacity: 0, y: 28, scale: 0.96, filter: 'blur(8px)' });
            if (p < 0.42) {
              brandsAnimated = false;
              marqueeTracks.forEach((t) => t.classList.remove('is-animated'));
            }
          }

          if (scrollInd) {
            const show = p <= 0.12;
            setScrollHint(show);
            if (show) gsap.set(scrollInd, { opacity: 1 - introOut });
          }
        },
      });

      return () => {
        st.kill();
        setNavHidden(false);
        setScrollHint(false);
        hero.classList.remove('is-hero-active');
        gsap.set(nav, { clearProps: 'transform,opacity' });
      };
    },
  });
}
