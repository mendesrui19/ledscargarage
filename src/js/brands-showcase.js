import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prepareVideo } from './video-scrub.js';
import { animateChars } from './text-effects.js';

gsap.registerPlugin(ScrollTrigger);

const FAST = { duration: 0.4, ease: 'power2.out' };

export function initBrandsShowcase(reducedMotion) {
  const section = document.querySelector('.brands-showcase');
  const video = section?.querySelector('.brands-showcase__video');
  const logos = section?.querySelectorAll('.brands-showcase__logo');
  const heading = section?.querySelector('.split-heading');
  const lead = section?.querySelector('.brands-showcase__lead');

  if (!section || !video) return;

  video.loop = true;
  video.muted = true;

  let active = false;

  const play = async () => {
    if (active) return;
    active = true;
    await prepareVideo(video);
    video.play().catch(() => {});
  };

  const stop = () => {
    active = false;
    video.pause();
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: play,
    onEnterBack: play,
    onLeave: stop,
    onLeaveBack: stop,
  });

  if (reducedMotion) {
    gsap.set(logos, { opacity: 1, scale: 1 });
    return;
  }

  gsap.set(logos, { opacity: 0, scale: 0.92 });

  ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      if (heading) animateChars(heading, { stagger: 0.012, duration: 0.4 });
      if (lead) gsap.fromTo(lead, { opacity: 0, y: 14 }, { opacity: 1, y: 0, ...FAST });
      gsap.fromTo(section.querySelector('.brands-showcase__frame'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' });
      gsap.to(logos, {
        opacity: 1, scale: 1, duration: 0.35,
        stagger: { amount: 0.45, from: 'random' },
        ease: 'power2.out', delay: 0.1,
      });
      const actionsEl = section.querySelector('.brands-showcase__actions');
      if (actionsEl) gsap.fromTo(actionsEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, ...FAST, delay: 0.35 });
    },
  });
}
