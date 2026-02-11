/**
 * Portfolio Interactivity
 * – Particle starfield canvas
 * – Typing effect
 * – Scroll reveal (IntersectionObserver)
 * – Navbar scroll state + active section
 * – Mobile nav toggle
 * – Stat counter animation
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════
  // 1. PARTICLE STARFIELD
  // ═══════════════════════════════════════════════
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  /** @type {{ x: number; y: number; r: number; vx: number; vy: number; alpha: number }[]} */
  let particles = [];
  let animFrame;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initParticles() {
    const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 8000), 180);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.6 + 0.2,
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 200, 255, ${p.alpha})`;
      ctx.fill();
    }
    animFrame = requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  initParticles();
  drawParticles();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      initParticles();
    }, 200);
  });

  // ═══════════════════════════════════════════════
  // 2. TYPING EFFECT
  // ═══════════════════════════════════════════════
  const phrases = [
    'Full-Stack Developer',
    'EdTech Builder',
    'Real-time Systems',
    'Vue.js + NestJS',
    'Backend Architect',
  ];
  const typedEl = document.getElementById('typed-text');
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    const current = phrases[phraseIdx];
    if (!isDeleting) {
      typedEl.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        isDeleting = true;
        setTimeout(type, 2000); // Pause at full phrase
        return;
      }
      setTimeout(type, 70 + Math.random() * 40);
    } else {
      typedEl.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, 35);
    }
  }

  // Start typing after hero animation settles
  setTimeout(type, 1200);

  // ═══════════════════════════════════════════════
  // 3. SCROLL REVEAL (IntersectionObserver)
  // ═══════════════════════════════════════════════
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // Animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ═══════════════════════════════════════════════
  // 4. NAVBAR — scroll state + active link
  // ═══════════════════════════════════════════════
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section, .hero');

  function onScroll() {
    // Scrolled state
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active section
    let currentId = '';
    for (const section of sections) {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        currentId = section.getAttribute('id');
      }
    }
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ═══════════════════════════════════════════════
  // 5. MOBILE NAV TOGGLE
  // ═══════════════════════════════════════════════
  const navToggle = document.getElementById('nav-toggle');
  const navLinksContainer = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinksContainer.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinksContainer.classList.remove('open');
    });
  });

  // ═══════════════════════════════════════════════
  // 6. STAT COUNTER ANIMATION
  // ═══════════════════════════════════════════════
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          animateCounter(el, target);
          statObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.stat-value[data-count]').forEach((el) => statObserver.observe(el));

  /**
   * Animate a number from 0 to target over ~1.2s using easeOutExpo.
   * @param {HTMLElement} el
   * @param {number} target
   */
  function animateCounter(el, target) {
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ═══════════════════════════════════════════════
  // 7. SMOOTH SCROLL (polyfill for older browsers)
  // ═══════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
