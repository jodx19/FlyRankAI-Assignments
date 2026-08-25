# 📂 FL-05: Explain It Like You Built It

**Track:** FlyRank General AI Fluency (Week 6)
**Developer:** Mahmoud Mostafa El Safi
**Component Explained:** Automated CI/CD Deployment Flow (GitHub to Vercel Integration)

---

## 🎯 1. Overview & Selected Component

The component selected for this deep-dive is the **Automated Continuous Integration & Continuous Deployment (CI/CD) Pipeline** powering the live portfolio, specifically connecting GitHub repository pushes to automated Vercel preview/production deployments.

---

## 💡 2. Plain-Words Explanation (How It Actually Works)

Think of deploying this site like an automated publishing press:

1. **Local Changes:** I make updates to the portfolio locally (code, styles, assets) and commit them to Git.
2. **The Signal:** When I run `git push origin main`, GitHub receives the new commits and fires an instant webhook notification to Vercel saying: _"New changes are available on the main branch."_
3. **The Automated Build:** Vercel immediately spins up an isolated build container, downloads the latest source code, and executes the build script (`npm run build` / `ng build`).
4. **Validation & Atomic Swap:** It compiles TypeScript, optimizes Tailwind CSS classes, and generates production-ready static assets. Once the build finishes successfully with zero errors, Vercel routes global traffic to the newly compiled bundle with zero downtime.
5. **Why Local Edits Don't Affect Live:** If code changes are made only on the local machine without pushing, the live site remains completely untouched because GitHub never triggers the webhook event.

---

## 🏗️ 3. Execution Pipeline Architecture
