/* ============================================================
   OPSALTECH — Interactions
   ============================================================ */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- PRELOADER ---------- */
  const pre = document.getElementById('preloader');
  const bar = pre.querySelector('.preloader__bar span');
  const count = pre.querySelector('.preloader__count');
  let p = 0;
  const tick = setInterval(() => {
    p += Math.random() * 18;
    if (p >= 100) { p = 100; clearInterval(tick); finish(); }
    bar.style.width = p + '%';
    count.textContent = Math.floor(p) + '%';
  }, 130);
  function finish() {
    setTimeout(() => {
      pre.classList.add('done');
      document.querySelector('.hero').classList.add('in');
    }, 350);
  }
  // safety net
  window.addEventListener('load', () => setTimeout(() => {
    if (!pre.classList.contains('done')) { p = 100; clearInterval(tick); finish(); }
  }, 2500));

  /* ---------- CUSTOM CURSOR ---------- */
  if (fine) {
    const ring = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('[data-cursor]').forEach(el => {
      const type = el.getAttribute('data-cursor');
      el.addEventListener('mouseenter', () => ring.classList.add(type === 'view' ? 'is-view' : 'is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover', 'is-view'));
    });
    addEventListener('mousedown', () => ring.style.scale = '0.8');
    addEventListener('mouseup', () => ring.style.scale = '1');
  }

  /* ---------- NAV SCROLL + PROGRESS ---------- */
  const nav = document.getElementById('nav');
  const prog = document.querySelector('.scroll-progress');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 40);
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    nav.classList.toggle('menu-open', open);
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  };
  burger?.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
  // auto-close if resized up to desktop
  addEventListener('resize', () => { if (innerWidth > 900 && menu.classList.contains('open')) setMenu(false); });

  /* ---------- REVEAL ON SCROLL ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (e.target.dataset.delay || 0) + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  // stagger siblings within a grid
  document.querySelectorAll('.cards, .why__grid, .logos, .tcards, .stats, .team__grid, .steps').forEach(group => {
    [...group.querySelectorAll('.reveal')].forEach((el, i) => el.dataset.delay = i * 90);
  });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- COUNTERS ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const cObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || 0);
      const suffix = el.dataset.suffix || '';
      const dur = 1600; let start = null;
      const step = (t) => {
        if (!start) start = t;
        const prgs = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - prgs, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (prgs < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec) + suffix;
      };
      requestAnimationFrame(step);
      cObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cObs.observe(c));

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('.magnetic').forEach(el => {
      const strength = 0.35;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ---------- 3D TILT + GLOW ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const max = 8;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateY(${(px - .5) * max}deg) rotateX(${-(py - .5) * max}deg)`;
        el.style.setProperty('--mx', (px * 100) + '%');
        el.style.setProperty('--my', (py * 100) + '%');
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ---------- HERO PARALLAX AURORA ---------- */
  if (fine && !reduce) {
    const auroras = document.querySelectorAll('.aurora');
    addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - .5);
      const y = (e.clientY / innerHeight - .5);
      auroras.forEach((a, i) => {
        const d = (i + 1) * 14;
        a.style.marginLeft = (x * d) + 'px';
        a.style.marginTop = (y * d) + 'px';
      });
    });
  }

  /* ---------- SMOOTH SCROLL PARALLAX (desktop + mobile) ---------- */
  if (!reduce) {
    const pEls = [
      ...document.querySelectorAll('[data-parallax]'),
      ...document.querySelectorAll('.section-title:not([data-parallax])')
    ].map(el => ({ el, speed: parseFloat(el.dataset.parallax) || 0.05, cur: 0, set: false }));

    if (pEls.length) {
      let running = false;
      const frame = () => {
        const vh = innerHeight;
        let active = false;
        pEls.forEach(p => {
          const r = p.el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;       // skip off-screen
          const center = r.top + r.height / 2 - vh / 2;
          const target = -center * p.speed;
          p.cur += (target - p.cur) * 0.09;                       // lerp = buttery
          if (Math.abs(target - p.cur) > 0.15) active = true;
          p.el.style.transform = `translate3d(0,${p.cur.toFixed(2)}px,0)`;
        });
        if (active) requestAnimationFrame(frame); else running = false;
      };
      const kick = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
      addEventListener('scroll', kick, { passive: true });
      addEventListener('resize', kick, { passive: true });
      addEventListener('touchmove', kick, { passive: true });
      kick();
    }
  }

  /* ---------- CONTACT FORM ---------- */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const msg = form.querySelector('#msg').value.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !msg) {
      form.querySelectorAll('input,textarea').forEach(f => {
        if (!f.value.trim()) { f.style.borderColor = '#ff4d9d'; setTimeout(() => f.style.borderColor = '', 1500); }
      });
      return;
    }
    // No backend wired up — open a prefilled mail draft and confirm in-UI.
    const body = encodeURIComponent(`Name: ${name}\nE-Mail: ${email}\n\n${msg}`);
    window.location.href = `mailto:info@opsaltech.com?subject=${encodeURIComponent('Projektanfrage von ' + name)}&body=${body}`;
    success.classList.add('show');
    form.reset();
    setTimeout(() => success.classList.remove('show'), 6000);
  });

  /* ---------- SCROLL-HIGHLIGHT STATEMENT ---------- */
  const st = document.getElementById('statementText');
  if (st) {
    const words = st.textContent.trim().split(/\s+/);
    st.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
    const spans = [...st.querySelectorAll('.w')];
    let raf = null;
    const paint = () => {
      raf = null;
      const r = st.getBoundingClientRect();
      const p = (innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.45);
      const active = Math.max(0, Math.min(1, p)) * (spans.length + 2);
      spans.forEach((s, i) => {
        const d = active - i;
        s.classList.toggle('on', d > 0);
        s.classList.toggle('hot', d > 0 && d < 2.4);
      });
    };
    const onScrollStmt = () => { if (!raf) raf = requestAnimationFrame(paint); };
    addEventListener('scroll', onScrollStmt, { passive: true });
    addEventListener('resize', onScrollStmt, { passive: true });
    paint();
  }

  /* ---------- BEDIENUNGSHILFE (accessibility widget) ---------- */
  (function a11yWidget() {
    const wrap = document.querySelector('.a11y');
    const toggle = document.getElementById('a11yToggle');
    const closeBtn = document.getElementById('a11yClose');
    const panel = document.getElementById('a11yPanel');
    const fontVal = document.getElementById('a11yFontVal');
    if (!wrap || !toggle) return;
    const STEPS = [1, 1.1, 1.25, 1.4];
    const modes = ['contrast', 'links', 'readable', 'nomotion'];
    const store = {
      get(k, d) { try { const v = localStorage.getItem('a11y_' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
      set(k, v) { try { localStorage.setItem('a11y_' + k, JSON.stringify(v)); } catch { } }
    };
    let fontIdx = Math.min(Math.max(store.get('font', 0) | 0, 0), STEPS.length - 1);

    const applyFont = () => {
      document.body.style.zoom = STEPS[fontIdx] === 1 ? '' : STEPS[fontIdx];
      fontVal.textContent = Math.round(STEPS[fontIdx] * 100) + '%';
      store.set('font', fontIdx);
    };
    const applyMode = (m, on) => {
      document.documentElement.classList.toggle('a11y-' + m, on);
      const b = wrap.querySelector('[data-a11y="' + m + '"]');
      if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
      store.set(m, on);
    };
    // restore saved preferences
    modes.forEach(m => applyMode(m, store.get(m, false) === true));
    applyFont();

    const openPanel = (o) => {
      wrap.classList.toggle('open', o);
      toggle.setAttribute('aria-expanded', o ? 'true' : 'false');
      panel.setAttribute('aria-hidden', o ? 'false' : 'true');
    };
    toggle.addEventListener('click', () => openPanel(!wrap.classList.contains('open')));
    closeBtn?.addEventListener('click', () => openPanel(false));
    addEventListener('keydown', e => { if (e.key === 'Escape' && wrap.classList.contains('open')) { openPanel(false); toggle.focus(); } });
    addEventListener('click', e => { if (wrap.classList.contains('open') && !wrap.contains(e.target)) openPanel(false); });

    wrap.querySelectorAll('[data-a11y]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.getAttribute('data-a11y');
        if (act === 'font-inc') { fontIdx = Math.min(fontIdx + 1, STEPS.length - 1); applyFont(); }
        else if (act === 'font-dec') { fontIdx = Math.max(fontIdx - 1, 0); applyFont(); }
        else if (act === 'reset') { fontIdx = 0; applyFont(); modes.forEach(m => applyMode(m, false)); }
        else if (modes.includes(act)) { applyMode(act, !document.documentElement.classList.contains('a11y-' + act)); }
      });
    });
  })();

  /* ---------- COOKIE / CONSENT BANNER ---------- */
  (function cookieConsent() {
    const bar = document.getElementById('cookie');
    if (!bar) return;
    const settings = document.getElementById('cookieSettings');
    const inner = bar.querySelector('.cookie__inner');
    inner?.setAttribute('tabindex', '-1');
    const KEY = 'opsal_consent';
    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
    const q = (sel) => bar.querySelector(sel);
    const btnSettings = q('[data-cookie="settings"]');
    const btnSave = q('[data-cookie="save"]');

    const expand = (on) => {
      settings.hidden = !on;
      if (btnSettings) btnSettings.hidden = on;
      if (btnSave) btnSave.hidden = !on;
    };
    const show = (openSettings) => {
      bar.classList.add('show');
      bar.setAttribute('aria-hidden', 'false');
      expand(!!openSettings);
      inner?.focus();
    };
    const hide = () => { bar.classList.remove('show'); bar.setAttribute('aria-hidden', 'true'); };

    // activate any consent-gated scripts (future analytics etc.)
    const applyConsent = (c) => {
      ['statistics', 'marketing'].forEach(cat => {
        if (!c[cat]) return;
        document.querySelectorAll('script[type="text/plain"][data-consent="' + cat + '"]').forEach(s => {
          const ns = document.createElement('script');
          if (s.dataset.src) ns.src = s.dataset.src; else ns.textContent = s.textContent;
          [...s.attributes].forEach(a => { if (!['type', 'data-consent', 'data-src'].includes(a.name)) ns.setAttribute(a.name, a.value); });
          s.parentNode.replaceChild(ns, s);
        });
      });
      window.OpsalConsent = { get: () => c };
      document.dispatchEvent(new CustomEvent('consent:updated', { detail: c }));
    };
    const persist = (statistics, marketing) => {
      const c = { necessary: true, statistics: !!statistics, marketing: !!marketing, ts: new Date().toISOString() };
      try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { }
      applyConsent(c);
      hide();
    };

    q('[data-cookie="accept"]')?.addEventListener('click', () => persist(true, true));
    q('[data-cookie="reject"]')?.addEventListener('click', () => persist(false, false));
    btnSettings?.addEventListener('click', () => expand(true));
    btnSave?.addEventListener('click', () => persist(q('[data-cat="statistics"]')?.checked, q('[data-cat="marketing"]')?.checked));

    document.querySelectorAll('[data-cookie="open"]').forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      const c = read() || {};
      const st = q('[data-cat="statistics"]'); if (st) st.checked = !!c.statistics;
      const mk = q('[data-cat="marketing"]'); if (mk) mk.checked = !!c.marketing;
      show(true);
    }));

    const existing = read();
    if (existing && existing.necessary) applyConsent(existing);
    else setTimeout(() => show(false), 1200);
  })();

  /* ---------- CLICK-TO-LOAD EMBED (DSGVO two-click) ---------- */
  document.querySelectorAll('.browser__load').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.closest('[data-embed]');
      if (!view) return;
      const iframe = document.createElement('iframe');
      iframe.src = view.getAttribute('data-embed');
      iframe.title = view.getAttribute('data-embed-title') || 'Externe Website';
      iframe.loading = 'lazy';
      iframe.setAttribute('referrerpolicy', 'no-referrer');
      view.innerHTML = '';
      view.appendChild(iframe);
      const hint = document.createElement('span');
      hint.className = 'browser__hint';
      hint.textContent = '● live · scroll im Fenster';
      view.appendChild(hint);
    });
  });

  /* ---------- LEGAL MODAL ---------- */
  const legal = document.getElementById('legal');
  const legalBody = document.getElementById('legalBody');
  const legalTitle = document.getElementById('legalTitle');
  const legalTitles = { impressum: 'Impressum', datenschutz: 'Datenschutzerklärung' };
  let legalTrigger = null;
  const openLegal = (key) => {
    const src = document.getElementById('legal-' + key);
    if (!src || !legal) return;
    legalBody.innerHTML = src.innerHTML;
    legalBody.scrollTop = 0;
    legalTitle.textContent = legalTitles[key] || 'Rechtliches';
    legal.classList.add('open');
    legal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('legal-open');
    legal.querySelector('.legal__close')?.focus();   // move focus into dialog
  };
  const closeLegal = () => {
    if (!legal) return;
    legal.classList.remove('open');
    legal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('legal-open');
    legalTrigger?.focus();                            // return focus to trigger
    legalTrigger = null;
  };
  document.querySelectorAll('[data-legal]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    legalTrigger = el;
    if (innerWidth <= 900) setMenu(false);   // close mobile menu if open
    openLegal(el.getAttribute('data-legal'));
  }));
  legal?.querySelectorAll('[data-legal-close]').forEach(el => el.addEventListener('click', closeLegal));
  addEventListener('keydown', e => { if (e.key === 'Escape' && legal?.classList.contains('open')) closeLegal(); });

  /* ---------- TO TOP ---------- */
  document.getElementById('toTop')?.addEventListener('click', () =>
    scrollTo({ top: 0, behavior: 'smooth' }));
})();
