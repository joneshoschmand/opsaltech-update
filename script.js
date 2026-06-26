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

  /* ---------- BURGER (simple toggle to nav links) ---------- */
  const burger = document.getElementById('burger');
  const links = document.querySelector('.nav__links');
  burger?.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? '' : 'flex';
    if (!open) {
      Object.assign(links.style, {
        position: 'fixed', inset: '70px 16px auto', flexDirection: 'column',
        gap: '8px', background: 'rgba(10,12,20,.92)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: '18px', padding: '20px'
      });
    }
  });
  links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (innerWidth <= 900) links.style.display = '';
  }));

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
  const counters = document.querySelectorAll('.stat__num');
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

  /* ---------- TO TOP ---------- */
  document.getElementById('toTop')?.addEventListener('click', () =>
    scrollTo({ top: 0, behavior: 'smooth' }));
})();
