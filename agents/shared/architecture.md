# Architecture and component ownership

FastAPI owns catalogue retrieval, ranking, profile persistence, session authorization, LLM tool execution, comparison snapshots, seller evidence and routes. React owns presentation and interaction. Preserve the single backend and SQLite deployment.

Keep source-owned primitives in `frontend/src/ui.jsx`; theme values in `theme.css`; journey composition in named components. Main session orchestration can be extracted when a concrete boundary supports it, without rewriting all API calls during visual work. Group product offers only from actual responses and retain opaque identifiers.

Keep `map`, `comparison`, `pages`, public research and Ops dynamically imported. Do not ship the dataset, Python state, keys or private replies as static artifacts. Vite output remains `frontend/dist` and is served by FastAPI. Peony package names, static Next export directives and Laravel module rules are provenance, not requirements for this repository.
