import { gsap } from 'gsap';

const SLIDES = [
  { id: 'frente', tab: 'frente', base: '/images/showcase/frente', alt: 'Underglow LED roxo — BMW M4 vista frontal' },
  { id: 'traseira', tab: 'traseira', base: '/images/showcase/traseira', alt: 'Underglow LED roxo — BMW M4 vista traseira' },
  { id: 'interior-02', tab: 'interior', base: '/images/showcase/interior-02', alt: 'Kit ambiente LED roxo — BMW M4 tablier e zona dos pés' },
  { id: 'interior-01', tab: 'interior', base: '/images/showcase/interior-01', alt: 'Kit ambiente LED roxo — BMW M4 bancos iluminados' },
  { id: 'interior', tab: 'interior', base: '/images/showcase/interior', alt: 'Kit ambiente LED roxo — BMW M interior premium' },
];

function slideSources(base) {
  return {
    src: `${base}.webp`,
    srcset: `${base}.webp 1920w, ${base}@2x.webp 3840w`,
    thumb: `${base}.webp`,
  };
}

function applySlideImage(img, slide) {
  const { src, srcset } = slideSources(slide.base);
  img.src = src;
  img.srcset = srcset;
  img.sizes = '100vw';
  img.alt = slide.alt;
}

function preloadShowcaseImages() {
  SLIDES.forEach((slide) => {
    ['.webp', '@2x.webp'].forEach((suffix) => {
      const preloader = new Image();
      preloader.src = `${slide.base}${suffix}`;
    });
  });
}

function firstSlideForTab(tab) {
  return SLIDES.findIndex((s) => s.tab === tab);
}

export function initVehicleViewer(reducedMotion) {
  const section = document.querySelector('.vehicle-viewer');
  if (!section) return;

  const img = section.querySelector('.vehicle-viewer__img');
  const counter = section.querySelector('.view-strip__counter');
  const tabs = [...section.querySelectorAll('.view-strip__tab')];
  const thumbsWrap = section.querySelector('.vehicle-viewer__thumbs');
  const navPrev = section.querySelector('.vehicle-viewer__nav-btn--prev');
  const navNext = section.querySelector('.vehicle-viewer__nav-btn--next');

  if (!img || !tabs.length || !thumbsWrap) return;

  const thumbs = SLIDES.map((slide, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vehicle-viewer__thumb';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', slide.alt);
    btn.dataset.index = String(i);
    btn.innerHTML = `<img src="${slideSources(slide.base).thumb}" alt="" width="64" height="40" loading="lazy" decoding="async" />`;
    thumbsWrap.appendChild(btn);
    return btn;
  });

  let index = 0;
  let animating = false;

  const scrollThumbIntoView = (i) => {
    thumbs[i]?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
    });
  };

  const updateUI = () => {
    const slide = SLIDES[index];

    tabs.forEach((btn) => {
      const active = btn.dataset.tab === slide.tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    thumbs.forEach((btn, i) => btn.classList.toggle('is-active', i === index));

    if (counter) {
      counter.textContent = `${index + 1} / ${SLIDES.length}`;
    }

    img.classList.toggle('is-interior', slide.tab === 'interior');

    scrollThumbIntoView(index);
  };

  const setImage = (nextIndex) => {
    const slide = SLIDES[nextIndex];
    if (!slide || animating || nextIndex === index) return;

    if (reducedMotion) {
      applySlideImage(img, slide);
      index = nextIndex;
      updateUI();
      return;
    }

    animating = true;
    gsap.to(img, {
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
      force3D: false,
      onComplete: () => {
        applySlideImage(img, slide);
        index = nextIndex;
        updateUI();
        gsap.to(img, {
          opacity: 1,
          duration: 0.28,
          ease: 'power2.out',
          force3D: false,
          onComplete: () => { animating = false; },
        });
      },
    });
  };

  const go = (nextIndex) => {
    const len = SLIDES.length;
    setImage((nextIndex + len) % len);
  };

  thumbs.forEach((btn, i) => {
    btn.addEventListener('click', () => setImage(i));
  });

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = firstSlideForTab(btn.dataset.tab);
      if (target >= 0) setImage(target);
    });
  });

  navPrev?.addEventListener('click', () => go(index - 1));
  navNext?.addEventListener('click', () => go(index + 1));

  section.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
  });

  let touchX = 0;
  section.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  section.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) < 32) return;
    if (dx < 0) go(index + 1);
    else go(index - 1);
  }, { passive: true });

  preloadShowcaseImages();
  applySlideImage(img, SLIDES[0]);
  updateUI();
}
