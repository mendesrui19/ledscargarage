import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prepareVideo } from './video-scrub.js';

gsap.registerPlugin(ScrollTrigger);

export function initSignatureHub(reducedMotion) {
  const section = document.querySelector('.signature-hub');
  if (!section) return;

  const videos = [...section.querySelectorAll('.signature-hub__video')];

  ScrollTrigger.create({
    trigger: section,
    start: 'top 90%',
    once: true,
    onEnter: async () => {
      await Promise.all(videos.map((v) => prepareVideo(v)));
      videos.forEach((v) => v.play().catch(() => {}));
    },
  });

  if (reducedMotion) return;

  gsap.fromTo(
    section.querySelectorAll('.signature-hub__frame'),
    { opacity: 0, y: 16 },
    {
      opacity: 1, y: 0, stagger: 0.08, duration: 0.45, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 82%', once: true },
    },
  );
}
