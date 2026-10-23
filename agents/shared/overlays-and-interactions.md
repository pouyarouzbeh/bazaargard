# Overlays and interactions

## Decision order

Choose the first surface that fits:

1. Inline disclosure for small optional content that belongs to the current flow.
2. Popover for a lightweight contextual choice that does not require navigation.
3. Sheet for complementary detail or short work while preserving page context.
4. Dialog for a short blocking decision.
5. AlertDialog for destructive or financially material confirmation.
6. Dedicated route for long, multi-step, deep-linkable, or refresh-sensitive work.

## Sheet-first policy

Use a Sheet for filters, product/store details and short complementary workflows, preserving context. Place it with logical inline-end properties. On narrow screens use a bottom or near-full-screen presentation when it preserves usable space and keyboard behavior.

A Sheet must have a title, optional description, predictable close action, focus containment, trigger-focus restoration, and an unsaved-change guard when data can be lost.

## Dialog limits

Use Dialog when the user must answer before continuing and the content is short. A Dialog form should normally contain no more than three simple fields. Move long explanations, scrolling datasets, multi-section forms, and workflows with their own history to a Sheet or route.

## Destructive confirmation

Use AlertDialog when an action deletes, cancels, voids, refunds, changes credit, changes stock, or creates another material irreversible effect. State the object and consequence explicitly. Do not rely on a generic “Are you sure?” message.

## Rules

- Use the project's shared Dialog/AlertDialog components for in-app modal messages and decisions. Do not call browser `alert`, `confirm`, or `prompt`. Keep existing-overlay feedback inside that surface to avoid nested overlays. Browser-controlled `beforeunload` protection remains necessary for tab close, reload and full-document navigation; web applications cannot replace that browser prompt with a custom modal.
- Never nest overlays. Close or complete the current surface before opening another.
- Do not use Toast for decisions, validation, or error details the user must act on.
- Do not dismiss a pending or uncertain financial mutation as if it failed safely.
- Support Escape unless dismissal would corrupt an in-progress critical transition.
- Inherit portal direction from the document and use logical placement/animation. Pass an explicit direction only for a verified primitive limitation; never hardcode RTL in reusable overlay source.
- Ensure browser Back remains meaningful; use a route when users reasonably expect history or deep links.
