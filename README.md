# ORBIT — Cinematic About Page

An original interactive About-page experience built from scratch with React, TypeScript, Vite, Three.js, GSAP, and Lenis. It uses a single persistent WebGL canvas synchronized with DOM sections and does not embed or depend on the reference recording.

## Run locally

```bash
npm install
npm run dev
```

## Design notes

- `src/main.tsx` contains the scene manager, persistent renderer, procedural connector geometry, shader-driven particles, Lenis loop, DOM sections, and interaction layers.
- All visual assets are procedural; no proprietary reference assets are included.
- The canvas adapts to viewport size and device pixel ratio and respects `prefers-reduced-motion`.
- The visual direction uses the original ORBIT brand, content, people, and project placeholders.
