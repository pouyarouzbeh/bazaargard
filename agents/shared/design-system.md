# Design system

## Token architecture

Use three layers:

1. Color values or ramps owned by a theme profile; prefer OKLCH for perceptual ramp work.
2. Ten semantic families consumed by application UI.
3. Derived component roles mapped to those families.

The ten semantic families are `background`, `surface`, `foreground`, `muted`, `border`, `primary`, `accent`, `success`, `warning`, and `danger`. Derived tokens such as `primary-foreground`, `muted-foreground`, `ring`, `card`, `popover`, `input`, and soft status backgrounds do not create new brand families.

Keep five additional public semantic roles stable: `info` maps to primary communication, `focus` to the keyboard focus color, `selection` to selected text/rows, `overlay` to scrims, and `skeleton` to loading placeholders. This gives feature code fifteen useful semantic roles while each client still replaces only ten coherent families. Add another family only when it carries a distinct meaning in multiple real features and cannot be derived without losing contrast or meaning.

Raw hex, RGB, HSL, OKLCH, or Tailwind palette utilities are permitted only inside a theme definition, a documented data-visualization scale, or an exceptional media treatment. Feature code uses semantic utilities such as `bg-surface`, `text-foreground`, `border-border`, and `text-danger`.

## Theme profile

The shared package defines the contract and safe neutral fallbacks. `frontend/src/theme.css` owns Bazargard light/dark semantic values. Existing legacy aliases map to those roles; feature code consumes tokens.

Ship light and dark themes as one contract. Every profile supplies both sets, validates AA foreground pairs and interactive states, and reviews product imagery in each theme. Use `system` by default, persist an explicit device-local preference, prevent first-paint theme flash, and disable transitions during theme changes. Do not infer theme from account identity or place the preference in analytics.

Bazargard's profile uses oxblood/brick-red primary actions, warm neutral stone surfaces and a restrained brass accent/focus. Dark mode uses warm charcoal surfaces and muted clay primary actions. Brand/selection use primary tokens; danger has its own carmine tokens for actual errors and destructive actions. Filled controls consume `primary-foreground`, `success-foreground` or `info-foreground`, never the page surface. `control-border` is stronger than decorative dividers. Photo and map media roles remain legible over light imagery. Run `npm --prefix frontend run check:theme` for semantic token contrast pairs; rendered state checks remain required.

## Contemporary visual quality

Aim for premium minimalism that remains useful beyond a visual trend:

- Establish one dominant visual hierarchy per viewport and one obvious primary action per surface.
- Use strong Persian typography, fluid but bounded type, consistent spacing rhythm, and generous whitespace.
- Use tonal surfaces, thin borders, and soft depth before shadows; reserve glass, gradients, bento layouts, and oversized radii for cases where they communicate hierarchy.
- Keep the light canvas white or nearly white. Separate surfaces primarily with spacing, typography, thin borders, and only then subtle elevation; do not solve hierarchy by tinting every region.
- Budget color deliberately: neutral surfaces dominate, primary identifies the main action or selected state, accent is rare, and status colors appear only with status meaning.
- Reject generic AI-template signals: gradient halos behind headings, stacked translucent cards, repeated colorful icon tiles, ornamental pills, inflated radii, oversized marketing copy, and decoration without product evidence.
- Apply Apple-inspired principles as restraint, clarity, precise typography, immediate press feedback, material hierarchy, and craft—not as copied trade dress or gratuitous translucency.
- Keep dense admin screens calm through alignment and grouping, not tiny type or excessive card nesting.
- Give storefront product media stable, premium framing while keeping factual package details more prominent than decoration.
- Review loading, empty, error, success, disabled, selected, hover, focus, and dark states as part of the visual design—not as later patches.

## Typography

- Use the active profile's self-hosted Persian-capable font. Vazirmatn is a suitable fallback for a new profile, not a reason to replace an established brand face.
- Use system fallbacks and prevent font loading from blocking basic interaction.
- Use tabular numerals for money, inventory, order identifiers, and reports.
- Keep a bounded type scale and comfortable Persian line height; avoid tiny secondary text.

## Shape, spacing, and elevation

- Use shared spacing, radius, shadow, and motion tokens rather than one-off values.
- Reserve pill radius for badges, compact controls, and prominent actions; do not make every surface a pill.
- Use borders and tonal surfaces before heavy shadows. Elevation communicates layering, not decoration.
- Keep dense admin layouts legible and storefront layouts calm, warm, and product-focused.
- Prefer moderate radii and compact control feedback. A control may compress slightly on press; routine hover states should not make every element float.

