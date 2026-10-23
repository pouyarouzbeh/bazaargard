# Source-owned UI components

The Peony migration preserves useful component behavior, not its Next.js/Tailwind application structure.

Use no star/sparkle symbols or icons. Ratings use a numeric score out of five. Keep icons inline beside labels and titles, including mobile navigation; omit decorative icons above headings.

Forward/link actions use Lucide `ArrowLeft`, following the Persian RTL reading direction. Do not use diagonal upward arrows (`ArrowUpLeft`, `ArrowUpRight`, `ExternalLink`) for these actions.

- `frontend/src/ui.jsx`: shared `Modal` adapter, backed by the same `@radix-ui/react-dialog@1.1.23` as Peony. Radix owns focus containment, Escape/outside dismissal, scroll lock and presence. The local adapter preserves existing feature callers.
- `focusSheet`: Peony's requestAnimationFrame + `preventScroll` focus fix. Focus the sheet itself after portal and scroll-lock writes settle; do not synchronously measure or focus an input during its entrance. Mobile must not open the keyboard merely by opening a sheet.
- `frontend/src/style.css`: the overlay shell animates transform only; the scrim animates opacity without full-screen blur. A separate `.modal-body` owns scrolling and a stable scrollbar gutter. Opening and closing have state-specific CSS, plus a reduced-motion path. Do not animate the whole app or its layout dimensions.
- `frontend/src/butterpop-store.mjs`: directly ported Peony ButterPop queue, deduplication, stable IDs, updates and dismissal lifecycle. Preserve [MIT attribution](../../docs/licenses/BUTTERPOP_LICENSE.md).
- `frontend/src/toaster.jsx`: adapted Peony renderer. Use neutral/success/info for routine feedback and error/warning only for actual failure or uncertainty. Timers pause during hover, focus and a hidden page. Plain text and one close action; decisions and validation remain inline or in the owning sheet.
- `frontend/src/theme.css`: light/dark tokens, motion-neutral theme changes and legacy semantic aliases.
- `shopping-home`, `shopping-filters`, `product-card` and `purchase-checklist` own their actual shopping composition. Keep business facts in backend responses; a personal checklist never becomes independently verified seller evidence.

Keep send controls 44px, shrink-safe and aligned with the input baseline. Use upward send direction for conversation and a search icon for direct search. Preserve accessible labels, composition-aware Enter handling, selected text and input after recoverable failures. Logo geometry belongs to the shared brand component in main composition; avoid adding gradients or motion for recognition.

Before changing these owners, inspect their consumers. Verify keyboard focus/return, rapid dismissal, narrow sheets, dark mode and reduced motion. A successful build proves source validity; observed browser behavior is separate evidence from measured frame performance.
