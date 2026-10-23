---
name: sync-openapi-client
description: Align Bazargard frontend API use with backend/server.py and FastAPI OpenAPI when operations, response shapes, error behavior or session semantics are uncertain.
---

# Sync API Contract

Read [data and state](../../../agents/shared/data-and-state.md). Inspect the specific route in `backend/server.py`, its Pydantic request model, response builder and existing consumers; use `/api/openapi.json` for published request schemas.

Record method/path, cookie/session ownership, request fields, success variants, HTTP errors and missing/null semantics. Inspect existing `api`/`call` helpers before adding transport. There is no Peony OpenAPI generator or TypeScript snapshot here; do not run invented generation commands.

Add the narrowest adapter at its current owner. Preserve opaque identifiers, toman units and explicit-zone timestamps. Keep unknown-error recovery and never invent price, stock, authorization or seller evidence. If the required fact has no operation, report the exact gap; continue independent authorized work.

Run focused API/interaction checks and `$verify-static-frontend` as applicable. Record the reviewed contract and compatibility in the changelog.
