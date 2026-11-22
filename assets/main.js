/* FireflyOS · 交互
   深浅色切换、导航、入场动画与萤火粒子 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 统一入场动画 ---------------- */
  var enterEl = document.getElementById('enter');
  var enterDone = false;

  function finishEnter() {
    if (!enterEl || enterDone) return;
    enterDone = true;
    root.classList.add('enter-done');
    root.classList.remove('enter-lock');
    window.dispatchEvent(new Event('enter:done'));
    setTimeout(function () {
      if (enterEl && enterEl.parentNode) enterEl.parentNode.removeChild(enterEl);
    }, 900);
  }

  if (enterEl) {
    if (reduceMotion) {
      enterEl.parentNode.removeChild(enterEl);
      root.classList.add('enter-done');
    } else {
      root.classList.add('enter-lock');
      var enterStart = Date.now();
      var scheduleEnterEnd = function () {
        var wait = Math.max(0, 900 - (Date.now() - enterStart));
        setTimeout(finishEnter, wait);
      };
      if (document.readyState === 'complete') scheduleEnterEnd();
      else window.addEventListener('load', scheduleEnterEnd);
      setTimeout(finishEnter, 2800);
      enterEl.addEventListener('click', finishEnter);
      window.addEventListener('keydown', finishEnter, { once: true });
    }
  }

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

  /* ---------------- 导航高光 ---------------- */
  var navHover = navLinks ? navLinks.querySelector('.nav-hover') : null;
  if (navLinks && navHover) {
    var movePill = function (link) {
      if (!link || window.matchMedia('(max-width: 820px)').matches) return;
      navHover.style.setProperty('--pill-x', link.offsetLeft + 'px');
      navHover.style.setProperty('--pill-w', link.offsetWidth + 'px');
      navLinks.classList.add('pill-on');
    };
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('mouseenter', function () { movePill(link); });
      link.addEventListener('focus', function () { movePill(link); });
    });
    navLinks.addEventListener('mouseleave', function () {
      navLinks.classList.remove('pill-on');
    });
    navLinks.addEventListener('blur', function () {
      navLinks.classList.remove('pill-on');
    }, true);
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


/* ---------- 流萤光标尾迹 ---------- */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var last = 0;
  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - last < 75) return;
    last = now;
    var spark = document.createElement('span');
    spark.className = 'cursor-spark';
    spark.style.left = e.clientX + 'px';
    spark.style.top = e.clientY + 'px';
    spark.style.setProperty('--sx', (Math.random() * 18 - 9).toFixed(1) + 'px');
    spark.style.setProperty('--sy', (-10 - Math.random() * 16).toFixed(1) + 'px');
    document.body.appendChild(spark);
    window.setTimeout(function () { spark.remove(); }, 950);
  }, { passive: true });
})();

/* ---------- 自定义光标（参考 Moonshot） ---------- */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  document.documentElement.classList.add('cursor-ready');

  var mx = -100, my = -100, rx = -100, ry = -100, shown = false, down = false;
  var hoverSel = 'a, button, .btn, [role="button"], [data-cursor-hover], .card, .member, .thanks-card, .product-card';

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    if (!shown) {
      shown = true;
      ring.style.opacity = '1';
      dot.style.opacity = '1';
    }
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
  }, { passive: true });

  (function loop() {
    rx += (mx - rx) * 0.3;
    ry += (my - ry) * 0.3;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) scale(' + (down ? 0.86 : 1) + ')';
    window.requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add('is-hover');
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest(hoverSel)) ring.classList.remove('is-hover');
  });
  document.addEventListener('mousedown', function () { down = true; });
  document.addEventListener('mouseup', function () { down = false; });
  document.addEventListener('mouseleave', function () {
    ring.style.opacity = '0';
    dot.style.opacity = '0';
    shown = false;
  });
})();

/* ---------- 超进化视觉层 ---------- */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  var top = document.createElement('button');
  top.className = 'back-top';
  top.type = 'button';
  top.setAttribute('aria-label', '返回顶部');
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(top);
  top.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
      top.style.setProperty('--p', (p * 100).toFixed(1));
      top.classList.toggle('show', window.scrollY > 640);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!reduce) {
    document.querySelectorAll('.card, .thanks-card, .version-card, .product-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        card.style.setProperty('--rx', ((.5 - py) * 2.6).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((px - .5) * 2.6).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.style.removeProperty('--rx');
        card.style.removeProperty('--ry');
      });
    });
  }

  var nav = document.getElementById('navLinks');
  if (nav) {
    var anchors = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var map = {};
    anchors.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute('href').slice(1));
      if (sec) map[sec.id] = a;
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          anchors.forEach(function (a) { a.classList.remove('is-active'); });
          var active = map[en.target.id];
          if (active) active.classList.add('is-active');
        });
      }, { rootMargin: '-42% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) {
        var sec = document.getElementById(id);
        if (sec) io.observe(sec);
      });
    }
  }
})();