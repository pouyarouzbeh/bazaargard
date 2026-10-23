# Data and state

The existing session lifecycle and backend remain authoritative. Use existing cookie-based API helpers, server-supported filter values and request sequence checks. React state owns ephemeral UI; hash routes own views. Do not introduce another state manager as part of a visual redesign.

Preserve missing/null/zero/false distinctions. Prices use recorded toman. Grouped product prices and shop counts must state the scope of the retrieved offers. Display dates in Asia/Tehran with Persian numerals; preserve wire timestamps.

Prevent duplicate submits. Do not retry writes automatically or interpret a failed response as a failed server write. Retain drafts, filters and useful previous results on network failure. Ignore stale responses after query/session changes. Reset pagination for a new query, preserve list/map selection for a view change. No credentials or catalogue dumps in browser storage; existing safe per-session plan storage must retain ownership boundaries.

Do not add model-generated HTML. Render a fixed component vocabulary over validated server facts. Missing model credentials must produce an honest direct-search path rather than simulated AI output.
