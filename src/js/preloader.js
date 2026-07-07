/** Clip: seg 2–4 a ~2x + seg 5–15 normal → ~11,5s no ficheiro */
const INTRO_END = 1.53;  /* fim seg 2–4 (original, acelerados) */
const MIN_END = 3.55;    /* fim seg 7 (original) — mínimo obrigatório */
const MAX_TIME = 11.5;   /* fim do clip */
const MIN_LOOP_MS = 4000;

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
  });
}

function preloadVideo(src) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    const done = () => {
      video.removeEventListener('canplaythrough', done);
      video.removeEventListener('error', done);
      resolve();
    };
    video.addEventListener('canplaythrough', done, { once: true });
    video.addEventListener('error', done, { once: true });
    video.src = src;
    video.load();
    setTimeout(done, 12000);
  });
}

function collectPageAssets() {
  const urls = new Set(['/images/logo.jpg']);

  document.querySelectorAll('video[src]').forEach((el) => {
    if (el.classList.contains('preloader__video')) return;
    const src = el.getAttribute('src');
    if (src) urls.add(src);
    if (el.poster) urls.add(el.poster);
  });

  document.querySelectorAll('img[src]').forEach((el) => {
    const src = el.getAttribute('src');
    if (src && !src.startsWith('data:')) urls.add(src);
  });

  return [...urls];
}

async function loadSiteAssets(onProgress) {
  const urls = collectPageAssets();
  let done = 0;
  const total = urls.length + 2;
  const tick = () => {
    done += 1;
    onProgress(Math.min(99, Math.round((done / total) * 100)));
  };

  await Promise.all(urls.map(async (url) => {
    if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
      await preloadVideo(url);
    } else {
      await preloadImage(url);
    }
    tick();
  }));

  if (document.fonts?.ready) await document.fonts.ready;
  tick();

  if (document.readyState === 'complete') {
    tick();
  } else {
    await new Promise((resolve) => {
      window.addEventListener('load', resolve, { once: true });
    });
    tick();
  }

  onProgress(100);
}

function prepareLoaderVideo(video) {
  return new Promise((resolve) => {
    if (!video) {
      resolve();
      return;
    }
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0;

    const ready = () => {
      video.removeEventListener('canplaythrough', ready);
      video.removeEventListener('error', ready);
      resolve();
    };

    if (video.readyState >= 3) {
      resolve();
      return;
    }

    video.addEventListener('canplaythrough', ready, { once: true });
    video.addEventListener('error', ready, { once: true });
    video.load();
    setTimeout(ready, 10000);
  });
}

export function initPreloader(reducedMotion) {
  const preloader = document.getElementById('preloader');
  const counter = document.getElementById('preloader-count');
  const barFill = preloader?.querySelector('.preloader__progress-fill');
  const main = document.getElementById('main');
  const video = preloader?.querySelector('.preloader__video');

  if (!preloader) return Promise.resolve();

  document.body.classList.add('is-loading');

  if (reducedMotion) {
    preloader.remove();
    document.body.classList.remove('is-loading');
    return Promise.resolve();
  }

  const setPct = (n) => {
    const pct = Math.min(100, Math.max(0, Math.round(n)));
    if (counter) counter.textContent = String(pct);
    if (barFill) barFill.style.width = `${pct}%`;
  };

  return new Promise((resolve) => {
    let loadDone = false;
    let minLoopDone = false;
    let exiting = false;

    const doExit = () => {
      if (exiting) return;
      exiting = true;
      video?.pause();
      setPct(100);
      preloader.classList.add('is-exiting');
      preloader.setAttribute('aria-busy', 'false');
      if (main) main.classList.add('is-visible');

      setTimeout(() => {
        video?.removeEventListener('timeupdate', onTimeUpdate);
        preloader.remove();
        document.body.classList.remove('is-loading');
        resolve();
      }, 650);
    };

    const maybeExit = () => {
      if (!loadDone || exiting || !minLoopDone) return;
      doExit();
    };

    const onTimeUpdate = () => {
      if (!video || exiting) return;
      const t = video.currentTime;

      if (t >= MIN_END - 0.05) {
        minLoopDone = true;
      }

      if (t >= MAX_TIME - 0.05) {
        video.pause();
        video.currentTime = MAX_TIME;
        maybeExit();
        return;
      }

      if (loadDone && minLoopDone) {
        maybeExit();
      }
    };

    const startPlayback = () => {
      if (!video) {
        minLoopDone = true;
        return;
      }
      video.currentTime = 0;
      video.addEventListener('timeupdate', onTimeUpdate);
      video.play().catch(() => {
        minLoopDone = true;
        maybeExit();
      });
      setTimeout(() => {
        minLoopDone = true;
        maybeExit();
      }, MIN_LOOP_MS);
    };

    (async () => {
      setPct(0);
      await prepareLoaderVideo(video);
      setPct(8);
      startPlayback();
      await loadSiteAssets(setPct);
      loadDone = true;
      maybeExit();
    })().catch(() => {
      loadDone = true;
      minLoopDone = true;
      doExit();
    });
  });
}
