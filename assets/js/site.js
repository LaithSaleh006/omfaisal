/* ============================================================
   عيادة بريق — site behaviour
   Progressive enhancement: every section is readable and the form
   is submittable-looking without JS. JS only adds the menu toggle,
   carousel rotation, and accessible client-side validation.
   ============================================================ */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  function setMenu(open) {
    menu.hidden = !open;
    menu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    iconOpen.hidden = open;
    iconClose.hidden = !open;
    menuBtn.querySelector('.sr-only').textContent = open ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل';
  }

  if (menuBtn && menu) {
    setMenu(false);
    menuBtn.addEventListener('click', () => {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    // Escape closes and returns focus to the toggle (a11y: escape-routes)
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); }
    });
    // Close after picking a destination
    menu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => setMenu(false))
    );
  }

  /* ---------- Testimonials carousel ----------
     Obligations from the skill's pattern + auto-rotation-controls:
     prev/next, a pause toggle, rotation stopped on hover and on focus,
     never auto-rotating under reduced-motion, and slide position
     announced as a complete phrase without moving focus. */
  const carousel = document.getElementById('carousel');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.c-slide'));
    const dotsWrap = document.getElementById('c-dots');
    const status = document.getElementById('c-status');
    const pauseBtn = document.getElementById('c-pause');
    const pauseLabel = document.getElementById('c-pause-label');
    const iconPause = document.getElementById('c-icon-pause');
    const iconPlay = document.getElementById('c-icon-play');
    const AR = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const total = slides.length;

    let index = 0;
    let timer = null;
    let userPaused = false;

    // Build dots — direct access to every slide, no dragging needed
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      // 24x24 hit area (WCAG 2.2 target-size) around a 12px visual dot
      dot.className = 'grid size-6 place-items-center rounded-pill';
      dot.innerHTML =
        '<span class="c-dot size-3 rounded-pill border-2 border-brand-700 transition-colors"></span>' +
        '<span class="sr-only">اذهب إلى الرأي ' + (AR[i] || i + 1) + '</span>';
      dot.addEventListener('click', () => { show(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function show(i) {
      index = (i + total) % total;
      slides.forEach((s, n) => { s.hidden = n !== index; });
      dots.forEach((d, n) => {
        const current = n === index;
        d.querySelector('.c-dot').classList.toggle('bg-brand-700', current);
        d.setAttribute('aria-current', current ? 'true' : 'false');
      });
      // A complete contextual phrase, per contextual-live-badge-updates
      status.textContent = 'الرأي ' + (AR[index] || index + 1) + ' من ' + (AR[total - 1] || total);
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      // Never auto-rotate when the user asked for reduced motion
      if (userPaused || prefersReducedMotion.matches || total < 2) return;
      stop();
      timer = setInterval(() => show(index + 1), 7000);
    }
    function restart() { stop(); start(); }

    function setPaused(paused) {
      userPaused = paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseLabel.textContent = paused ? 'تشغيل التبديل التلقائي' : 'إيقاف التبديل التلقائي';
      iconPause.hidden = paused;
      iconPlay.hidden = !paused;
      paused ? stop() : start();
    }

    document.getElementById('c-prev').addEventListener('click', () => { show(index - 1); restart(); });
    document.getElementById('c-next').addEventListener('click', () => { show(index + 1); restart(); });
    pauseBtn.addEventListener('click', () => setPaused(pauseBtn.getAttribute('aria-pressed') !== 'true'));

    // Stop on hover and on focus; resume only if the user hasn't paused
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', (e) => {
      if (!carousel.contains(e.relatedTarget)) start();
    });

    // Arrow keys, mirrored for RTL
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { show(index + 1); restart(); }
      else if (e.key === 'ArrowRight') { show(index - 1); restart(); }
    });

    // React if the motion preference changes mid-session
    prefersReducedMotion.addEventListener('change', () => {
      prefersReducedMotion.matches ? stop() : start();
    });

    show(0);
    start();
  }

  /* ---------- Booking form validation ----------
     Validates on blur (not on every keystroke), puts each message
     below its field and wires it with aria-invalid, and on a failed
     submit focuses a summary that links to each invalid field. */
  const form = document.getElementById('booking-form');
  if (form) {
    const summary = document.getElementById('form-errors');
    const summaryList = document.getElementById('form-errors-list');
    const success = document.getElementById('form-success');
    const submitBtn = document.getElementById('f-submit');
    const submitLabel = document.getElementById('f-submit-label');
    const spinner = document.getElementById('f-spinner');

    const RULES = {
      'f-name': {
        label: 'الاسم الكامل',
        validate: (v) => {
          if (!v.trim()) return 'الرجاء إدخال الاسم الكامل.';
          if (v.trim().length < 3) return 'الاسم قصير جدًا — أدخل ٣ أحرف على الأقل.';
          return '';
        }
      },
      'f-phone': {
        label: 'رقم الهاتف',
        validate: (v) => {
          const digits = v.replace(/[^\d]/g, '');
          if (!digits) return 'الرجاء إدخال رقم الهاتف.';
          if (digits.length < 9) return 'رقم الهاتف غير مكتمل — أدخل ٩ أرقام على الأقل.';
          return '';
        }
      },
      'f-email': {
        label: 'البريد الإلكتروني',
        validate: (v) => {
          if (!v.trim()) return ''; // optional
          return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
            ? '' : 'صيغة البريد الإلكتروني غير صحيحة — مثال: name@example.com';
        }
      },
      'f-service': {
        label: 'الخدمة المطلوبة',
        validate: (v) => (v ? '' : 'الرجاء اختيار الخدمة المطلوبة.')
      },
      'f-date': {
        label: 'التاريخ المفضّل',
        validate: (v) => {
          if (!v) return ''; // optional
          const today = new Date(); today.setHours(0, 0, 0, 0);
          return new Date(v) < today ? 'لا يمكن اختيار تاريخ في الماضي.' : '';
        }
      },
      'f-consent': {
        label: 'الموافقة على التواصل',
        validate: (_v, el) => (el.checked ? '' : 'يجب الموافقة على التواصل لتأكيد الموعد.')
      }
    };

    function fieldError(id, message) {
      const el = document.getElementById(id);
      const err = document.getElementById(id + '-err');
      if (!err) return;
      if (message) {
        err.textContent = message;
        err.hidden = false;
        err.classList.remove('hidden');
        el.setAttribute('aria-invalid', 'true');
        el.classList.add('border-danger');
      } else {
        err.textContent = '';
        err.hidden = true;
        err.classList.add('hidden');
        el.removeAttribute('aria-invalid');
        el.classList.remove('border-danger');
      }
    }

    function check(id) {
      const el = document.getElementById(id);
      const msg = RULES[id].validate(el.value, el);
      fieldError(id, msg);
      return msg;
    }

    // Validate on blur; clear a shown error as soon as the user fixes it
    Object.keys(RULES).forEach((id) => {
      const el = document.getElementById(id);
      const evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'blur';
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
        success.classList.add('hidden');
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
        summary.classList.remove('hidden');
        summary.focus(); // focus the summary, per focus-management
        return;
      }

      // Passed. Show the loading state, then confirm.
      summary.hidden = true;
      summary.classList.add('hidden');
      submitBtn.disabled = true;
      spinner.hidden = false;
      submitLabel.textContent = 'جارٍ الإرسال…';

      // NOTE: no backend is wired up. Replace this timeout with a real
      // fetch() to your booking endpoint or form service.
      window.setTimeout(() => {
        spinner.hidden = true;
        submitBtn.disabled = false;
        submitLabel.textContent = 'أرسل طلب الموعد';
        success.hidden = false;
        success.classList.remove('hidden');
        form.reset();
        Object.keys(RULES).forEach((id) => fieldError(id, ''));
      }, 900);
    });
  }

  /* ---------- Close the mobile menu on in-page navigation ---------- */
  document.querySelectorAll('.js-nav').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu && menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  });
})();
