/* ═══════════════════════════════════════════════════════════
   DARK BUSHIDO — shared behaviour for every page
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── LOADING (index only) ───────────────────────────────── */
  (function loading() {
    var screen = $('#loadingScreen');
    var bar = $('#loadingBar');
    if (!screen) return;

    var pct = 0;
    var tick = setInterval(function () {
      pct = Math.min(pct + Math.random() * 14, 92);
      if (bar) bar.style.transform = 'scaleX(' + (pct / 100) + ')';
    }, 180);

    var start = Date.now();
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      clearInterval(tick);
      if (bar) bar.style.transform = 'scaleX(1)';
      var wait = Math.max(0, (reduceMotion ? 200 : 900) - (Date.now() - start));
      setTimeout(function () {
        screen.classList.add('is-done');
        setTimeout(function () { screen.remove(); }, 700);
      }, wait);
    }

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish);
    setTimeout(finish, 6000); // never trap the visitor behind a stalled asset
  })();

  /* ── SAKURA PETALS ──────────────────────────────────────── */
  (function petals() {
    var layer = $('#petalLayer');
    if (!layer || reduceMotion) return;

    var COUNT = window.innerWidth < 700 ? 7 : 13;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < COUNT; i++) {
      var variant = (i % 4) + 1;
      var size = 11 + Math.random() * 19;
      var fall = 11 + Math.random() * 11;
      var drift = 4 + Math.random() * 4.5;
      var outer = document.createElement('span');
      var inner = document.createElement('span');

      outer.className = 'petal';
      outer.style.left = (Math.random() * 100) + '%';
      outer.style.width = size + 'px';
      outer.style.height = size + 'px';
      outer.style.opacity = (0.22 + Math.random() * 0.3).toFixed(2);
      outer.style.animation = 'petal-fall ' + fall.toFixed(2) + 's linear ' + (-Math.random() * fall).toFixed(2) + 's infinite';

      inner.className = 'petal__inner';
      inner.style.backgroundImage = "url('assets/petals/petal-0" + variant + ".png')";
      inner.style.animation = 'petal-drift ' + drift.toFixed(2) + 's ease-in-out ' + (-Math.random() * drift).toFixed(2) + 's infinite';

      outer.appendChild(inner);
      frag.appendChild(outer);
    }
    layer.appendChild(frag);
  })();

  /* ── SCROLL REVEAL ──────────────────────────────────────── */
  (function reveal() {
    var items = $$('.reveal');
    items.forEach(function (el) {
      if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay);
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });

    // above-the-fold copy animates on load rather than on scroll; everything
    // below (Contact included, now that it's mid-page) uses the IO above
    window.addEventListener('load', function () {
      $$('.hero .reveal').forEach(function (el, i) {
        setTimeout(function () { el.classList.add('is-in'); }, ($('#loadingScreen') ? 900 : 120) + i * 110);
      });
    });
  })();

  /* ── ABOUT KANJI RAIL: swaps to match the timeline entry nearest
     the viewport centre. Desktop-only layout (see CSS breakpoint),
     but harmless to run everywhere — it just updates hidden text. ── */
  (function aboutRail() {
    var items = $$('#timeline .tl');
    var charEl = $('#aboutRailChar');
    var glossEl = $('#aboutRailGloss');
    if (!items.length || !charEl) return;

    var current = '';
    var ticking = false;

    function update() {
      ticking = false;
      var mid = window.innerHeight / 2;
      var closest = null;
      var closestDist = Infinity;

      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return; // off-screen
        var dist = Math.abs((r.top + r.bottom) / 2 - mid);
        if (dist < closestDist) { closestDist = dist; closest = el; }
      });

      if (!closest || closest.dataset.kanji === current) return;
      current = closest.dataset.kanji;

      charEl.classList.add('is-swapping');
      charEl.textContent = current;
      if (glossEl) glossEl.textContent = closest.dataset.gloss || '';
      setTimeout(function () { charEl.classList.remove('is-swapping'); }, 260);
    }

    function onScroll() {
      if (ticking || reduceMotion) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  /* ── NAV STATE + PARALLAX ───────────────────────────────── */
  (function scrollUI() {
    var nav = $('#nav');
    var links = $$('.navpill a');
    var sections = $$('main section[id]');
    var wmLeft = $('#wmLeft');
    var wmRight = $('#wmRight');
    var ticking = false;

    // mark the link for this page (hash links are resolved per scroll below)
    var here = location.pathname.split('/').pop() || 'index.html';
    links.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('#') !== 0 && href.split('#')[0] === here && !a.classList.contains('is-active')) {
        if (href.indexOf('#') === -1) a.classList.add('is-active');
      }
    });

    function update() {
      ticking = false;
      var y = window.scrollY;
      if (nav) nav.classList.toggle('is-scrolled', y > 40);

      if (!reduceMotion && y < window.innerHeight * 1.2) {
        if (wmLeft) wmLeft.style.transform = 'translateY(' + (y * 0.16) + 'px)';
        if (wmRight) wmRight.style.transform = 'translateY(' + (y * -0.1) + 'px)';
      }

      if (!sections.length) return;
      var mid = y + window.innerHeight * 0.42;
      var current = sections[0];
      sections.forEach(function (s) { if (s.offsetTop <= mid) current = s; });
      var id = current ? current.id : '';

      links.forEach(function (a) {
        var href = a.getAttribute('href') || '';
        var frag = href.indexOf('#') > -1 ? href.slice(href.indexOf('#') + 1) : '';
        var samePage = href.indexOf('#') === 0 || href.split('#')[0] === here;
        if (frag && samePage) a.classList.toggle('is-active', frag === id);
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  /* ── MOBILE DRAWER ──────────────────────────────────────── */
  (function drawer() {
    var burger = $('#navBurger');
    var panel = $('#drawer');
    if (!burger || !panel) return;

    function open() {
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add('is-open'); });
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
      var first = panel.querySelector('a');
      if (first) first.focus();
    }
    function close() {
      panel.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      setTimeout(function () { panel.hidden = true; }, 340);
    }
    function isOpen() { return burger.getAttribute('aria-expanded') === 'true'; }

    burger.addEventListener('click', function () { isOpen() ? close() : open(); });
    $$('a', panel).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { close(); burger.focus(); }
    });
  })();

  /* ── AMBIENT AUDIO ──────────────────────────────────────── */
  (function audio() {
    var el = $('#ambient');
    var btn = $('#audioToggle');
    var label = $('#audioLabel');
    if (!el || !btn) return;

    var KEY = 'vb-ambient';
    var fadeTimer = null;
    el.volume = 0;

    function fade(to, done) {
      clearInterval(fadeTimer);
      var step = (to - el.volume) / 24;
      fadeTimer = setInterval(function () {
        var next = el.volume + step;
        if ((step > 0 && next >= to) || (step < 0 && next <= to)) {
          el.volume = to;
          clearInterval(fadeTimer);
          if (done) done();
        } else {
          el.volume = Math.max(0, Math.min(1, next));
        }
      }, 40);
    }
    function setState(on) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Mute ambient sound' : 'Play ambient sound');
      if (label) label.textContent = on ? 'Sound on' : 'Sound off';
    }
    function play() {
      var p = el.play();
      if (p && p.catch) p.catch(function () { setState(false); });
      fade(0.32);
      setState(true);
      try { localStorage.setItem(KEY, 'on'); } catch (e) {}
    }
    function stop() {
      fade(0, function () { el.pause(); });
      setState(false);
      try { localStorage.setItem(KEY, 'off'); } catch (e) {}
    }

    btn.addEventListener('click', function () {
      btn.getAttribute('aria-pressed') === 'true' ? stop() : play();
    });

    // Sound is ON by default and stays on across pages unless the visitor
    // turned it off. Browsers block unprompted audio, so if the autoplay
    // attempt is rejected we arm the first real interaction instead.
    var muted = false;
    try { muted = localStorage.getItem(KEY) === 'off'; } catch (e) {}
    if (muted) { setState(false); return; }

    setState(true);
    var armed = false;
    function arm() {
      if (armed) return;
      armed = true;
      var go = function () {
        document.removeEventListener('pointerdown', go);
        document.removeEventListener('keydown', go);
        document.removeEventListener('scroll', go);
        if (btn.getAttribute('aria-pressed') === 'true') play();
      };
      document.addEventListener('pointerdown', go, { once: true });
      document.addEventListener('keydown', go, { once: true });
      document.addEventListener('scroll', go, { once: true, passive: true });
    }

    var attempt = el.play();
    if (attempt && attempt.then) {
      attempt.then(function () { fade(0.32); }).catch(arm);
    } else {
      fade(0.32);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && !el.paused) el.pause();
      else if (!document.hidden && btn.getAttribute('aria-pressed') === 'true') el.play().catch(function () {});
    });
  })();

  /* ── VIDEO: pause when off screen ───────────────────────── */
  (function videos() {
    var vids = $$('video');
    if (!vids.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.play().catch(function () {});
        else e.target.pause();
      });
    }, { threshold: 0.05 });
    vids.forEach(function (v) { io.observe(v); });
  })();

  /* ── CONTACT FORM ───────────────────────────────────────── */
  (function contactForm() {
    var form = $('#contactForm');
    if (!form) return;
    var status = $('#formStatus');
    var button = form.querySelector('.submit');
    var endpoint = form.getAttribute('action') || '';
    var configured = endpoint.indexOf('FORM_ID') === -1;

    function setStatus(text, state) {
      if (!status) return;
      status.textContent = text;
      if (state) status.setAttribute('data-state', state);
      else status.removeAttribute('data-state');
    }

    function validate() {
      var ok = true;
      $$('.field', form).forEach(function (field) {
        var input = field.querySelector('input, textarea');
        if (!input || !input.required) return;
        var value = input.value.trim();
        var valid = value !== '' && (input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
        field.classList.toggle('is-invalid', !valid);
        if (!valid && ok) { input.focus(); ok = false; }
      });
      return ok;
    }

    $$('.field input, .field textarea', form).forEach(function (input) {
      input.addEventListener('input', function () {
        input.closest('.field').classList.remove('is-invalid');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) { setStatus('Check the highlighted fields.', 'error'); return; }

      if (!configured) {
        setStatus('Form endpoint is not connected yet — email bhardwajvinayak068@gmail.com in the meantime.', 'error');
        return;
      }

      button.disabled = true;
      setStatus('Sending…');

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        setStatus('Message received. I reply within two days.', 'ok');
      }).catch(function () {
        setStatus('That did not send. Email bhardwajvinayak068@gmail.com instead.', 'error');
      }).then(function () {
        button.disabled = false;
      });
    });
  })();

})();
