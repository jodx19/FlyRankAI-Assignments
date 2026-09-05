# 📂 FL-09: Break Your Own Site (Hardening & Edge Cases)

**Track:** FlyRank General AI Fluency (Week 7)
**Developer:** Mahmoud Mostafa El Safi
**Objective:** Stress-test edge cases, verify SEO/OpenGraph metadata, and document resolved vulnerabilities versus known architecture limitations.

---

## 💥 1. Edge Case Stress Testing ("Where It Breaks")

| Test Case Scenario | Input / Action Triggered | System Behavior Observed | Classification | Resolution / Status |
| :--- | :--- | :--- | :--- | :--- |
| **Empty Form Submission** | Clicked submit on untouched form | Reactive form blocked submission; disabled state engaged | Edge Handled | Validated client-side |
| **Garbage / Malformed Data** | Input `test@@@` in email, 10,000 chars in message | .NET 9 API returned `400 Bad Request`; frontend displayed error | **Fix-Now** | Added input length cap (`maxlength="1000"`) |
| **Double Rapid Click** | Double-clicked submit button within 100ms | Sent concurrent HTTP POST requests | **Fix-Now** | Added debounce state (`isSubmitting`) preventing re-clicks |
| **Offline / Network Drop** | Disconnected Wi-Fi right before clicking submit | Request timed out with uncaught console error | **Fix-Now** | Added explicit catch block displaying "Network offline" alert |
| **Free-Tier Cold Start** | Initial request to backend API after 15m inactivity | 15–20s initial latency on cold instances | **Known Limitation** | Documented free-tier spinning delay; user receives spinner |
| **Unsupported Attachments** | Attempted to drop image files into text fields | Browser ignored drop; field accepted plain text only | **Known Limitation** | File uploads intentionally excluded from scope |

---

## 🌐 2. Findability, SEO & Meta Tags Audit

Added OpenGraph and search engine indexing metadata inside `index.html` / `layout.tsx`:

* **Title:** `Mahmoud El Safi | Full-Stack .NET & Angular Healthtech Engineer`
* **Meta Description:** `Bridging dental medicine and scalable software engineering. Specializing in ASP.NET Core, Angular, and clinical workflow platforms.`
* **OpenGraph Tags:** Configured `og:title`, `og:description`, `og:image`, and `og:type="website"` for social link previews.
* **Performance / Speed Check:** Ran PageSpeed / Lighthouse audit; scored 95+ on Performance and 100 on Best Practices via static asset compression and font preloading.

---

## 🛡️ 3. Triage Summary

* **Fix-Nows Addressed:**
  1. Frontend submission debouncing prevents double HTTP dispatches.
  2. Input character truncation on message body prevents payload memory spikes.
  3. Graceful offline/network failure UI toast replaces unhandled console rejections.
* **Known Limitations Accepted:**
  1. Free-tier backend compute introduces cold-start latency on initial daily requests.
  2. The contact form does not support file attachments by architectural design.
