/* ============================================================
   ARABICA — site behaviour

   Progressive enhancement throughout: with JS disabled the video
   still autoplays via its own attributes, the floating layer still
   animates via CSS, and the form falls back to native validation.
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    iconOpen.hidden = open;
    iconClose.hidden = !open;
    menuBtn.querySelector('.sr-only').textContent =
      open ? 'Close navigation menu' : 'Open navigation menu';
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () =>
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); }
    });
    menu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => setMenu(false)));
  }

  /* ---------- Background video ----------
     A looping video is auto-playing moving content, so it gets an
     explicit stop control. Under reduced-motion we never start it:
     the poster frame carries the scene instead. */
  const video = document.getElementById('hero-video');
  const vToggle = document.getElementById('video-toggle');

  if (video && vToggle) {
    const vLabel = document.getElementById('v-toggle-label');
    const vPause = document.getElementById('v-icon-pause');
    const vPlay = document.getElementById('v-icon-play');

    function reflect(paused) {
      vToggle.setAttribute('aria-pressed', String(paused));
      vLabel.textContent = paused ? 'Play background' : 'Pause background';
      vPause.hidden = paused;
      vPlay.hidden = !paused;
    }

    function applyMotionPreference() {
      if (reduceMotion.matches) {
        video.pause();
        video.removeAttribute('autoplay');
        reflect(true);
      }
    }
    applyMotionPreference();
    reduceMotion.addEventListener('change', applyMotionPreference);

    vToggle.addEventListener('click', () => {
      if (video.paused) {
        // .play() rejects on some mobile browsers until a gesture; this
        // click IS that gesture, but guard anyway so the UI stays honest.
        video.play().then(() => reflect(false)).catch(() => reflect(true));
      } else {
        video.pause();
        reflect(true);
      }
    });

    video.addEventListener('play', () => reflect(false));
    video.addEventListener('pause', () => reflect(true));

    /* The control is fixed to the viewport so it stays reachable while the
       video is still on screen, but it belongs to the hero — once the hero
       scrolls away it would just float over unrelated content (and show
       through the translucent header), so retire it then. */
    const hero = video.closest('section');
    if (hero && 'IntersectionObserver' in window) {
      // Ratio, not mere intersection: scroll-padding-top leaves a sliver of
       // the hero on screen after an anchor jump, which "isIntersecting"
       // still counts as visible.
      new IntersectionObserver(([entry]) => {
        vToggle.hidden = entry.intersectionRatio < 0.2;
      }, { threshold: [0, 0.1, 0.2, 0.35, 0.6, 1] }).observe(hero);
    }

    // If autoplay is refused (data saver, low power mode), say so honestly
    // rather than leaving a control that claims to be playing.
    video.addEventListener('loadeddata', () => {
      if (video.paused && !reduceMotion.matches) reflect(true);
    });
  }

  /* ---------- Antigravity parallax ----------
     Pointer-driven depth on the floating layer. Each element declares
     its own depth via data-ag, so the back layer barely moves and the
     front layer leads. Written to a CSS custom property and applied in
     a rAF callback, so we never thrash layout.

     Skipped entirely under reduced-motion, and on touch-only devices
     where there is no hovering pointer to track. */
  const agItems = Array.from(document.querySelectorAll('[data-ag]'));
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (agItems.length && !reduceMotion.matches && finePointer.matches) {
    let targetX = 0, targetY = 0, curX = 0, curY = 0, ticking = false;

    function onMove(e) {
      // -1..1 relative to viewport centre
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    }

    function tick() {
      // ease toward the pointer so motion feels weighted, not twitchy
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;

      agItems.forEach((el) => {
        const depth = parseFloat(el.dataset.ag) || 0.5;
        const x = (-curX * 26 * depth).toFixed(2);
        const y = (-curY * 18 * depth).toFixed(2);
        // A separate translate property composes with the CSS keyframe
        // transform instead of overwriting it, so the drift keeps running.
        el.style.translate = x + 'px ' + y + 'px';
      });

      if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
        requestAnimationFrame(tick);
      } else {
        ticking = false;
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true });

    // Stop tracking and release the offsets if the preference flips
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) {
        window.removeEventListener('mousemove', onMove);
        agItems.forEach((el) => { el.style.translate = ''; });
      }
    });
  }

  /* ---------- Header state on scroll ---------- */
  const header = document.querySelector('header');
  if (header) {
    let lastKnown = false;
    const onScroll = () => {
      const scrolled = window.scrollY > 24;
      if (scrolled !== lastKnown) {
        lastKnown = scrolled;
        header.classList.toggle('shadow-float', scrolled);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reservation form ----------
     Validates on blur, messages sit below their field and are wired
     with aria-describedby + aria-invalid, and a failed submit focuses
     a summary that links to each offending field. */
  const form = document.getElementById('reserve-form');
  if (form) {
    const summary = document.getElementById('form-errors');
    const summaryList = document.getElementById('form-errors-list');
    const success = document.getElementById('form-success');
    const submitBtn = document.getElementById('r-submit');
    const submitLabel = document.getElementById('r-submit-label');
    const spinner = document.getElementById('r-spinner');

    const RULES = {
      'r-name': {
        label: 'Name',
        validate: (v) => {
          if (!v.trim()) return 'Please tell us who the table is for.';
          if (v.trim().length < 2) return 'That looks too short to be a name.';
          return '';
        }
      },
      'r-phone': {
        label: 'Phone',
        validate: (v) => {
          const digits = v.replace(/\D/g, '');
          if (!digits) return 'We need a number to confirm the table.';
          if (digits.length < 9) return 'That number looks incomplete — 9 digits or more.';
          return '';
        }
      },
      'r-date': {
        label: 'Date',
        validate: (v) => {
          if (!v) return 'Pick a date for the reservation.';
          const today = new Date(); today.setHours(0, 0, 0, 0);
          if (new Date(v) < today) return 'That date has already passed.';
          return '';
        }
      },
      'r-time': {
        label: 'Time',
        validate: (v) => (v ? '' : 'Choose roughly when you will arrive.')
      },
      'r-guests': {
        label: 'Guests',
        validate: (v) => {
          const n = parseInt(v, 10);
          if (!v || Number.isNaN(n)) return 'How many people are coming?';
          if (n < 1) return 'At least one guest.';
          if (n > 12) return 'For more than 12, call us and we will arrange it.';
          return '';
        }
      }
    };

    function setFieldError(id, message) {
      const el = document.getElementById(id);
      const err = document.getElementById(id + '-err');
      if (!err) return;
      if (message) {
        err.textContent = message;
        err.hidden = false;
        el.setAttribute('aria-invalid', 'true');
        el.classList.add('border-amber-500');
      } else {
        err.textContent = '';
        err.hidden = true;
        el.removeAttribute('aria-invalid');
        el.classList.remove('border-amber-500');
      }
    }

    function check(id) {
      const el = document.getElementById(id);
      const msg = RULES[id].validate(el.value, el);
      setFieldError(id, msg);
      return msg;
    }

    Object.keys(RULES).forEach((id) => {
      const el = document.getElementById(id);
      const evt = el.tagName === 'SELECT' ? 'change' : 'blur';
      el.addEventListener(evt, () => check(id));
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true') check(id);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const failures = [];
      Object.keys(RULES).forEach((id) => {
        const msg = check(id);
        if (msg) failures.push({ id, label: RULES[id].label, msg });
      });

      if (failures.length) {
        success.hidden = true;
        summaryList.innerHTML = '';
        failures.forEach((f) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = '#' + f.id;
          a.className = 'underline decoration-2 underline-offset-4';
          a.textContent = f.label + ': ' + f.msg;
          a.addEventListener('click', (ev) => {
            ev.preventDefault();
            document.getElementById(f.id).focus();
          });
          li.appendChild(a);
          summaryList.appendChild(li);
        });
        summary.hidden = false;
        summary.focus();
        return;
      }

      summary.hidden = true;
      submitBtn.disabled = true;
      spinner.hidden = false;
      submitLabel.textContent = 'Sending…';

      // NOTE: there is no backend. Replace this timeout with a real
      // fetch() to your reservation endpoint before going live.
      window.setTimeout(() => {
        spinner.hidden = true;
        submitBtn.disabled = false;
        submitLabel.textContent = 'Request the table';
        success.hidden = false;
        form.reset();
        Object.keys(RULES).forEach((id) => setFieldError(id, ''));
      }, 900);
    });
  }
})();
