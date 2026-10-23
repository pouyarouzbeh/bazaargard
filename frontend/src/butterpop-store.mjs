// Ported from Peony: React-safe ButterPop.js v1.0.4 adaptation.
// MIT attribution: ../../docs/licenses/BUTTERPOP_LICENSE.md
const toastThemes = ["minimal", "material", "rounded"];
const MAX_QUEUED_TOASTS = 24;
const TOAST_EXIT_DURATION = 180;
const EMPTY_TOAST_SNAPSHOT = [];
const listeners = /* @__PURE__ */ new Set();
let nextToastId = 0;
let toastSnapshot = EMPTY_TOAST_SNAPSHOT;
function publish(nextSnapshot) {
  toastSnapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}
function createToastId() {
  nextToastId += 1;
  return `shop-toast-${nextToastId}`;
}
function findDuplicate(tone, message) {
  return toastSnapshot.find(
    (record) =>
      record.phase === "open" &&
      record.tone === tone &&
      record.message === message,
  );
}
function removeClosedToasts(targets) {
  const targetRevisions = new Map(
    targets.map((target) => [target.id, target.revision]),
  );
  const nextSnapshot = toastSnapshot.filter((record) => {
    const targetRevision = targetRevisions.get(record.id);
    return (
      targetRevision === void 0 ||
      record.revision !== targetRevision ||
      record.phase !== "closing"
    );
  });
  if (nextSnapshot.length !== toastSnapshot.length) publish(nextSnapshot);
}
function scheduleRemoval(targets) {
  globalThis.setTimeout(() => removeClosedToasts(targets), TOAST_EXIT_DURATION);
}
function notifyDismissed(records, reason) {
  records.forEach((record) => {
    if (reason === "auto") record.onAutoClose?.(record.id);
    else record.onDismiss?.(record.id);
  });
}
function subscribeToToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getToastSnapshot() {
  return toastSnapshot;
}
function showToast(tone, message, options = {}) {
  if (options.id === void 0 && options.preventDuplicates) {
    const duplicate = findDuplicate(tone, message);
    if (duplicate) return duplicate.id;
  }
  const id = options.id ?? createToastId();
  const existing = toastSnapshot.find((record) => record.id === id);
  const nextRecord = {
    ...existing,
    ...options,
    id,
    message,
    phase: "open",
    revision: (existing?.revision ?? 0) + 1,
    tone,
  };
  const nextSnapshot = existing
    ? toastSnapshot.map((record) => (record.id === id ? nextRecord : record))
    : [...toastSnapshot, nextRecord].slice(-MAX_QUEUED_TOASTS);
  publish(nextSnapshot);
  return id;
}
function updateToast(id, message, options = {}) {
  const existing = toastSnapshot.find((record) => record.id === id);
  if (!existing) return void 0;
  const { tone = existing.tone, ...toastOptions } = options;
  return showToast(tone, message, { ...toastOptions, id });
}
function dismissToast(id, reason = "programmatic") {
  const dismissedRecords = toastSnapshot.filter(
    (record) => record.phase === "open" && (id === void 0 || record.id === id),
  );
  if (dismissedRecords.length === 0) return;
  const dismissedIds = new Set(dismissedRecords.map((record) => record.id));
  publish(
    toastSnapshot.map((record) =>
      dismissedIds.has(record.id) ? { ...record, phase: "closing" } : record,
    ),
  );
  scheduleRemoval(dismissedRecords);
  notifyDismissed(dismissedRecords, reason);
}
const neutralToast = (message, options) =>
  showToast("neutral", message, options);
const toast = Object.assign(neutralToast, {
  dismiss: (id) => dismissToast(id),
  error: (message, options) => showToast("error", message, options),
  info: (message, options) => showToast("info", message, options),
  loading: (message, options) => showToast("loading", message, options),
  success: (message, options) => showToast("success", message, options),
  update: (id, message, options) => updateToast(id, message, options),
  warning: (message, options) => showToast("warning", message, options),
});
export {
  EMPTY_TOAST_SNAPSHOT,
  TOAST_EXIT_DURATION,
  dismissToast,
  getToastSnapshot,
  showToast,
  subscribeToToasts,
  toast,
  toastThemes,
  updateToast,
};
