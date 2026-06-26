# Claude Design Handoff

This directory stores the Claude Design export used as the visual reference for the launch frontend redesign.

## Primary Design

Read this file before implementing the homepage redesign:

- `docs/claude-design/project/ICONS 첫 페이지 (최애 중심).dc.html`

The committed `.dc.html` file is kept for source inspection. The local export can also include generated runtime and bitmap files such as `support.js`, `.thumbnail`, and `assets/`; those are intentionally excluded from normal Git history because the homepage implementation must use current catalog image sources rather than copied Claude Design assets.

## Implementation Contract

Use `docs/frontend-home-redesign-plan.md` as the execution contract. The Claude Design HTML is a UX direction and visual-language reference, not a pixel-perfect or code-copy target.

Implementation must preserve the current Next.js app shell and backend data contract:

- Keep `app/page.tsx` based on `getCatalogSnapshot()`.
- Derive homepage display data from `CatalogSnapshot`.
- Keep global `Nav`, `SiteFooter`, and `MobNav`.
- Do not copy hardcoded Claude Design data into production rendering.
- Do not use Claude Design static assets as production catalog images.
- Do not implement payment, gacha, ticketing, or social-login backend work in the first homepage PR.

If visual replay of the original prototype is needed, use the local Claude Design export or a separate artifact store rather than committing bitmap assets to this repository.

If the prototype README or generated runtime comments conflict with this file or `docs/frontend-home-redesign-plan.md`, follow the repo plan.