## Motion

- Prefer CSS transitions and keyframes for small state changes. Use opacity and transform when possible.
- Motion must explain hierarchy, continuity, or feedback; decorative movement alone does not justify a dependency.
- Respect `prefers-reduced-motion` and never gate completion on animation.
- Use approximately 140ms for immediate feedback, 180–220ms for control and content transitions, and up to 280ms for overlays. Choose one standard easing curve and avoid simultaneous unrelated motion.

## Component craft contract

Premium quality comes from the consistency of small decisions across the whole interaction, not a larger number of effects. Select a restrained signature appropriate to the app: product photography and editorial rhythm in the storefront; precise alignment and quiet operational controls in admin. References such as Apple describe a level of care, not a template, font mandate, or permission to copy assets.

| Component family                  | Visual finish                                                                                                                      | Interaction requirement                                                                                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buttons and icon actions          | Consistent optical alignment, icon weight, radius, and label spacing; primary, secondary, ghost, and danger remain distinguishable | Immediate press feedback; stable label/width when busy; disabled actions cannot appear actionable; keyboard focus differs from hover                                       |
| Fields, Select, SearchSelect      | Matching heights, baselines, borders, placeholder contrast, and leading/trailing icon space                                        | Persistent labels; distinct empty/selected/invalid states; searchable options expose active versus selected state and a useful no-results path                             |
| Tabs and segmented controls       | Calm track, clearly selected item, bounded labels; underline or surface treatment chosen consistently                              | Keyboard navigation and visible focus; no geometry shift on selection; preserve URL/context when required; motion supports the state change                                |
| Menus and filters                 | Controlled elevation, quiet separators, clear item grouping and active-filter summary                                              | Trigger and portalled surface share the same visual language; dismissal restores focus; disabled and destructive choices remain distinct; clear/apply behavior is explicit |
| Lists and tables                  | Aligned labels and numbers, consistent row density, quiet separators, restrained selected rows                                     | Selection differs from hover; refresh preserves usable rows; sorting/pagination are discoverable; responsive presentation retains facts and actions                        |
| Sheets, dialogs and confirmations | Clear header/body/footer hierarchy, restrained scrim, consistent inner spacing and edge geometry                                   | Correct overlay type; independent body scrolling; visible close/next action; focus restoration, safe Escape behavior and draft protection                                  |
| Date and time controls            | Readable numerals, balanced navigation, distinct today/selected/disabled states                                                    | Keyboard operation and labelled direct entry where supported; locale display stays separate from machine values; no forced animation for selection                         |
| Feedback and empty states         | Stable geometry, concise copy, appropriately weighted status                                                                       | Show what happened and the next safe action; feedback is local and accessible; never replace uncertainty with a reassuring success treatment                               |

Do not add every listed effect to every component. Fix misalignment, hierarchy, and ambiguity first; a subtle shadow or animation is optional when it adds no useful signal. Preserve existing interaction semantics while refining appearance.

## Motion detail

- Prefer a shared easing and small distances: press compression around 0.975–0.99, optional primary-action hover lift of at most 1px, and a gentle menu scale around 0.985–1 are useful starting points, not mandatory effects.
- Give press feedback immediately (roughly 90–140ms), selection/disclosure feedback in 140–220ms, and overlay movement in 200–280ms. Opening can decelerate; closing should feel prompt. Reuse existing primitive enter/exit behavior rather than stacking a second animation system.
- Apply hover lift only on fine-pointer devices and only to a small set of meaningful actions. Do not move whole tables, every card, or every control on hover. Keyboard focus must remain visible without movement.
- Animate opacity/transform; short color/border transitions are acceptable. Avoid animating layout dimensions, large blur regions, scroll-linked parallax, routine staggered lists, or perpetual decorative loops.
- Never delay a request, focus, dismissal, validation, or success presentation to finish an animation. Rapid repeated interactions must settle on the latest state; loading/refetch must not replay entrance motion across usable content.
- Reduced motion removes nonessential translation, scaling, and animation while retaining selected, focus, loading, and error meaning. Confirm the app-level cascade does not override primitive reduced-motion rules. Theme switching must not animate all controls.

## Simple, reassuring UX

Keep Bazargard copy short and task-specific. No generic disclaimer footer under the composer, catalogue-count marketing note, model-availability banner or repeated explanation of how the app works. Put essential price/date/source/unknown status beside the relevant fact. Toasts state one result or one useful next step; avoid appended explanations. Never shorten user messages, source quotations or model output with blanket truncation.

