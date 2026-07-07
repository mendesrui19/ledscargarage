/**
 * Impede que cópias offline (HTTrack, file://) funcionem como site completo.
 * Não bloqueia 100% — um site público sempre pode ser copiado manualmente.
 */
const DEFAULT_HOSTS = [
  'localhost',
  '127.0.0.1',
  'ledscargarage.pt',
  'www.ledscargarage.pt',
  'ledscargarage.vercel.app',
];

function parseAllowedHosts() {
  const fromEnv = import.meta.env.VITE_ALLOWED_HOSTS;
  if (!fromEnv) return DEFAULT_HOSTS;
  return fromEnv.split(',').map((h) => h.trim()).filter(Boolean);
}

function isAllowedHost(hostname) {
  const allowed = parseAllowedHosts();
  if (allowed.includes(hostname)) return true;
  if (hostname.endsWith('.localhost')) return true;
  if (hostname.endsWith('.vercel.app')) return true;
  if (import.meta.env.DEV) return true;
  return false;
}

function blockClone(message) {
  const html = `<div style="min-height:100vh;display:grid;place-items:center;padding:2rem;font-family:system-ui,sans-serif;background:#0a0a0c;color:#f2f0ea;text-align:center"><div><h1 style="font-size:1.25rem;letter-spacing:.08em;text-transform:uppercase">Conteúdo protegido</h1><p style="max-width:28rem;line-height:1.6;color:#b8b4ac;margin:1rem auto 0">${message}</p><p style="margin-top:1rem;font-size:.85rem;color:#e8b84a">info@ledscargarage.pt</p></div></div>`;

  const stop = () => {
    document.documentElement.innerHTML = html;
    throw new Error('site-guard:blocked');
  };

  if (document.body) stop();
  else document.addEventListener('DOMContentLoaded', stop, { once: true });
  stop();
}

function initSiteGuard() {
  const { protocol, hostname } = window.location;

  if (protocol === 'file:') {
    blockClone('Cópia local/offline não autorizada. Visite o site oficial em produção.');
    return;
  }

  if (!isAllowedHost(hostname)) {
    blockClone('Este domínio não está autorizado a servir este conteúdo.');
  }
}

initSiteGuard();
