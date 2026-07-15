/* =========================================================
   CURSOR-REACTIVE BUBBLE BACKGROUND
   Lightweight canvas physics: bubbles float upward with gentle
   drift, and nearby bubbles get pushed away from the cursor
   with a soft, spring-like return to their natural path.
========================================================= */
(function () {
  const canvas = document.getElementById('bubble-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let bubbles = [];
  let mouse = { x: -9999, y: -9999, active: false };

  const GREEN = '22, 163, 74'; // rgb of #16A34A

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function bubbleCount() {
    const area = width * height;
    // density scales with viewport, capped for performance
    const count = Math.round(area / 28000);
    return Math.max(18, Math.min(count, 60));
  }

  function makeBubble() {
    const r = 6 + Math.random() * 22;
    return {
      x: Math.random() * width,
      y: height + Math.random() * height * 0.5,
      r: r,
      baseX: 0,
      vy: 0.25 + Math.random() * 0.55,         // upward drift speed
      driftPhase: Math.random() * Math.PI * 2,  // for gentle sideways sway
      driftSpeed: 0.2 + Math.random() * 0.3,
      driftAmp: 8 + Math.random() * 18,
      opacity: 0.06 + Math.random() * 0.16,
      // offset caused by cursor repulsion, eased back to 0
      offX: 0,
      offY: 0,
    };
  }

  function init() {
    resize();
    const n = bubbleCount();
    bubbles = Array.from({ length: n }, () => {
      const b = makeBubble();
      b.y = Math.random() * height; // spread initial bubbles across full height
      return b;
    });
  }

  function step(time) {
    ctx.clearRect(0, 0, width, height);

    for (const b of bubbles) {
      // natural upward float + gentle horizontal sway
      b.y -= b.vy;
      const sway = Math.sin(time * 0.001 * b.driftSpeed + b.driftPhase) * b.driftAmp * 0.01;
      b.x += sway;

      // cursor repulsion
      if (mouse.active) {
        const dx = b.x + b.offX - mouse.x;
        const dy = b.y + b.offY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 140;
        if (dist < radius && dist > 0.01) {
          const force = (1 - dist / radius) * 18;
          b.offX += (dx / dist) * force * 0.12;
          b.offY += (dy / dist) * force * 0.12;
        }
      }

      // spring back to natural position
      b.offX *= 0.92;
      b.offY *= 0.92;

      // recycle bubble once it floats above the top
      if (b.y + b.r < -20) {
        b.y = height + b.r + Math.random() * 60;
        b.x = Math.random() * width;
        b.offX = 0;
        b.offY = 0;
      }

      const drawX = b.x + b.offX;
      const drawY = b.y + b.offY;

      ctx.beginPath();
      ctx.arc(drawX, drawY, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GREEN}, ${b.opacity})`;
      ctx.fill();

      // subtle ring for premium glassy feel on larger bubbles
      if (b.r > 14) {
        ctx.beginPath();
        ctx.arc(drawX, drawY, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${GREEN}, ${b.opacity * 1.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    if (!prefersReducedMotion) {
      requestAnimationFrame(step);
    }
  }

  function onPointerMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function onPointerLeave() {
    mouse.active = false;
  }

  let resizeTimeout;
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const prevCount = bubbles.length;
      resize();
      const targetCount = bubbleCount();
      if (targetCount > prevCount) {
        for (let i = prevCount; i < targetCount; i++) bubbles.push(makeBubble());
      } else if (targetCount < prevCount) {
        bubbles = bubbles.slice(0, targetCount);
      }
    }, 150);
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('mouseleave', onPointerLeave);
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) onPointerMove(e.touches[0]);
  }, { passive: true });

  init();

  if (prefersReducedMotion) {
    // draw a single static, calm frame and stop — respects reduced motion
    step(0);
  } else {
    requestAnimationFrame(step);
  }
})();
