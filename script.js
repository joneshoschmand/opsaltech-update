/* ============================================================
   OPSALTECH — Interactions
   ============================================================ */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- PRELOADER ---------- */
  const pre = document.getElementById('preloader');
  // the wordmark assembles via CSS; dismiss once it has played AND the page loaded
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    pre.classList.add('done');
    document.querySelector('.hero').classList.add('in');
  };
  let loaded = document.readyState === 'complete', minElapsed = false;
  const maybe = () => { if (loaded && minElapsed) finish(); };
  addEventListener('load', () => { loaded = true; maybe(); });
  setTimeout(() => { minElapsed = true; maybe(); }, 1850);   // let the letters land
  setTimeout(finish, 3600);                                  // hard safety net

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

  /* ---------- NAV SCROLL + PROGRESS + SCROLL FX ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const nav = document.getElementById('nav');
  const prog = document.querySelector('.scroll-progress');
  const hero = document.querySelector('.hero');
  const stSection = document.querySelector('.statement');
  const stInner = document.querySelector('.statement__inner');
  const spy = [...document.querySelectorAll('.nav__links a[href^="#"]')]
    .map(a => ({ a, sec: document.querySelector(a.getAttribute('href')) }))
    .filter(x => x.sec);
  let spyActive = null, sTick = false;

  const onScroll = () => {
    sTick = false;
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 40);
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';

    if (!reduce) {
      // hero gently scales down + fades as it leaves (Apple-style)
      if (hero) {
        const p = clamp(y / (innerHeight * 0.85), 0, 1);
        hero.style.opacity = (1 - p).toFixed(3);
        hero.style.transform = `scale(${(1 - p * 0.06).toFixed(4)})`;
      }
      // pinned statement scales into focus while sticky
      if (stSection && stInner) {
        const total = stSection.offsetHeight - innerHeight;
        const passed = total > 0 ? clamp(-stSection.getBoundingClientRect().top / total, 0, 1) : 0;
        const k = clamp(passed / 0.5, 0, 1);   // resolve over first half of the pin
        stInner.style.setProperty('--st-s', (0.86 + k * 0.14).toFixed(3));
        stInner.style.setProperty('--st-o', (0.45 + k * 0.55).toFixed(3));
      }
    }

    // scrollspy — highlight the current section in the nav
    if (spy.length) {
      const line = y + innerHeight * 0.32;
      let cur = spy[0];
      for (const s of spy) if (s.sec.offsetTop <= line) cur = s;
      const active = y < innerHeight * 0.55 ? null : cur;
      if (active !== spyActive) {
        spy.forEach(s => s.a.classList.remove('active'));
        active?.a.classList.add('active');
        spyActive = active;
      }
    }
  };
  const reqScroll = () => { if (!sTick) { sTick = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', reqScroll, { passive: true });
  addEventListener('resize', reqScroll, { passive: true });
  onScroll();

  /* ---------- SCROLL-VELOCITY MARQUEE (reactive tilt) ---------- */
  if (!reduce) {
    const marquees = [...document.querySelectorAll('.marquee')];
    if (marquees.length) {
      let lastY = scrollY, vel = 0, skew = 0, mraf = null;
      const setSkew = v => marquees.forEach(m => m.style.setProperty('--mq-skew', v.toFixed(2) + 'deg'));
      const decay = () => {
        vel *= 0.86;
        skew += (vel - skew) * 0.2;
        setSkew(skew);
        if (Math.abs(vel) > 0.02 || Math.abs(skew) > 0.02) mraf = requestAnimationFrame(decay);
        else { mraf = null; setSkew(0); }
      };
      addEventListener('scroll', () => {
        const y = scrollY;
        vel = clamp((y - lastY) * 0.08, -2.4, 2.4);   // subtle tilt
        lastY = y;
        if (!mraf) mraf = requestAnimationFrame(decay);
      }, { passive: true });
    }
  }

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
  // cards & media scale gently into place (Apple product-card feel)
  // (service cards are excluded — they get the scroll-assembly effect instead)
  document.querySelectorAll('.card, .stat, .why__card, .member, .tcard, .logo-chip, .browser')
    .forEach(el => { if (!el.closest('.services')) el.classList.add('reveal--zoom'); });

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

  /* ---------- HEADLINE LINE REVEAL (masked rise, Apple-style) ---------- */
  if (!reduce) {
    document.querySelectorAll('.section-title, .cta__title').forEach(h => {
      const lines = h.innerHTML.split(/<br\s*\/?>/i);
      h.innerHTML = lines.map((ln, i) =>
        `<span class="tl"><span class="tl__i" style="--tl-d:${(i * 0.09).toFixed(2)}s">${ln}</span></span>`
      ).join('');
      new IntersectionObserver((es, ob) => {
        es.forEach(e => { if (e.isIntersecting) { h.classList.add('tl-in'); ob.unobserve(h); } });
      }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }).observe(h);
    });
  }

  /* ---------- SERVICES: STICKY TIMELINE + SCROLLYTELLING ---------- */
  const svc = document.querySelector('.svc');
  if (svc) {
    const lineEl = svc.querySelector('.svc__line');
    const fill = svc.querySelector('.svc__fill');
    const steps = [...svc.querySelectorAll('.svc__step')];
    const dots = steps.map(s => s.querySelector('.svc__dot'));
    const panels = [...svc.querySelectorAll('.svc__panel')];
    const N = panels.length;

    // KPI count-up — fires once when a panel scrolls into view
    const fmt = (v, dec, pre, suf) => pre + v.toFixed(dec) + suf;
    const runKPIs = (panel) => panel.querySelectorAll('.kpi__val').forEach(el => {
      if (el._done) return; el._done = true;
      const to = parseFloat(el.dataset.to) || 0, dec = parseInt(el.dataset.decimals || 0);
      const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      if (reduce) { el.textContent = fmt(to, dec, pre, suf); return; }
      let start = null; const dur = 1100;
      const stepFn = (t) => {
        if (!start) start = t;
        const p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(to * e, dec, pre, suf);
        if (p < 1) requestAnimationFrame(stepFn);
      };
      requestAnimationFrame(stepFn);
    });

    // reveal each panel's bars + KPIs as it enters view
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-active'); runKPIs(e.target); } });
    }, { threshold: 0.32, rootMargin: '0px 0px -12% 0px' });
    panels.forEach(p => io.observe(p));

    // timeline: highlight the active step + travel the fill line down with the scroll
    let tick = false;
    const paint = () => {
      tick = false;
      const mark = innerHeight * 0.42;   // the "reading line"
      let idx = 0;
      panels.forEach((p, i) => { if (p.getBoundingClientRect().top <= mark) idx = i; });
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      if (fill && lineEl && dots[idx]) {
        const cp = panels[idx].getBoundingClientRect();
        const internal = clamp((mark - cp.top) / cp.height, 0, 1);
        const lineTop = lineEl.getBoundingClientRect().top;
        const posOf = (i) => dots[i].getBoundingClientRect().top - lineTop + 7;
        const a = posOf(idx), b = posOf(Math.min(idx + 1, N - 1));
        fill.style.height = Math.max(0, a + (b - a) * internal).toFixed(1) + 'px';
      }
    };
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(paint); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req, { passive: true });
    paint();
  }

  /* ---------- PROCESS: SCROLL-LINKED LCD READOUTS ---------- */
  (() => {
    const steps = [...document.querySelectorAll('.process .step')];
    if (!steps.length) return;
    const lcds = steps.map(step => {
      const box = document.createElement('div');
      box.className = 'step__lcd';
      box.setAttribute('aria-hidden', 'true');
      box.innerHTML = '<span class="step__lcd-label">Fortschritt</span>' +
        '<span class="lcd"><span class="lcd-val">000</span><span class="lcd-unit">%</span></span>';
      step.appendChild(box);
      return box.querySelector('.lcd-val');
    });
    if (reduce) { lcds.forEach((v, i) => { v.textContent = '100'; steps[i].classList.add('is-complete'); }); return; }
    let tick = false;
    const paint = () => {
      tick = false;
      steps.forEach((step, i) => {
        const r = step.getBoundingClientRect();
        const prog = clamp((innerHeight * 0.72 - r.top) / (r.height * 0.7 + innerHeight * 0.12), 0, 1);
        lcds[i].textContent = String(Math.round(prog * 100)).padStart(3, '0');
        step.classList.toggle('is-active', prog > 0.02 && prog < 0.999);
        step.classList.toggle('is-complete', prog >= 0.999);
      });
    };
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(paint); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req, { passive: true });
    paint();
  })();

  /* ---------- PINNED ONE-AT-A-TIME SHOWCASE ---------- */
  const showcase = document.querySelector('.showcase');
  const stage = showcase?.querySelector('.showcase__stage');
  const dotsWrap = showcase?.querySelector('.showcase__dots');
  if (showcase && stage && !reduce) {
    const tiles = [...stage.querySelectorAll('.browser')];
    const N = tiles.length;
    if (N > 1) {
      showcase.style.setProperty('--n', N);
      showcase.classList.add('is-pinned');
      tiles.forEach(t => t.classList.remove('reveal', 'reveal--zoom'));

      const topOf = () => showcase.getBoundingClientRect().top + scrollY;
      const dots = tiles.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Beispiel ${i + 1} von ${N}`);
        b.addEventListener('click', () => {
          const total = showcase.offsetHeight - innerHeight;
          scrollTo({ top: topOf() + ((i + 0.5) / N) * total, behavior: 'smooth' });
        });
        dotsWrap?.appendChild(b);
        return b;
      });

      let cur = -1, tick = false;
      const paint = () => {
        tick = false;
        const total = showcase.offsetHeight - innerHeight;
        const p = total > 0 ? clamp(-showcase.getBoundingClientRect().top / total, 0, 1) : 0;
        let idx = Math.floor(p * N);
        if (idx >= N) idx = N - 1;
        if (idx === cur) return;
        cur = idx;
        tiles.forEach((t, i) => {
          const active = i === idx;
          t.style.opacity = active ? '1' : '0';
          t.style.transform = active ? 'none' : `translateY(${i < idx ? -46 : 46}px) scale(.955)`;
          t.style.pointerEvents = active ? 'auto' : 'none';
          t.style.zIndex = active ? '2' : '1';
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      };
      const req = () => { if (!tick) { tick = true; requestAnimationFrame(paint); } };
      addEventListener('scroll', req, { passive: true });
      addEventListener('resize', req, { passive: true });
      paint();
    }
  }

  /* ---------- WHY: PINNED GIANT-ICON STATEMENTS ---------- */
  const whyPin = document.querySelector('.why-pin');
  const whyGrid = whyPin?.querySelector('.why__grid');
  const whyDots = whyPin?.querySelector('.why-dots');
  if (whyPin && whyGrid && !reduce) {
    const items = [...whyGrid.querySelectorAll('.why__card')];
    const N = items.length;
    if (N > 1) {
      whyPin.style.setProperty('--n', N);
      whyPin.classList.add('is-pinned');
      items.forEach((card, i) => {
        card.classList.remove('reveal', 'reveal--zoom');
        // animated index eyebrow
        const idx = document.createElement('span');
        idx.className = 'why__idx';
        idx.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
        const h = card.querySelector('h3');
        card.insertBefore(idx, h);
        // split heading into masked, staggered words
        h.innerHTML = h.textContent.trim().split(/\s+/)
          .map(w => `<span class="wl"><span class="wi">${w}</span></span>`).join(' ');
      });
      const topOf = () => whyPin.getBoundingClientRect().top + scrollY;
      const dots = items.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Punkt ${i + 1} von ${N}`);
        b.addEventListener('click', () => {
          const total = whyPin.offsetHeight - innerHeight;
          scrollTo({ top: topOf() + ((i + 0.5) / N) * total, behavior: 'smooth' });
        });
        whyDots?.appendChild(b);
        return b;
      });
      let cur = -1, tick = false;
      const paint = () => {
        tick = false;
        const total = whyPin.offsetHeight - innerHeight;
        const p = total > 0 ? clamp(-whyPin.getBoundingClientRect().top / total, 0, 1) : 0;
        let idx = Math.floor(p * N);
        if (idx >= N) idx = N - 1;
        if (idx === cur) return;
        cur = idx;
        items.forEach((c, i) => {
          const active = i === idx;
          c.style.opacity = active ? '1' : '0';
          c.style.transform = active ? 'none' : `translateY(${i < idx ? -30 : 30}px)`;
          c.style.pointerEvents = active ? 'auto' : 'none';
          c.style.zIndex = active ? '2' : '1';
          c.classList.toggle('is-active', active);
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      };
      const req = () => { if (!tick) { tick = true; requestAnimationFrame(paint); } };
      addEventListener('scroll', req, { passive: true });
      addEventListener('resize', req, { passive: true });
      paint();
    }
  }

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

  /* ---------- CONTACT FORM (Formspree AJAX) ---------- */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const errorMsg = document.getElementById('formError');
  const chips = form ? [...form.querySelectorAll('.chip')] : [];
  chips.forEach(c => c.addEventListener('click', () => {
    c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  }));
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const consent = form.querySelector('#consent');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnLabel = submitBtn?.querySelector('.btn__label');
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const services = chips.filter(c => c.getAttribute('aria-pressed') === 'true').map(c => c.dataset.service);

    let invalid = false;
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    if (!name || !emailOk || !phone) {
      form.querySelectorAll('#name,#email,#phone').forEach(f => {
        if (!f.value.trim() || (f.id === 'email' && !emailOk)) { f.style.borderColor = '#d92b57'; setTimeout(() => f.style.borderColor = '', 1800); }
      });
      invalid = true;
    }
    if (!consent.checked) {
      const wrap = consent.closest('.consent');
      wrap.classList.add('consent--error');
      setTimeout(() => wrap.classList.remove('consent--error'), 2200);
      invalid = true;
    }
    if (invalid) return;

    // fill hidden fields for Formspree
    form.querySelector('#svcField').value = services.join(', ');
    const data = new FormData(form);
    data.set('_subject', 'Projektanfrage von ' + name + (services.length ? ' — ' + services.join(', ') : ''));

    errorMsg?.classList.remove('show');
    success.classList.remove('show');
    submitBtn.disabled = true;
    const prev = btnLabel ? btnLabel.textContent : '';
    if (btnLabel) btnLabel.textContent = 'Wird gesendet …';
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (res.ok) {
        success.classList.add('show');
        form.reset();
        chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
        setTimeout(() => success.classList.remove('show'), 9000);
      } else {
        errorMsg?.classList.add('show');
      }
    } catch {
      errorMsg?.classList.add('show');
    } finally {
      submitBtn.disabled = false;
      if (btnLabel) btnLabel.textContent = prev || 'Anfrage senden';
    }
  });

  /* ---------- SCROLL-HIGHLIGHT STATEMENT ---------- */
  const st = document.getElementById('statementText');
  if (st) {
    const words = st.textContent.trim().split(/\s+/);
    st.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
    const spans = [...st.querySelectorAll('.w')];
    const sec = st.closest('.statement');
    let raf = null;
    const paint = () => {
      raf = null;
      let p;
      if (sec) {
        // tie word-by-word lighting to progress through the pinned section
        const total = sec.offsetHeight - innerHeight;
        p = total > 0 ? (-sec.getBoundingClientRect().top / total) * 1.6 - 0.1 : 0;
      } else {
        const r = st.getBoundingClientRect();
        p = (innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.45);
      }
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

  /* ---------- FOOTER WORDMARK (letter-by-letter rise) ---------- */
  const fbig = document.querySelector('.footer__big');
  if (fbig) {
    const chars = (fbig.textContent || '').trim().split('');
    fbig.textContent = '';
    chars.forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'fb-l';
      s.textContent = ch;
      s.style.transitionDelay = (i * 70) + 'ms';
      fbig.appendChild(s);
    });
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { fbig.classList.add('lit'); obs.unobserve(fbig); } });
    }, { threshold: 0.25 }).observe(fbig);
  }

  /* ---------- TO TOP ---------- */
  document.getElementById('toTop')?.addEventListener('click', () =>
    scrollTo({ top: 0, behavior: 'smooth' }));
})();
