/* FireflyOS · 交互
   深浅色切换、导航、入场动画与萤火粒子 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 深浅色 ---------------- */
  var themeBtn = document.getElementById('themeToggle');
  var themeMeta = document.getElementById('themeColor');

  function syncThemeUI() {
    var light = root.getAttribute('data-color-mode') === 'light';
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', light ? 'true' : 'false');
      themeBtn.setAttribute('aria-label', light ? '切换到深色模式' : '切换到浅色模式');
    }
    if (themeMeta) themeMeta.setAttribute('content', light ? '#f3faf6' : '#060a10');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-color-mode') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-color-mode', next);
      try { localStorage.setItem('ff-theme', next); } catch (e) {}
      syncThemeUI();
    });
  }

  function applyStoredTheme() {
    var saved = null;
    try { saved = localStorage.getItem('ff-theme'); } catch (e) {}
    if (saved === 'light' || saved === 'dark') {
      root.setAttribute('data-color-mode', saved);
    }
    syncThemeUI();
  }

  applyStoredTheme();
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) applyStoredTheme();
  });

  /* ---------------- 顶部导航 ---------------- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');

  function closeMenu() {
    if (!navLinks || !menuBtn) return;
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', '打开菜单');
  }

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------------- 入场动画 ---------------- */
  var revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- 年份 ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- 萤火粒子 ---------------- */
  var canvas = document.getElementById('fireflies');
  if (!canvas || reduceMotion) return;

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width = 0;
  var height = 0;
  var particles = [];
  var rafId = 0;

  function makeParticle(initial) {
    var amber = Math.random() < 0.28;
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 12,
      r: 0.7 + Math.random() * 1.7,
      vy: 0.1 + Math.random() * 0.28,
      sway: 0.25 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.012,
      alpha: 0.25 + Math.random() * 0.55,
      color: amber ? '251, 191, 36' : '110, 231, 183'
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = width < 640 ? 12 : Math.min(28, Math.round(width / 52));
    particles = [];
    for (var i = 0; i < count; i++) particles.push(makeParticle(true));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y -= p.vy;
      p.phase += p.speed;
      var x = p.x + Math.sin(p.phase) * p.sway * 14;
      var twinkle = 0.55 + Math.sin(p.phase * 1.7) * 0.45;
      var alpha = p.alpha * twinkle;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + p.color + ',' + alpha.toFixed(3) + ')';
      ctx.shadowColor = 'rgba(' + p.color + ',' + (alpha * 0.9).toFixed(3) + ')';
      ctx.shadowBlur = 10 + p.r * 4;
      ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      if (p.y < -20) particles[i] = makeParticle(false);
    }
    ctx.shadowBlur = 0;
    rafId = window.requestAnimationFrame(draw);
  }

  function start() {
    if (!rafId) rafId = window.requestAnimationFrame(draw);
  }

  function stop() {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  resize();
  start();
})();
