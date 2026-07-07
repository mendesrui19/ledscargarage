import { gsap } from 'gsap';

export function splitChars(root = document) {
  root.querySelectorAll('.char-wrap').forEach((wrap) => {
    if (wrap.querySelector('.char')) return;
    const text = wrap.textContent.trim();
    wrap.innerHTML = '';
    wrap.setAttribute('aria-label', text);
    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.setAttribute('aria-hidden', 'true');
      wrap.appendChild(span);
    });
  });

  root.querySelectorAll('.split-heading').forEach((heading) => {
    if (heading.dataset.split) return;
    heading.dataset.split = 'true';

    const decode = (html) => {
      const d = document.createElement('div');
      d.innerHTML = html;
      return d.textContent || '';
    };

    const parts = heading.innerHTML.includes('<br')
      ? heading.innerHTML.split(/<br\s*\/?>/i).map((partHtml) => ({
          text: decode(partHtml.replace(/<[^>]+>/g, '')).trim(),
          accent: partHtml.includes('section-title__accent'),
        }))
      : [{ text: heading.textContent.replace(/\s+/g, ' ').trim(), accent: false }];

    heading.innerHTML = '';
    parts.forEach((line, i) => {
      const row = document.createElement('span');
      row.className = `split-heading__row${line.accent ? ' split-heading__row--accent' : ''}`;
      const wrap = document.createElement('span');
      wrap.className = 'char-wrap';
      wrap.setAttribute('aria-label', line.text);
      [...line.text].forEach((char) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        wrap.appendChild(span);
      });
      row.appendChild(wrap);
      heading.appendChild(row);
    });
  });
}

export function resetChars(container) {
  const chars = container?.querySelectorAll?.('.char') || [];
  if (!chars.length) return;
  gsap.killTweensOf(chars);
  gsap.set(chars, { yPercent: 0, opacity: 1, clearProps: 'transform' });
}

export function animateChars(container, options = {}) {
  const chars = container.querySelectorAll('.char');
  if (!chars.length) return gsap.timeline();

  gsap.killTweensOf(chars);
  gsap.set(chars, { yPercent: 0, opacity: 1 });

  return gsap.fromTo(
    chars,
    { yPercent: 100, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: options.duration || 0.5,
      stagger: options.stagger || 0.02,
      delay: options.delay || 0,
      ease: options.ease || 'power3.out',
      overwrite: 'auto',
    },
  );
}
