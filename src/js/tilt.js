import { gsap } from 'gsap';

export function initTilt(reducedMotion) {
  if (reducedMotion || window.innerWidth < 768) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const max = 12;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        rotateY: x * max,
        rotateX: -y * max,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    });
  });
}
