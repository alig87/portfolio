document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ===================== FOOTER YEAR ===================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===================== NAVBAR SCROLL STATE ===================== */
  const navbar = document.getElementById('navbar');
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ===================== MOBILE MENU ===================== */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeMobileMenu));

  /* ===================== SCROLL SPY ===================== */
  const sections  = document.querySelectorAll('main section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function setActive(id) {
    navLinks.forEach(l   => l.classList.toggle('active', l.dataset.section === id));
    mobileLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
  }

  const spyObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(s => spyObs.observe(s));

  /* ===================== SCROLL REVEAL ===================== */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), (i * 60) % 300);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  /* ===================== STAT COUNTERS ===================== */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const start  = performance.now();
    const dur    = 1100;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(el => countObs.observe(el));

  /* ===================== BUTTON RIPPLE ===================== */
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', e => {
      const rect   = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height);
      ripple.className  = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ===================== MAGNETIC BUTTONS ===================== */
  if (!prefersReducedMotion && isFinePointer) {
    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        btn.style.transform = `translate(${x * 0.1}px,${y * 0.18 - 3}px) scale(1.02)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ===================== SCROLL-LINKED ZOOM TEXT ===================== */
  if (!prefersReducedMotion) {
    const zoomEls = document.querySelectorAll('.scroll-zoom');
    let zt = false;
    function updateZoom() {
      const vc = window.innerHeight / 2;
      zoomEls.forEach(el => {
        const r  = el.getBoundingClientRect();
        const ec = r.top + r.height / 2;
        const d  = Math.abs(vc - ec);
        const mx = vc + r.height / 2;
        const p  = Math.min(d / mx, 1);
        el.style.transform = `scale(${1.06 - p * 0.14})`;
      });
      zt = false;
    }
    if (zoomEls.length) {
      updateZoom();
      window.addEventListener('scroll', () => { if (!zt) { requestAnimationFrame(updateZoom); zt = true; } }, { passive: true });
      window.addEventListener('resize', updateZoom);
    }
  }

  /* ===================== PROJECT CARD FLIP ===================== */
  document.querySelectorAll('.card-flip').forEach(card => {
    const toggle = () => card.classList.toggle('is-flipped');
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* ===================== PROJECT CARD 3D TILT ===================== */
  if (!prefersReducedMotion && isFinePointer) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -6;
        const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ===================== HERO PARALLAX ===================== */
  const heroDeco   = document.querySelector('.hero-deco');
  const heroVisual = document.querySelector('.hero-visual');
  const heroSec    = document.querySelector('.hero');

  if (!prefersReducedMotion && heroSec) {
    let lsy = -1, pt = false;
    function parallax() {
      const sy = window.scrollY;
      if (sy !== lsy && sy < window.innerHeight * 1.1) {
        lsy = sy;
        if (heroDeco)   heroDeco.style.transform   = `translateY(${sy * 0.18}px)`;
        if (heroVisual) heroVisual.style.transform  = `translateY(${sy * 0.08}px)`;
      }
      pt = false;
    }
    window.addEventListener('scroll', () => { if (!pt) { requestAnimationFrame(parallax); pt = true; } }, { passive: true });
  }

  /* ===================== HERO BLOB TILT ===================== */
  const blobTilt = document.getElementById('blob-tilt');
  if (blobTilt && !prefersReducedMotion && isFinePointer) {
    document.querySelector('.hero')?.addEventListener('mousemove', e => {
      const r  = blobTilt.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / r.width;
      const dy = (e.clientY - (r.top  + r.height / 2)) / r.height;
      blobTilt.style.transform = `rotate(${dx * 4}deg) translate(${dx * 6}px,${dy * 6}px)`;
    });
    document.querySelector('.hero')?.addEventListener('mouseleave', () => {
      blobTilt.style.transform = '';
    });
  }

  /* ===================== CONTACT FORM VALIDATION ===================== */
  const form       = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  const validators = {
    name:    v => v.trim().length >= 2  ? '' : 'Please enter your name.',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    subject: v => v.trim().length >= 3  ? '' : 'Please enter a subject.',
    message: v => v.trim().length >= 10 ? '' : 'Message should be at least 10 characters.',
  };

  function validateField(field) {
    const fn  = validators[field.name]; if (!fn) return true;
    const msg = fn(field.value);
    const grp = field.closest('.form-group');
    const err = document.getElementById(`${field.name}-error`);
    grp.classList.toggle('invalid', !!msg);
    if (err) err.textContent = msg;
    return !msg;
  }

  if (form) {
    Object.keys(validators).forEach(name => {
      const f = form.elements[name]; if (!f) return;
      f.addEventListener('blur', () => validateField(f));
      f.addEventListener('input', () => { if (f.closest('.form-group').classList.contains('invalid')) validateField(f); });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const valid = Object.keys(validators).every(name => {
        const f = form.elements[name]; return f ? validateField(f) : true;
      });
      if (!valid) { successMsg.classList.remove('show'); return; }
      successMsg.classList.add('show');
      form.reset();
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    });
  }

});
