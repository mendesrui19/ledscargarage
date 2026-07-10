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
  const { src, srcset } = slide.src ? slide : slideSources(slide.base);
  img.src = src;
  img.srcset = srcset;
  img.sizes = '100vw';
  img.alt = slide.alt;
}

function preloadShowcaseImages() {
  SLIDES.forEach((slide) => {
    if (slide.src) {
      [slide.src, slide.srcset?.split(',')[1]?.trim().split(' ')[0]].filter(Boolean).forEach((src) => {
        const preloader = new Image();
        preloader.src = src;
      });
    } else {
      ['.webp', '@2x.webp'].forEach((suffix) => {
        const preloader = new Image();
        preloader.src = `${slide.base}${suffix}`;
      });
    }
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
  const hint = section.querySelector('.vehicle-viewer__hint');
  const transitionVideo = section.querySelector('.vehicle-viewer__transition');

  if (!img || !tabs.length || !thumbsWrap) return;

  const thumbs = SLIDES.map((slide, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vehicle-viewer__thumb';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', slide.alt);
    btn.dataset.index = String(i);
    const thumb = slide.thumb || slideSources(slide.base).thumb;
    btn.innerHTML = `<img src="${thumb}" alt="" width="64" height="40" loading="lazy" decoding="async" />`;
    thumbsWrap.appendChild(btn);
    return btn;
  });

  const initialIndex = Math.max(firstSlideForTab('traseira'), 0);
  let index = initialIndex;
  let animating = false;
  let userInteracted = false;
  let demoPlayed = false;
  let demoTimer = 0;
  let bridgeTimer = 0;
  let bridgeFadeTimer = 0;
  let postBridgeTimerA = 0;
  let postBridgeTimerB = 0;
  const hasBridge = Boolean(transitionVideo && !reducedMotion);
  let bridgeDone = !hasBridge;
  const BRIDGE_TARGET_TIME = 6.0;
  const CONTROLS_REVEAL_TIME = 5.8;
  const BRIDGE_FADE_MS = 780;
  const BRIDGE_HOLD_MS = 130;
  const BRIDGE_ALIGN_SCALE = 1.11;
  const BRIDGE_ALIGN_X = 2.8;
  const BRIDGE_ALIGN_Y = 0.8;

  if (hasBridge) section.classList.add('has-bridge');


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

  const setImage = (nextIndex, { soft = false } = {}) => {
    const slide = SLIDES[nextIndex];
    if (!slide || animating || nextIndex === index) return;

    if (reducedMotion) {
      applySlideImage(img, slide);
      index = nextIndex;
      updateUI();
      return;
    }

    animating = true;
    const fadeOut = soft ? 0.34 : 0.18;
    const fadeIn = soft ? 0.56 : 0.28;
    const easeOut = soft ? 'power1.inOut' : 'power2.in';
    const easeIn = soft ? 'power1.out' : 'power2.out';

    gsap.to(img, {
      opacity: 0,
      scale: soft ? 1.012 : 1,
      duration: fadeOut,
      ease: easeOut,
      force3D: false,
      onComplete: () => {
        applySlideImage(img, slide);
        index = nextIndex;
        updateUI();
        gsap.fromTo(img, {
          opacity: 0,
          scale: soft ? 1.018 : 1,
        }, {
          opacity: 1,
          scale: 1,
          duration: fadeIn,
          ease: easeIn,
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

  const hideHint = () => {
    section.classList.add('is-engaged');
    if (hint) hint.setAttribute('aria-hidden', 'true');
  };

  const clearPostBridgeSequence = () => {
    clearTimeout(postBridgeTimerA);
    clearTimeout(postBridgeTimerB);
  };

  const markInteracted = () => {
    if (userInteracted) return;
    userInteracted = true;
    hideHint();
    clearTimeout(demoTimer);
    clearPostBridgeSequence();
  };

  const runDemo = () => {
    if (reducedMotion || demoPlayed || userInteracted || hasBridge) return;
    demoPlayed = true;
    section.classList.add('is-demo-running');
    const sequence = [2, 0, 1];
    let step = 0;

    const nextStep = () => {
      if (userInteracted || step >= sequence.length) {
        section.classList.remove('is-demo-running');
        return;
      }
      setImage(sequence[step]);
      step += 1;
      demoTimer = window.setTimeout(nextStep, 900);
    };

    demoTimer = window.setTimeout(nextStep, 420);
  };

  const io = new IntersectionObserver((entries) => {
    if (!entries[0]?.isIntersecting) return;
    io.disconnect();
    runDemo();
  }, { threshold: 0.6 });
  io.observe(section);

  const revealControls = () => {
    section.classList.add('is-controls-visible');
  };

  const finishBridge = () => {
    if (bridgeDone) return;
    bridgeDone = true;
    clearTimeout(bridgeTimer);
    clearTimeout(bridgeFadeTimer);
    clearPostBridgeSequence();
    section.classList.add('is-bridge-done');
    section.classList.remove('is-bridge-fading');
    section.classList.remove('has-bridge');
    gsap.set(img, { scale: 1, xPercent: 0, yPercent: 0, transformOrigin: '50% 50%' });
    revealControls();
    if (transitionVideo) {
      transitionVideo.pause();
      transitionVideo.currentTime = 0;
    }

    if (!userInteracted) {
      const firstInterior = Math.max(firstSlideForTab('interior'), 0);
      const firstExterior = Math.max(firstSlideForTab('frente'), 0);
      postBridgeTimerA = window.setTimeout(() => setImage(firstInterior, { soft: true }), 950);
      postBridgeTimerB = window.setTimeout(() => setImage(firstExterior, { soft: true }), 2500);
    }
  };

  if (hasBridge) {
    const beginFadeFromMatchedFrame = () => {
      if (bridgeDone || section.classList.contains('is-bridge-fading')) return;
      transitionVideo.pause();
      applySlideImage(img, SLIDES[initialIndex]);
      gsap.set(img, {
        scale: BRIDGE_ALIGN_SCALE,
        xPercent: BRIDGE_ALIGN_X,
        yPercent: BRIDGE_ALIGN_Y,
        transformOrigin: '50% 50%',
      });
      revealControls();
      bridgeFadeTimer = window.setTimeout(() => {
        section.classList.add('is-bridge-fading');
        gsap.to(img, {
          scale: 1,
          xPercent: 0,
          yPercent: 0,
          duration: (BRIDGE_FADE_MS + 220) / 1000,
          ease: 'power2.out',
          force3D: false,
        });
      }, BRIDGE_HOLD_MS);
      window.setTimeout(finishBridge, BRIDGE_HOLD_MS + BRIDGE_FADE_MS + 40);
    };

    transitionVideo.addEventListener('timeupdate', () => {
      if (bridgeDone) return;
      if (transitionVideo.currentTime >= CONTROLS_REVEAL_TIME) {
        revealControls();
      }
      if (transitionVideo.currentTime >= BRIDGE_TARGET_TIME) {
        beginFadeFromMatchedFrame();
      }
    });
    transitionVideo.addEventListener('ended', beginFadeFromMatchedFrame, { once: true });

    const bridgeObserver = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || bridgeDone) return;
      bridgeObserver.disconnect();
      transitionVideo.currentTime = 0;
      const playPromise = transitionVideo.play();
      if (playPromise?.catch) {
        playPromise.catch(() => finishBridge());
      }
      bridgeTimer = window.setTimeout(beginFadeFromMatchedFrame, 6800);
    }, { threshold: 0.62 });

    bridgeObserver.observe(section);
  }

  thumbs.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (!bridgeDone) return;
      markInteracted();
      setImage(i);
    });
  });

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!bridgeDone) return;
      markInteracted();
      const target = firstSlideForTab(btn.dataset.tab);
      if (target >= 0) setImage(target);
    });
  });

  navPrev?.addEventListener('click', () => {
    if (!bridgeDone) return;
    markInteracted();
    go(index - 1);
  });
  navNext?.addEventListener('click', () => {
    if (!bridgeDone) return;
    markInteracted();
    go(index + 1);
  });

  section.addEventListener('keydown', (e) => {
    if (!bridgeDone) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); markInteracted(); go(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); markInteracted(); go(index + 1); }
  });

  let touchX = 0;
  section.addEventListener('touchstart', (e) => {
    if (!bridgeDone) return;
    markInteracted();
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  section.addEventListener('touchend', (e) => {
    if (!bridgeDone) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) < 32) return;
    if (dx < 0) go(index + 1);
    else go(index - 1);
  }, { passive: true });

  preloadShowcaseImages();
  applySlideImage(img, SLIDES[index]);
  updateUI();
}
