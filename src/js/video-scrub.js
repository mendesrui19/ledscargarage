/** Scrub directo — sem lerp, frames sempre na ordem certa */
export function setVideoProgress(video, progress) {
  if (!video || !video.duration || Number.isNaN(video.duration)) return;
  video.pause();
  const t = Math.max(0, Math.min(1, progress)) * video.duration;
  if (Math.abs(video.currentTime - t) > 0.001) {
    video.currentTime = t;
  }
}

export function prepareVideo(video) {
  if (!video) return Promise.resolve();
  video.pause();
  video.currentTime = 0;
  video.muted = true;
  video.playsInline = true;

  if (video.readyState >= 2) return Promise.resolve();

  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener('loadeddata', done);
      video.removeEventListener('error', done);
      resolve();
    };
    video.addEventListener('loadeddata', done, { once: true });
    video.addEventListener('error', done, { once: true });
    video.load();
    setTimeout(done, 4000);
  });
}
