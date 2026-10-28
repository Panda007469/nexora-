# Google Chrome Modern Web Guidance

Apply the following modern web performance, accessibility, and architectural standards across the codebase, based on Google Chrome's Modern Web Guidance:

## 1. Core Web Vitals & Performance

- **Largest Contentful Paint (LCP < 2.5s)**:
  - Optimize and compress hero images (WebP/AVIF formats with explicit `width` and `height` attributes to avoid layout shifts).
  - Preload critical above-the-fold assets.
  - Avoid render-blocking scripts in the critical path.
- **Interaction to Next Paint (INP < 200ms)**:
  - Keep main thread execution short and responsive.
  - Break long JavaScript tasks into smaller asynchronous chunks using `requestAnimationFrame`, `queueMicrotask`, or `scheduler.yield()` where supported.
  - Avoid heavy synchronous operations inside click/input handlers.
- **Cumulative Layout Shift (CLS < 0.1)**:
  - Always reserve space for images, videos, ads, and dynamic embeds using aspect-ratio CSS or explicit dimensions.
  - Use font-display: swap with matched fallback font metrics.
  - Prefer CSS `transform` and `opacity` for animations rather than properties that trigger re-layout (like `top`, `left`, `width`, `height`).

## 2. Accessibility (a11y) & Semantic HTML

- Ensure all interactive elements have accessible names, proper keyboard navigation (`tabindex`, `focus-visible`), and ARIA roles where needed.
- Use semantic HTML tags (`<main>`, `<header>`, `<footer>`, `<nav>`, `<article>`, `<section>`, `<aside>`) instead of nested generic `<div>` elements.
- Maintain high contrast ratios (WCAG 2.1 AA standards: 4.5:1 for normal text, 3:1 for large text).
- Respect user preferences like `prefers-reduced-motion` and `prefers-color-scheme`.

## 3. Modern JavaScript & Modern CSS

- Use standard ES Modules, tree-shaking, and lazy loading (`React.lazy`, dynamic `import()`) for non-critical routes and heavy components.
- Leverage modern CSS capabilities: CSS variables, Container Queries, CSS Grid/Flexbox, `color-mix()`.
- Use Tailwind CSS and utility primitives consistently with design tokens.
