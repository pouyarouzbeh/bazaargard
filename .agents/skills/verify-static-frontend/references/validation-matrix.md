# Bazargard validation matrix

| Changed behavior                                           | Evidence                                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Agent instructions/skills/docs                             | Agent-docs checker, local links, scoped diff review; no app build needed solely for prose                           |
| Local visual presentation                                  | Owning component review, relevant browser widths/states, focused behavior tests if interaction changes              |
| Presentation data, filters or grouping                     | Node behavior tests including missing values, grouping scope and stale-selection boundaries                         |
| Global theme, shell, shared overlays or Vite configuration | Combined `npm --prefix frontend run check`; light/dark, narrow/wide and keyboard browser verification               |
| Changed backend/HTTP contract                              | Relevant existing pytest/API checks plus frontend consumer evidence; preserve ownership/error semantics             |
| Release requested                                          | Combined frontend check, required backend checks, final output and private-data review; deployment needs user scope |

The combined check replaces included narrow commands. Repeat only after relevant changes, failure or unresolved evidence. Do not suppress tests or inflate budgets to pass. Existing Windows PDF/Ops failures are baseline limits, not evidence of a new UI regression. Human usability and real-device performance must be labelled untested unless actually observed.

`npm --prefix frontend run check:theme` is included in the combined check and validates light/dark semantic foreground pairs plus control/focus boundaries from the actual theme CSS. It does not replace rendered checks of opacity, layering, image overlays or third-party controls.
