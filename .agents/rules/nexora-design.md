# Nexora design rules
- Stack: TanStack Start, React 19, TypeScript strict, Tailwind 4, shadcn, motion. No new packages.
- Define all colors and styles in src/styles.css. Use the existing Button primitive. Replaceable content lives in src/data.
- Brand: navy #001B3D, royal #2F52BA, primary #5454C0, violet #8460CC, magenta #C94BD0, glow #84A9F3, orange #FF8A1F (tiny accents only).
- Gradient: linear-gradient(135deg, #2F52BA, #8460CC, #C94BD0). Use it wherever a solid purple would go.
- Fonts: Orbitron (small caps labels), Outfit (headings), Inter (body).
- Tagline: "From Ideas To Innovation", with "Innovation" in gradient text.
- Services: Embedded & IoT Systems, VLSI Projects & Course, Software Projects, Academic Solutions.
- Logos: /images/nexora-logo-full.png and /images/nexora-logo-mark.png. Images are in /images (webp), with width, height and alt; lazy-load everything except hero images.
- Light and dark mode must both work. Use semantic tokens (bg-background, text-foreground, bg-card, border); never hardcode white or black.
- Mobile-first: test at 375, 768 and 1280 px widths. Keep contrast accessible.
- Do not touch .env, supabase/, or git history.

