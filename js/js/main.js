document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ===================== FOOTER YEAR ===================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===================== NAVBAR SCROLL STATE ===================== */
  const navbar = document.getElementById('navbar');
  function onScroll() {
    if (window.scrollY > 12) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ===================== MOBILE MENU ===================== */
  const hamburger = document.getElementById('hamburger');
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

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ===================== ACTIVE NAV LINK (SCROLL SPY) ===================== */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function setActive(id) {
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    mobileLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
  }

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spyObserver.observe(sec));

  /* ===================== SCROLL REVEAL ===================== */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // slight stagger for groups of cards revealing together
        setTimeout(() => entry.target.classList.add('in-view'), i * 40 % 200);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ===================== STAT COUNTERS ===================== */
  const statNums = document.querySelectorAll('.stat-num');
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => countObserver.observe(el));

  /* ===================== BUTTON RIPPLE EFFECT ===================== */
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ===================== MAGNETIC BUTTONS (subtle cursor pull) ===================== */
  if (!prefersReducedMotion && isFinePointer) {
    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.1}px, ${y * 0.2 - 3}px) scale(1.02)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ===================== SCROLL-LINKED ZOOM TEXT ===================== */
  if (!prefersReducedMotion) {
    const zoomEls = document.querySelectorAll('.scroll-zoom');
    let zoomTicking = false;

    function updateScrollZoom() {
      const viewportCenter = window.innerHeight / 2;
      zoomEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - elCenter);
        const maxDistance = viewportCenter + rect.height / 2;
        const progress = Math.min(distance / maxDistance, 1); // 0 = centered, 1 = at edge
        const scale = 1.06 - progress * 0.14;   // ~1.06 near center down to ~0.92 at the edges
        el.style.transform = `scale(${scale})`;
      });
      zoomTicking = false;
    }

    function onZoomScroll() {
      if (!zoomTicking) {
        requestAnimationFrame(updateScrollZoom);
        zoomTicking = true;
      }
    }

    if (zoomEls.length) {
      updateScrollZoom();
      window.addEventListener('scroll', onZoomScroll, { passive: true });
      window.addEventListener('resize', onZoomScroll);
    }
  }

  /* ===================== PROJECT CARD FLIP ===================== */
  document.querySelectorAll('.card-flip').forEach(card => {
    function toggleFlip() {
      card.classList.toggle('is-flipped');
    }
    card.addEventListener('click', toggleFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });
  });

  /* ===================== PROJECT CARD 3D TILT ===================== */
  if (!prefersReducedMotion && isFinePointer) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -6;
        const rotateY = ((x - cx) / cx) * 6;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ===================== HERO PARALLAX ON SCROLL ===================== */
  const heroDeco = document.querySelector('.hero-deco');
  const heroVisual = document.querySelector('.hero-visual');
  const heroSection = document.querySelector('.hero');

  if (!prefersReducedMotion && heroSection) {
    let lastScrollY = -1;
    function parallaxOnScroll() {
      const scrollY = window.scrollY;
      if (scrollY === lastScrollY || scrollY > window.innerHeight * 1.1) {
        requestAnimationFrame(parallaxOnScroll);
        return;
      }
      lastScrollY = scrollY;
      if (heroDeco) heroDeco.style.transform = `translateY(${scrollY * 0.18}px)`;
      if (heroVisual) heroVisual.style.transform = `translateY(${scrollY * 0.08}px)`;
      requestAnimationFrame(parallaxOnScroll);
    }
    requestAnimationFrame(parallaxOnScroll);
  }

  /* ===================== HERO BLOB — GENTLE CURSOR TILT ===================== */
  const blobTilt = document.getElementById('blob-tilt');
  if (blobTilt && !prefersReducedMotion && isFinePointer) {
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      const rect = blobTilt.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      blobTilt.style.transform = `rotate(${dx * 4}deg) translate(${dx * 6}px, ${dy * 6}px)`;
    });
    document.querySelector('.hero')?.addEventListener('mouseleave', () => {
      blobTilt.style.transform = '';
    });
  }

  /* ===================== CONTACT FORM VALIDATION ===================== */
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');

  const validators = {
    name: (v) => v.trim().length >= 2 ? '' : 'Please enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    subject: (v) => v.trim().length >= 3 ? '' : 'Please enter a subject.',
    message: (v) => v.trim().length >= 10 ? '' : 'Message should be at least 10 characters.',
  };

  function validateField(field) {
    const value = field.value;
    const errorFn = validators[field.name];
    if (!errorFn) return true;
    const message = errorFn(value);
    const group = field.closest('.form-group');
    const errorEl = document.getElementById(`${field.name}-error`);

    if (message) {
      group.classList.add('invalid');
      if (errorEl) errorEl.textContent = message;
      return false;
    } else {
      group.classList.remove('invalid');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  }

  if (form) {
    Object.keys(validators).forEach(name => {
      const field = form.elements[name];
      if (field) {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
          if (field.closest('.form-group').classList.contains('invalid')) {
            validateField(field);
          }
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      Object.keys(validators).forEach(name => {
        const field = form.elements[name];
        if (field && !validateField(field)) isValid = false;
      });

      if (!isValid) {
        successMsg.classList.remove('show');
        return;
      }

      // Simulate successful send (no backend wired up)
      successMsg.classList.add('show');
      form.reset();

      setTimeout(() => successMsg.classList.remove('show'), 5000);
    });
  }

});
