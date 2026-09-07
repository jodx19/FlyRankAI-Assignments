# 📂 FL-10: Plant Your Flag (Domain + Badge)

**Track:** FlyRank General AI Fluency (Week 7)
**Developer:** Mahmoud Mostafa El Safi
**Objective:** Finalize domain deployment with active HTTPS, verify social share cards (OpenGraph), and integrate the FlyRank Graduate Badge in the portfolio footer.

---

## 🌐 1. Live Domain & SSL Configuration

* **Live URL:** `https://YOUR_PORTFOLIO_URL.vercel.app` (or custom domain)
* **Protocol:** HTTPS enforced with valid TLS certificate.
* **DNS / Routing:** Managed via Vercel Edge Network with automatic redirect from HTTP to HTTPS.

---

## 🖼️ 2. Social Share Preview (OpenGraph Verification)

Configured inside HTML `<head>`:

```html
<meta property="og:title" content="Mahmoud El Safi | Full-Stack .NET & Angular Healthtech Engineer" />
<meta property="og:description" content="Bridging dental medicine and scalable software systems (.NET 9, Angular 19)." />
<meta property="og:image" content="https://YOUR_PORTFOLIO_URL.vercel.app/og-preview.png" />
<meta property="og:url" content="https://YOUR_PORTFOLIO_URL.vercel.app" />
<meta name="twitter:card" content="summary_large_image" />


🏅 3. FlyRank Graduate Badge Integration
Added to the application footer (footer.component.html):

HTML
<div class="flex items-center gap-2 pt-4 text-xs text-slate-400 border-t border-slate-800">
  <span>Certified Track:</span>
  <a href="[https://flyrank.ai/verify](https://flyrank.ai/verify)" target="_blank" rel="noopener noreferrer" class="hover:underline flex items-center gap-1 text-teal-400">
    <img src="/badges/flyrank-badge.svg" alt="FlyRank Graduate Badge" class="h-5 w-auto" />
    <span>FlyRank AI Fluency Fellow</span>
  </a>
</div>
✅ 4. Verification Checklist
[x] Live domain resolves over valid HTTPS without SSL warnings.

[x] OpenGraph meta tags verified via social preview debugger.

[x] FlyRank graduate badge visible in footer and links to the verification page.

[x] All case studies and interactive features fully accessible on the live domain.
