# موقع عيادة بريق لطب الأسنان — Bariq Dental Clinic Website

موقع تعريفي لعيادة أسنان، بالعربية وباتجاه من اليمين إلى اليسار (RTL)،
مبني بـ HTML ثابت و Tailwind CSS.

An Arabic-first (RTL) dental clinic website built with static HTML and a
**pre-compiled** Tailwind CSS v4 stylesheet — no runtime CSS-in-JS, no
build step required just to view it.

## التشغيل / Running it

The site is static. Open `index.html` in a browser, or serve it:

```bash
npm run serve        # http://localhost:8080
```

## تعديل التنسيقات / Editing styles

Styles are compiled from `src/input.css` into `assets/css/site.css`. If you
change any Tailwind classes in `index.html`, rebuild:

```bash
npm install          # once
npm run build        # one-off, minified
npm run dev          # rebuild on save
```

> `assets/css/site.css` is committed on purpose, so the site works when
> cloned without installing anything. Rebuild it after editing classes.

## البنية / Structure

```
index.html                          # the whole page
src/input.css                       # Tailwind entry + design tokens
assets/css/site.css                 # compiled output (committed)
assets/js/site.js                   # menu, carousel, form validation
assets/img/favicon.svg
design-system/dental-clinic/
  MASTER.md                         # design system + verified deviations
```

## الأقسام / Sections

Header · Hero · لماذا بريق (why us) · خدماتنا (services) ·
فريق الأطباء (doctors) · آراء المرضى (testimonials) ·
الأسئلة الشائعة (FAQ) · احجز موعدك (booking) · معلومات التواصل (contact) · Footer

## الوصولية / Accessibility

Built against WCAG 2.2 AA and verified in Chromium:

- `<html lang="ar" dir="rtl">` with CSS logical properties throughout, so
  the layout mirrors correctly rather than being flipped by hand
- Every foreground/background pair measured — body text 8.76:1, muted text
  7.28:1, buttons 5.36:1 and 5.48:1, focus ring 7.27:1
- Skip link as the first tab stop; visible 3px focus ring on everything
- Testimonial carousel: prev/next, a pause toggle, stops on hover and on
  focus, never auto-rotates under `prefers-reduced-motion`, position
  announced via `role="status"`, and every slide reachable without dragging
- Booking form: visible labels (never placeholder-only), required markers,
  errors below each field wired with `aria-describedby` + `aria-invalid`,
  validation on blur, and a focusable error summary after a failed submit
- Pointer targets ≥24×24 CSS px (WCAG 2.2), interactive controls ≥44px
- One `<h1>`, no heading-level skips, no emoji used as icons
- No horizontal scroll at 375 / 768 / 1024 / 1440px

## قبل النشر / Before going live

This is a complete front end with **placeholder content**. Replace:

1. **The booking form has no backend.** `assets/js/site.js` fakes submission
   with a `setTimeout` — wire it to a real endpoint or form service.
2. Clinic name, doctor names and credentials, service prices (currently in
   JOD), address, phone, and email — in `index.html` **and** in the
   `Dentist` JSON-LD block in `<head>`.
3. `<link rel="canonical">` and the Open Graph URL.
4. Swap the inline SVG placeholders for real photos. Space is reserved with
   `aspect-ratio`, so set `width`/`height` and there will be no layout shift.
5. Paste a Google Maps `<iframe>` into the map placeholder.
6. Add an OG share image (`og:image`).

See `design-system/dental-clinic/MASTER.md` for the palette, type scale,
and the reasoning behind each design decision.

## الترخيص / License

Placeholder content; no license asserted.
