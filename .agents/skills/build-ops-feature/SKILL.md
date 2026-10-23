---
name: build-ops-feature
description: Implement or revise Bazargard Ops workspace UI, approvals and diagnosis. Excludes customer shopping journeys and actual external deployment unless explicitly authorized.
---

# Build Ops Feature

Read root/frontend AGENTS and the existing `frontend/src/ops.jsx` and `backend/ops.py` contract. Review only the affected operational flow.

Define actor, evidence, approved action, consequence and recovery. Keep a simple default path and disclose advanced controls without losing input. Treat server approval and execution state as authoritative; never turn a UI click into a claimed deployed/fixed result.

Use shared accessible controls, semantic tokens, explicit Persian labels and neutral operational density. Preserve pending/uncertain/denied states, focus and safe retry behavior. Do not transmit real credentials or mutate Liara merely to test a visual change.

Use `$verify-static-frontend`; record existing Windows lab limitations separately from task regressions in the dated changelog.
