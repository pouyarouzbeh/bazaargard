# Frontend experience checklist

Use only the sections relevant to the changed surface.

## Theme and visual system

- System, light, and dark modes have complete tokens, correct browser color scheme, no first-paint flash, AA interactive contrast, and intentional product imagery.
- Feature code uses ten core semantic families plus documented derived roles; raw palette values remain inside theme or approved chart definitions.
- Typography, spacing, density, radii, depth, and primary-action hierarchy feel deliberate rather than template-like or trend-stacked.
- Light mode is neutral-first and white or nearly white; most surfaces are neutral, primary has a limited action/selection role, and accent is rare and meaningful.
- The composition avoids generic AI-template cues: gradient halos, repeated glass cards, colorful icon tiles, ornamental pills, inflated radii, oversized generic copy, and hover lift on every control.
- Apple-inspired craft appears through alignment, typography, hierarchy, immediate feedback, and purposeful material layering rather than copied trade dress.

## Craft and ease of use

- Apply the [component craft contract](../../../../agents/shared/design-system.md#component-craft-contract) to the affected families, including portal and composed-trigger variants. Check optical alignment, density, clear state distinctions, and stable geometry.
- The main task is understandable from labels and facts; optional complexity is disclosed without losing input. Search, detail, back navigation, and recovery preserve useful context.
- Each animation has a feedback or continuity purpose, is short and interruptible, and does not replay on routine refetch or delay user action. Reduced motion keeps the state clear.
- Evidence distinguishes source-level implementation, rendered appearance, and observed usability. Respect requested testing limits; do not infer perceived premium quality from passing automated checks.

## Direction and localization

- `lang` and `dir` come from the active profile; shared components and portals do not hardcode direction.
- Layout uses logical properties. Directional icons, transitions, sidebars, charts, and progress remain meaningful in RTL and LTR.
- Human-facing numbers use Persian digits under `fa-IR`; exact identifiers and editable machine values remain copy-safe and bidi-isolated.
- Jalali selection stays separate from Gregorian explicit-zone API serialization.

## Loading and feedback

- Initial empty surfaces use geometry-matching Skeleton without layout shift.
- Short actions use local Spinner while retaining label/width; measurable work uses truthful Progress.
- Background refresh keeps usable facts visible. Empty, stale, offline, unauthorized, error, uncertain, and success states remain distinct.
- Motion uses CSS opacity/transform, follows shared durations, and has a reduced-motion path.

## Interaction and accessibility

- Keyboard order, visible focus, focus restoration, labels, live regions, touch targets, zoom, and screen-reader status are complete.
- The surface has a clear next action, safe defaults, preserved input, contextual recovery, and proportional confirmation.
- Fixed mobile chrome, consent notices, keyboards, safe areas, zoom, and authentication-specific layouts do not obscure the active control or primary action.
- Icons use the owning app’s approved family (Lucide throughout Bazargard), with consistent sizes/optical weights and accessible names for icon-only actions. Shared controls and portals honor the app icon set.

## Performance

- Static Vite output, route splitting, image geometry, font loading, and optional-feature lazy loading remain intact.
- Generated routes pass compressed JS/CSS budgets and dependency audit.
- New runtime code has a concrete first-interaction need; heavy calendars, charts, or editors stay outside unrelated route bundles.
