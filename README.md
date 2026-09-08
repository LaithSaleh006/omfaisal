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
index.html                     # الصفحة كاملة / the page markup
assets/
  css/site.css                 # التنسيقات الجاهزة (Tailwind مُجمَّع مسبقًا)
  js/site.js                   # القائمة، السلايدر، تحقّق النموذج
  img/
    hero-clinic.svg            # رسم القسم الرئيسي — استبدله بصورة العيادة
    doctor-1.svg … doctor-4.svg  # صور الأطباء المؤقتة
    favicon.svg                # أيقونة التبويب
src/input.css                  # مصدر Tailwind + متغيّرات التصميم
package.json                   # أوامر البناء (للتعديل فقط)
design-system/dental-clinic/
  MASTER.md                    # نظام التصميم + سبب كل قرار
```

### استبدال الصور / Replacing the images

كل صورة ملف مستقل في `assets/img/`. لتضع صورة حقيقية، استبدل الملف
واحفظ نفس الاسم — أو غيّر `src` في `index.html`. **المهم:** حدِّث
`width` و `height` لتطابق أبعاد صورتك الحقيقية، وإلا سيقفز التصميم
أثناء التحميل.

```html
<!-- قبل -->
<img src="assets/img/doctor-1.svg" width="100" height="100" alt="...">
<!-- بعد -->
<img src="assets/img/doctor-1.jpg" width="800" height="800" alt="د. سامي الحديد">
```

الأيقونات الصغيرة (الهاتف، التقويم، النجوم…) تبقى داخل `index.html`
عن قصد: هي ترث لون النص تلقائيًا، ولو صارت ملفات منفصلة لفقدت ذلك
وأضافت طلبات تحميل بلا فائدة.

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
4. Swap the placeholder SVGs in `assets/img/` for real photos, updating each
   `width`/`height` to the real dimensions so nothing shifts on load.
5. Paste a Google Maps `<iframe>` into the map placeholder.
6. Add an OG share image (`og:image`).

See `design-system/dental-clinic/MASTER.md` for the palette, type scale,
and the reasoning behind each design decision.

## الترخيص / License

Placeholder content; no license asserted.