- Make the task understandable from the heading, labels, visible facts, and one clear next action. Do not hide essential choices or useful labels to achieve visual emptiness.
- Prefer sensible defaults for reversible preferences; financially material choices require explicit intent. Reveal optional complexity when useful and preserve entered values when it closes.
- Preserve context across detail views, back navigation, filtering, validation, and recoverable failures. Keep the user's draft, selected package/entity, and query context in their appropriate state owners.
- Use concise, natural Persian: an action verb for the control, the consequence for a material confirmation, and an achievable next step for an error. Friendly means clear and respectful, not chatty, exaggerated, or manipulative.
- Place essential purchase/operational facts where the decision happens. Do not rely on tooltips, hover, color alone, or unexplained icons for required information. Contextual help can be disclosed on request without cluttering the resting view.
- Make feedback proportional: quiet local confirmation for routine changes, inline guidance for validation, and a blocking decision only when the consequence requires it. Never announce an authoritative commerce outcome optimistically.

## Acceptance and evidence

For the affected component/journey, check these outcomes before describing the work as complete:

1. The user can identify the subject, relevant facts, current state, and next safe action without exploring decorative controls.
2. The typography, spacing, optical alignment, radii, and elevation form a coherent family, including portalled and asynchronous states.
3. Light/dark foreground pairs and hover/selected/disabled/invalid treatments remain readable; color changes preserve status meaning. Normal text meets 4.5:1, large text 3:1, and required control/focus boundaries 3:1 against adjacent colors. Disabled exceptions must not make essential information unreadable.
4. Keyboard, touch, RTL, zoom, narrow layouts, and reduced motion retain the same task and information. Long Persian labels, large values, and the on-screen keyboard do not obscure the action.
5. Motion has a named purpose, stays short and interruptible, and creates no layout shift or artificial delay. The interface remains understandable with animation removed.
6. The implementation edits the owning component/style rule, preserves variant semantics, and does not introduce redundant overrides, runtime dependencies, or bundle regressions for decoration.

Scale evidence to the requested work and risk. Documentation changes require documentation validation; small styling changes need targeted stylesheet/theme checks. When visual review is requested or warranted, choose representative components, states, themes, and widths rather than exhaustively visiting unrelated routes. Respect an explicit request to skip visual testing and report that limitation; source checks cannot prove perceived luxury or ease of use. Critical behavior and release gates remain governed by the validation workflow.

## Loading language

- Use a geometry-matching Skeleton for initial page, card, table, or detail loading. Keep its animation subtle and hide it from assistive technology while the owning region exposes `aria-busy` when useful.
- Use Spinner inside the control or small region that initiated a short indeterminate action. Preserve the action label and width.
- Use Progress only when meaningful progress can be measured; never fake percentages.
- Keep existing content visible during background refresh and show a quiet refresh affordance instead of replacing the page with Skeleton.
- Avoid loader flashes for operations that complete immediately and never introduce artificial minimum waits.

## Icons

Use the existing Lucide family with consistent optical weights: 16px metadata, 20px controls, 24px emphasis. Icons support labels; icon-only controls have accessible names. Mirror only direction-bearing arrows. Do not add a second icon dependency.

## Accessibility

- Validate AA contrast for normal and interactive states, not only default text.
- Keep visible focus distinct from hover.
- Maintain a practical 44px target for primary touch controls.
- Do not encode status only with color; pair it with text or an icon that has an accessible label when needed.

## Optional operational composition

The following Peony composites are patterns, not installed Bazargard components. Reuse Bazargard primitives and add only a demonstrated current need.

The shared package includes a small admin-capable vocabulary without owning admin workflows:

- `DropdownMenu` is the Radix menu contract for account actions, display modes, sort choices, and contextual actions.
- `FilterDropdown` owns the Popover-to-Sheet adaptation, active count, clear action, and labelled filter surface.
- `DataSurface` owns the neutral framed data region and its header, toolbar, body, footer, and compact stat slots.
- `ActionTooltipContent` gives icon-only and collapsed-navigation actions a consistent explanation while the trigger still keeps its accessible name.
- `SlideOver` aliases the shared Sheet contract for teams that use the operational vocabulary; it does not create a second overlay system.

Keep these primitives direction-inherited, semantic-token-only, and composable. Do not put API calls, permissions, order states, or inventory facts into them.
