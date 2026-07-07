export function initParticles() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, mx = 0, my = 0;
  let rafId = 0;
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 0 : (window.innerWidth < 1200 ? 36 : 52);
  const connectDist = 120;
  const particles = [];

  if (count === 0) {
    canvas.style.display = 'none';
    return;
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.5 + 0.12;
      this.hue = Math.random() > 0.45 ? 250 : 65;
    }
    update() {
      const dx = mx - this.x;
      const dy = my - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        this.vx -= dx * 0.00006;
        this.vy -= dy * 0.00006;
      }
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.99;
      this.vy *= 0.99;
      if (this.x < -20 || this.x > w + 20 || this.y < -20 || this.y > h + 20) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.hue === 250
        ? `rgba(80, 140, 255, ${this.opacity})`
        : `rgba(210, 170, 90, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) particles.push(new Particle());

  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  let running = document.visibilityState === 'visible';
  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) loop();
  });

  const drawConnections = window.innerWidth >= 1200;

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => { p.update(); p.draw(); });

    if (!drawConnections) return;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy;
        if (dist < connectDist * connectDist) {
          const alpha = (1 - Math.sqrt(dist) / connectDist) * 0.1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(180, 160, 120, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  loop();

  return () => cancelAnimationFrame(rafId);
}
