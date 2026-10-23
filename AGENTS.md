# Bazargard engineering contract

Bazargard is a Persian RTL assistant for in-person shopping in Tehran. Read [workflow](agents/agent-workflow.md) and the nearest AGENTS.md before editing. The UX source is [the complete blueprint](torob-shopping-assistant-ux-guide.md); implementation coverage and source provenance live in [the adaptation record](docs/UX_REBUILD.md).

## Ownership and facts

- Keep React 19/Vite in `frontend` and FastAPI/SQLite in `backend`. The backend serves `frontend/dist`; preserve the current deployment. Peony's Next.js, Laravel, two-app monorepo and footwear rules do not apply here.
- Preserve API contracts, cookie ownership checks, guard behavior and existing comparison/map/plan/seller workflows. Read [architecture](agents/shared/architecture.md) for ownership and [data and state](agents/shared/data-and-state.md) for requests.
- Products, shops and offers are different entities. Only actual offers prove a product/shop relation. Label counts limited to retrieved results. Never invent price, stock, seller identity, hours, specs, route quality or model availability.
- Prices are recorded toman, not live guarantees. Dataset phone numbers are synthetic; do not display them as real contact channels. Unknown hours/payment support are unknown, not closed/unsupported.
- Secrets, datasets and runtime state remain ignored; no credentials, chat contents or catalogue dump enter a frontend bundle.

## Experience contract

Do not use star or sparkle icons, including decorative assistant marks or rating stars. Show ratings numerically. Place an icon beside its title or label; do not stack decorative icons above headings or navigation labels.

Read [design system](agents/shared/design-system.md), [component owners](agents/shared/component-policy.md), [accessibility](agents/shared/accessibility-localization.md) and [overlays](agents/shared/overlays-and-interactions.md) for UI work. Neutral surfaces, sparse primary color, consistent typography, one main action, semantic tokens, complete light/dark states, visible focus, logical RTL CSS, 44px touch targets, Persian digits and reduced motion are required. Edit the existing style owner; remove obsolete rules instead of stacking global overrides.

Keep the journey non-linear: discover, explore, compare, prepare to go. Preserve draft input on failures, previous results during refresh, selection across list/map navigation and session ownership. Show honest loading, empty, offline, error/retry and uncertain states. Optional complexity belongs in a disclosure or sheet, not on every card. Do not add an unsupported microphone, real phone call or guaranteed reservation.

## Skill routing

Repository skills live in `.agents/skills` and can be read directly:

- `$build-shopping-feature`: customer journey, discovery, product/store cards, filters, comparison and trip planning.
- `$build-ops-feature`: the separate operations workspace only.
- `$sync-openapi-client`: verify a new or changed HTTP operation against `backend/server.py` and `/api/openapi.json`.
- `$audit-frontend-experience`: review visual consistency, state coverage, mobile, keyboard and trust.
- `$verify-static-frontend`: select checks from its [matrix](.agents/skills/verify-static-frontend/references/validation-matrix.md) before handoff.

Do not migrate frameworks, add a second router/state store/icon family or install production dependencies for decoration. Use the existing Lucide, Vazirmatn and browser APIs. New dependencies need a concrete requirement and bundle review.

## Work records and verification

Preserve unrelated working-tree edits. Each editing task maintains one dated entry and index in [changelogs](docs/changelogs/README.md), with actual changes, checks and limits. Source edits, build, local execution and external deployment are separate outcomes. Never claim human usability research, real-device testing or model-backed validation without evidence. Existing PDF/Ops Windows failures are recorded in [local setup](docs/LOCAL_WINDOWS.fa.md).
