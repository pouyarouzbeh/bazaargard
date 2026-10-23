---
name: verify-static-frontend
description: Select proportionate checks and verify Bazargard Vite static output, repository agent/skill links, focused behavior tests and compressed bundle budgets before handoff.
---

# Verify Vite Frontend

Read the task diff and [validation matrix](references/validation-matrix.md). Preserve unrelated changes.

Run `npm --prefix frontend run check:agent-docs` for instructions or skill changes. Use `npm --prefix frontend test` for presentation model and state invariants. For build/global UI/config changes run `npm --prefix frontend run build` and `npm --prefix frontend run check:budgets`. The combined `npm --prefix frontend run check` includes these checks; do not repeat them without new changes or evidence.

Check representative local browser journeys for visual/interaction work, covering mobile/desktop, keyboard, error recovery and light/dark when changed. Preserve recorded baseline backend failures and only run focused backend checks when needed.

Confirm `frontend/dist/index.html`, lazy optional chunks and absence of private data. There are no Next.js static export commands in Bazargard. Record exact checks and limits in the dated changelog and report source/build/local-run/deployment separately.
