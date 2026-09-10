/* ============================================================
   OPSALTECH — Kinetic type reveal for the process section (04)
   Self-hosted anime.js, split-text words/chars, scroll-triggered.
   Based on the user's anime.js snippet, adapted from an infinite
   loop to a one-shot reveal that fires as each step scrolls in.
   ============================================================ */
import { createTimeline, stagger, splitText, utils } from './anime.esm.min.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const section = document.querySelector('#prozess');

if (section && !reduce) {
  const build = () => {
    const paras = [...section.querySelectorAll('.step__body p')];

    paras.forEach((p) => {
      let split;
      try {
        // split into words (clipped) + chars — same config as the snippet
        split = splitText(p, { words: { wrap: 'clip' }, chars: true });
      } catch (e) {
        return; // on any failure leave the paragraph untouched & readable
      }
      const { chars } = split;
      if (!chars || !chars.length) return;

      // direction per line: odd lines rise from below, even from above
      const dir = ($el) => (+($el.dataset.line || 0) % 2 ? '100%' : '-100%');

      // pre-hide the characters inside their clipped words
      utils.set(chars, { y: dir });

      const tl = createTimeline({
        autoplay: false,
        defaults: { ease: 'inOut(3)', duration: 650 },
      }).add(chars, { y: '0%' }, stagger(10, { from: 'random' }));

      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { tl.play(); obs.unobserve(p); }
        });
      }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });

      io.observe(p);
    });
  };

  // wait for fonts so line-breaks (and data-line) are measured correctly
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
  } else {
    addEventListener('load', build);
  }
}
