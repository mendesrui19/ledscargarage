import { gsap } from 'gsap';

let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;
let dotX = 0;
let dotY = 0;

export function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot = cursor?.querySelector('.cursor__dot');
  const ring = cursor?.querySelector('.cursor__ring');
  if (!cursor || !dot || !ring) return;

  document.body.classList.add('has-cursor');

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  gsap.ticker.add(() => {
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    gsap.set(dot, { x: dotX, y: dotY });
    gsap.set(ring, { x: ringX, y: ringY });
  });

  document.querySelectorAll('[data-cursor="cta"]').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-cta'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-cta'));
  });

  document.querySelectorAll('a, button, [data-tilt], .h-card, .stat-card').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}
