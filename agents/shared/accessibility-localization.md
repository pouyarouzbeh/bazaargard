# Accessibility and localization

## Language and direction

- Set document language and direction as `fa-IR`/`rtl` for Bazargard.
- Use logical properties and `start`/`end` naming. Audit chevrons, progress direction, charts, drawers, and pagination for RTL meaning.
- Shared components inherit direction from the document. Pass an explicit direction to a portal only when the primitive cannot inherit it; never hardcode RTL in reusable source.
- Treat LTR as a supported structural mode. A profile and copy change may alter composition, but routes, data ownership, components, overlays, and tokens must not require reconstruction.
- Keep translation keys and machine codes stable and language-neutral.

## Semantics and keyboard

- Use native elements for links, buttons, headings, tables, lists, fields, and landmarks before ARIA.
- Maintain a logical heading outline and one clear page-level heading.
- Keep all interaction keyboard-complete, with visible focus and a predictable order.
- Restore focus after overlay dismissal and announce meaningful asynchronous updates through an appropriate live region.
- Provide skip navigation when repeated application chrome becomes substantial.

## Visual access

- Meet WCAG AA contrast in default, hover, active, disabled, invalid, and focus states.
- Support 200% zoom without loss of content or operation.
- Keep primary touch controls approximately 44 by 44 CSS pixels.
- Respect reduced motion and avoid flashing or motion-dependent instruction.
- Never use color alone for status, selection, or validation.

## Formatting

- Use shared `Intl`-based formatters for Persian digits, dates, percentages, relative values, and integer minor-unit money. Human-facing numeric values use Persian digits under `fa-IR`, including badges, counts, quantities, price, weight, dates, time, and pagination.
- Preserve ASCII for exact machine identifiers such as SKU, order references, phone input values, URLs, API values, and verification codes when changing the glyphs could break entry or copying. Wrap mixed-direction references with bidi isolation and localize any explanatory number around them.
- Use Intl for Persian date display. Do not add a calendar dependency without a real selection requirement. Keyboard navigation, disabled dates, month navigation, focus return, labels, and dark mode are mandatory.
- Store and exchange dates in the API's Gregorian machine format. A date-time control keeps selected date, local time, and time-zone intent distinct until the feature constructs an explicit-offset timestamp; never treat a Jalali display string as the wire value.
- Persist timestamps with explicit offset semantics and display in the user's intended zone.
- Use bidi isolation for mixed-direction identifiers, phone numbers, SKUs, and Latin machine references.
- Keep translated UI concise; allow layouts to expand rather than truncating essential text.

## Media

Provide useful alternative text for informative product media and empty alternative text for decoration. Product alt text describes the product and package shown without keyword stuffing. Never put critical instructions only inside an image.
