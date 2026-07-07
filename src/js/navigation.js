export function initNavigation(lenis) {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const NAV_OFFSET = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72) - 16;

  let lockedScrollY = 0;

  const onScroll = (scrollY) => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', scrollY > 60);
  };

  if (lenis) {
    lenis.on('scroll', ({ scroll }) => onScroll(scroll));
    onScroll(lenis.scroll);
  } else {
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
    onScroll(window.scrollY);
  }

  const unlockBody = () => {
    const y = lockedScrollY;
    document.body.classList.remove('is-menu-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, y);
    if (lenis) {
      lenis.start();
      lenis.scrollTo(y, { immediate: true });
    }
  };

  const lockBody = () => {
    lockedScrollY = lenis ? lenis.scroll : window.scrollY;
    document.body.classList.add('is-menu-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  };

  const closeMenu = () => {
    if (!mobileMenu?.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    burger?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    unlockBody();
  };

  const openMenu = () => {
    mobileMenu?.classList.add('is-open');
    burger?.classList.add('is-open');
    burger?.setAttribute('aria-expanded', 'true');
    mobileMenu?.setAttribute('aria-hidden', 'false');
    lockBody();
  };

  burger?.addEventListener('click', () => {
    if (mobileMenu?.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  closeBtn?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  }, { passive: true });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) {
        lenis.scrollTo(target, { offset: NAV_OFFSET, duration: 1.2 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}
