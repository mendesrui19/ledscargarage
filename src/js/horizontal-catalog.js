import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHorizontalCatalog(reducedMotion) {
  const section = document.querySelector('.h-catalog');
  const track = document.getElementById('catalog-track');
  const wrap = section?.querySelector('.h-catalog__track-wrap');
  const progress = document.getElementById('catalog-progress');
  if (!section || !track || !wrap) return;

  const cards = track.querySelectorAll('.h-card');

  if (reducedMotion || window.innerWidth < 768) {
    gsap.set(cards, { opacity: 1, scale: 1 });
    return;
  }

  const getScroll = () => Math.max(track.scrollWidth - wrap.offsetWidth + 120, 0);

  const scrollTween = gsap.to(track, {
    x: () => -getScroll(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${getScroll() + window.innerHeight * 0.8}`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      snap: {
        snapTo: (value) => {
          const cardCount = cards.length;
          const increment = 1 / (cardCount - 1);
          return Math.round(value / increment) * increment;
        },
        duration: { min: 0.08, max: 0.2 },
        ease: 'power2.inOut',
      },
      onUpdate: (self) => {
        if (progress) progress.style.width = `${self.progress * 100}%`;
        const active = Math.round(self.progress * (cards.length - 1));
        cards.forEach((c, i) => c.classList.toggle('is-active', i === active));
      },
    },
  });

  cards.forEach((card) => {
    gsap.fromTo(card.querySelector('.h-card__visual'), { scale: 1.1 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        containerAnimation: scrollTween,
        start: 'left 90%',
        end: 'left 40%',
        scrub: true,
      },
    });
  });

  gsap.fromTo(section.querySelector('.h-catalog__intro'), { opacity: 0, y: 30 }, {
    opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
    scrollTrigger: { trigger: section, start: 'top 88%', toggleActions: 'play none none reverse' },
  });
}
