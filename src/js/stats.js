import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateChars } from './text-effects.js';

gsap.registerPlugin(ScrollTrigger);

export function initStats(reducedMotion) {
  const section = document.querySelector('.stats');
  if (!section) return;

  const cards = section.querySelectorAll('.stat-card');

  if (reducedMotion) {
    cards.forEach((card) => {
      const num = card.querySelector('[data-count]');
      if (num) num.textContent = num.dataset.count;
    });
    return;
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top 78%',
    once: true,
    onEnter: () => {
      cards.forEach((card, i) => {
        gsap.fromTo(card, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0,
          duration: 0.55, delay: i * 0.06, ease: 'power2.out',
        });

        const numEl = card.querySelector('[data-count]');
        const target = parseInt(numEl?.dataset.count || '0', 10);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.2,
          delay: i * 0.06 + 0.1,
          ease: 'power2.out',
          onUpdate: () => { if (numEl) numEl.textContent = Math.round(obj.val); },
        });
      });

      gsap.fromTo(section.querySelector('.stats__glow'), { scale: 0.6, opacity: 0 }, { scale: 1.5, opacity: 0.6, duration: 1, ease: 'power2.out' });
    },
  });
}

export function initReveals(reducedMotion) {
  if (reducedMotion) {
    gsap.set('.split-heading, .section-sub, .contact__info > *', { opacity: 1, y: 0 });
    return;
  }

  document.querySelectorAll('.contact .split-heading').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => animateChars(el, { stagger: 0.02 }),
    });
  });

  gsap.utils.toArray('.contact__info > *').forEach((el, i) => {
    gsap.fromTo(el, { opacity: 0, x: -24 }, {
      opacity: 1, x: 0,
      duration: 0.45, delay: i * 0.05, ease: 'power2.out',
      scrollTrigger: { trigger: '.contact', start: 'top 72%', once: true },
    });
  });

  gsap.fromTo('#contact-form', { opacity: 0, y: 30 }, {
    opacity: 1, y: 0,
    duration: 0.5, ease: 'power2.out',
    scrollTrigger: { trigger: '.contact', start: 'top 68%', once: true },
  });
}
