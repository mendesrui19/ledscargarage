export function initForm() {
  const form = document.querySelector('.contact__form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('.btn--primary span');
    const original = btn?.textContent;

    if (btn) {
      btn.textContent = 'Enviado ✓';
      form.reset();

      setTimeout(() => {
        btn.textContent = original;
      }, 3000);
    }
  });
}
