import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prepareVideo } from './video-scrub.js';
import { resetChars } from './text-effects.js';

gsap.registerPlugin(ScrollTrigger);

function resetPanelContent(panel) {
  resetChars(panel);
  gsap.killTweensOf(panel.querySelectorAll('.feature-pill, .cinema-panel__line, .eyebrow'));
  gsap.set(panel.querySelectorAll('.feature-pill, .cinema-panel__line, .eyebrow'), {
    opacity: 1, y: 0, clearProps: 'transform',
  });
}

function bindCinemaPanels(video, panels) {
  const states = panels.map(() => ({ shown: false, hidden: false }));
  let lastTime = 0;
  let activeIndex = -1;

  const hidePanel = (panel, i) => {
    states[i].hidden = true;
    states[i].shown = false;
    panel.classList.remove('is-active');
    gsap.set(panel, { opacity: 0, visibility: 'hidden' });
  };

  const showPanel = (panel, i) => {
    if (activeIndex === i && states[i].shown) return;

    panels.forEach((p, j) => {
      if (j !== i) hidePanel(p, j);
    });

    activeIndex = i;
    states[i].shown = true;
    states[i].hidden = false;
    panel.classList.add('is-active');
    resetPanelContent(panel);
    gsap.set(panel, { visibility: 'visible', opacity: 1, y: 0 });
  };

  const resetAll = () => {
    activeIndex = -1;
    states.forEach((s) => { s.shown = false; s.hidden = false; });
    panels.forEach((panel) => {
      panel.classList.remove('is-active');
      gsap.killTweensOf(panel);
      resetPanelContent(panel);
      gsap.set(panel, { opacity: 0, y: 0, visibility: 'hidden' });
    });
  };

  const tick = () => {
    const t = video.currentTime;
    if (t < lastTime - 0.35) resetAll();
    lastTime = t;

    panels.forEach((panel, i) => {
      const showAt = parseFloat(panel.dataset.show || '0');
      const hideAt = parseFloat(panel.dataset.hide || '999');

      if (!states[i].shown && t >= showAt) showPanel(panel, i);
      else if (states[i].shown && !states[i].hidden && t >= hideAt) hidePanel(panel, i);
    });
  };

  video.addEventListener('timeupdate', tick);

  return {
    reset: resetAll,
    showFirst: () => {
      resetAll();
      if (panels[0]) showPanel(panels[0], 0);
    },
    destroy: () => {
      video.removeEventListener('timeupdate', tick);
      resetAll();
    },
  };
}

function initWorkshopCinema(section) {
  const video = section.querySelector('.workshop-cinema__video');
  const panels = [...section.querySelectorAll('.cinema-panel')];
  const stage = section.querySelector('.workshop-cinema__stage') || section;
  if (!video) return null;

  video.loop = true;
  video.muted = true;

  let ctrl = null;
  let session = 0;
  let inView = false;

  const start = async () => {
    const mySession = ++session;
    ctrl?.destroy();
    ctrl = null;
    video.currentTime = 0;

    await prepareVideo(video);
    if (mySession !== session) return;

    ctrl = bindCinemaPanels(video, panels);
    ctrl.showFirst();
    video.play().catch(() => {});
  };

  const stop = () => {
    session++;
    video.pause();
    ctrl?.destroy();
    ctrl = null;
  };

  const setInView = (visible) => {
    if (visible === inView) return;
    inView = visible;
    if (visible) start();
    else stop();
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => setInView(true),
    onEnterBack: () => setInView(true),
    onLeave: () => setInView(false),
    onLeaveBack: () => setInView(false),
  });

  requestAnimationFrame(() => {
    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.bottom > 0 && rect.top < vh) setInView(true);
  });

  return { video, prime: start };
}

export async function initChapters(reducedMotion) {
  const workshop = document.querySelector('.chapter--workshop');

  document.querySelectorAll('.hero-story__video, .workshop-cinema__video, .signature-hub__video').forEach((v) => {
    v.pause();
    v.currentTime = 0;
    v.style.transform = 'none';
  });

  if (reducedMotion) {
    if (workshop) {
      const panels = [...workshop.querySelectorAll('.cinema-panel')];
      panels.forEach((p, i) => {
        gsap.set(p, { opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden' });
        if (i === 0) p.classList.add('is-active');
      });
    }
    return;
  }

  if (workshop) initWorkshopCinema(workshop);

  window.addEventListener('resize', () => ScrollTrigger.refresh());
}
