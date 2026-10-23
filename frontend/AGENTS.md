# Frontend ownership

Apply the root contract. The active app is React/Vite JavaScript, not Peony's Next.js/TypeScript app. Keep optional comparison, maps, research and Ops lazy-loaded. No framework migration is implied.

`src/main.jsx` owns session composition and existing orchestration; dedicated journey components own presentation. `src/ui.jsx` owns shared accessible overlays. Theme values belong in `src/theme.css`; application layout and controls in `src/style.css`; scoped journey composition belongs beside its component. Use pure `.mjs` presentation models for meaningful Node behavior tests. Native React state remains the current state owner; preserve request sequence guards and server authority.

Run `npm test`, `npm run build`, `npm run check:agent-docs` and `npm run check:budgets` for this rebuild. Browser-check home, search, filter correction, sellers, comparison, map and plan at representative desktop/mobile widths. Report missing LLM credentials and unavailable external map/media services honestly.
