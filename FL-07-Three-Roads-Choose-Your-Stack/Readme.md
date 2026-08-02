# Assignment: Three Roads — Choose Your Stack with AI

**Track:** General AI Fluency
**Phase:** Build (Week 4)
**Developer:** Mahmoud Mostafa El Safi

---

## 🛑 1. Real Constraints Provided to AI

1. **Budget:** $0 (Strictly Free Tier Hosting & Tools).
2. **Skill Level:** Full-Stack Developer specializing in C#, .NET, EF Core, SQL Server, and Angular.
3. **Site Needs:** Showcases architecture case studies (MediatR pipelines, usage quotas, HIS system), code blocks, interactive schema diagrams, and live demo links.
4. **Backend Necessity:** **Not yet.** Dynamic data and database connections are unnecessary for a portfolio surface; static SSG with client-side interactivity is faster, safer, and cheaper.

---

## 🛣️ 2. The Three Stack Options Analyzed

| Metric / Feature    | Option 1: Simplest (HTML / Vanilla JS / GitHub Pages)           | Option 2: Balanced / Chosen (Angular + Tailwind / Vercel)  | Option 3: Most Powerful (Full-Stack Next.js + Supabase / Vercel) |
| :------------------ | :-------------------------------------------------------------- | :--------------------------------------------------------- | :--------------------------------------------------------------- |
| **Build Mechanism** | Raw Static HTML/CSS                                             | Modern Single Page App (Angular) / Static Export           | Full-stack Server-Side Rendering (SSR)                           |
| **Hosting (Free)**  | GitHub Pages                                                    | Vercel / Netlify                                           | Vercel + Supabase Free Tier                                      |
| **Developer Speed** | High initially, low for repeated components                     | **Very High** (Aligned with my existing Angular setup)     | Moderate (Requires learning Next.js routing patterns)            |
| **Maintenance**     | Messy for code blocks & routing                                 | **Clean, Modular, Component-driven**                       | High overhead for simple portfolio surface                       |
| **Real Trade-off**  | Hard to maintain clean syntax highlighting & dynamic components | Pure client-side rendering (handled cleanly by Vercel CDN) | Over-engineered for a static engineering showcase                |

---

## ⚡ 3. Pressure-Testing the Options

- **What breaks if I pick Option 1 (Simplest - Raw HTML)?**
  Maintaining code blocks, component reusability, and navigation across multiple case study pages becomes tedious and prone to duplication bugs.

- **What do I maintain/suffer if I pick Option 3 (Most Powerful - Next.js + DB)?**
  I introduce unnecessary server maintenance, API rate limits on free tiers, and database connection overhead—all for data that rarely changes. It slows down delivery without adding engineering proof.

- **Can Option 2 (Angular / Modern SPA on Vercel) be finished in 2 weeks?**
  **Yes, absolutely.** I already use Angular fluently, so implementation will focus 100% on UI layout, syntax highlighting for C# snippets, and embedding clean architecture diagrams rather than fighting framework syntax.

---

## 💡 4. Decision & Rationale (In My Own Words)

### **Chosen Stack:** Option 2 — Angular + Tailwind CSS deployed on Vercel

> **Why this stack?**
> "As a .NET and Angular developer, choosing Option 2 allows me to leverage my active daily tech stack without taking on unnecessary infrastructure bloat. It provides component modularity for technical case studies, clean Markdown/code highlighting integration, and seamless deployment on Vercel's global CDN."

### **Can I maintain this?**

> "Yes. The build pipeline is fully automated via GitHub commits, requiring zero server maintenance or paid subscriptions."

### **Does it show my work well?**

> "Extremely well. It gives a crisp, modern developer aesthetic for reading complex architecture documentation, inspecting C# code snippets, and navigating backend system flows without sluggish server load times."

### **Backend Question Answered:**

> _"Do I need a custom backend for my portfolio right now?"_
> **No.** My backend skills are proven through dedicated GitHub repositories, Postman collections, live API endpoints, and detailed architecture case studies—not by running an over-complicated database backend for a personal landing page.
