# 📂 FL-07: Open It on Your Phone

**Track:** FlyRank General AI Fluency (Week 6)  
**Developer:** Mahmoud Mostafa El Safi  
**Objective:** Audit and resolve mobile-first responsiveness, touch targets, and contrast issues directly on a physical mobile device.

---

## 📱 1. Device Audit Specifications

* **Tested Device:** Physical Mobile Device (iOS / Android screen width ~390px) & Tablet viewport (~768px).
* **Live Target:** Public portfolio deployment.

---

## 🛠️ 2. Fix Log (Before vs. After)

| Issue Found on Mobile | Root Cause | Fix Applied | Result |
| :--- | :--- | :--- | :--- |
| **Horizontal Overflow** | Fixed pixel widths on case study containers | Replaced fixed widths with `w-full max-w-md` and Tailwind container utilities | Eliminated accidental horizontal scroll entirely |
| **Untappable CTA Button** | Contact submit button was below 40px height | Added padding `py-3 px-6` ensuring minimum touch target is > 48px | Button is easily tappable with one thumb |
| **Form Input Zoom on iOS** | Font size on text inputs was set to `14px` | Updated inputs to `text-base` (16px) | Prevents automatic mobile Safari viewport zoom upon focusing |
| **Low Contrast Body Text** | Muted text used `#64748B` on dark surface | Updated text token to `#94A3B8` (Slate 400) | Meets WCAG AA contrast ratio standards |
| **Navigation Tap Area** | Nav links were spaced too tightly | Added vertical tap padding and mobile hamburger drawer | Clean touch navigation without misclicks |

---

## 🔍 3. Verification Checklist

* [x] Verified on a physical mobile screen (no horizontal overflow).
* [x] All external links (GitHub repo, live demos) tested and functional.
* [x] Text readable without zooming; contrast ratio compliant.
* [x] Form fields and submit button fully responsive and validated on mobile keyboard pop-up.
