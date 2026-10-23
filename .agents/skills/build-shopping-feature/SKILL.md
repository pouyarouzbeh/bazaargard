---
name: build-shopping-feature
description: Implement customer-facing discovery, product/store decisions, filters, comparison and visit planning in Bazargard React/Vite. Excludes the separate Ops workspace.
---

# Build Shopping Feature

Read root/frontend AGENTS, [workflow](../../../agents/agent-workflow.md), the complete user UX specification when assigned, and the affected source owner. Use [design system](../../../agents/shared/design-system.md), [data and state](../../../agents/shared/data-and-state.md) and [accessibility](../../../agents/shared/accessibility-localization.md).

Define the user's goal, primary action, entry points and real loading/empty/error/retry states. Keep product, shop and offer semantics distinct; group only actual response records. Preserve price/date provenance, unknown hours and synthetic-contact disclosures. Start with a complete request → product → seller → ready-to-go flow and retain non-linear access.

Implement using the current React/Vite, Lucide, native browser APIs and existing backend. Fix the owning component/style; remove superseded rules. Keep draft input, filters and useful results during recovery; guard duplicate writes and stale responses. Do not simulate AI output when the model is unavailable.

Use `$sync-openapi-client` if a needed operation is uncertain. Apply `$audit-frontend-experience` as a review checklist without recursively reinvoking this skill. Finish with `$verify-static-frontend` and the dated changelog; report actual model/browser evidence and limits.
