# Frontend agent workflow

Adapted from Peony's instruction / guide / skill separation. [Root contract](../AGENTS.md) holds invariants; shared guides hold durable decisions; skills hold execution workflows.

1. Read applicable contracts, task-specific guides and the user's complete design specification. Inspect git status; preserve earlier local setup and user data.
2. Define the user goal, entry point, primary action, relevant async states and acceptance evidence. For larger work record the mapping in [UX rebuild](../docs/UX_REBUILD.md).
3. Implement at the existing owner. Preserve authoritative API behavior and feature access; keep expensive optional UI lazy. Start a dated [changelog](../docs/changelogs/README.md) while editing.
4. Use the [validation matrix](../.agents/skills/verify-static-frontend/references/validation-matrix.md). Fix task regressions without weakening checks. Source review does not prove rendered quality.
5. Reconcile task-owned files and evidence with the changelog. Report implemented behavior, failed/skipped checks and remaining external inputs. Do not push or deploy merely because local work is complete.
