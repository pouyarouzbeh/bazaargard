import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  CheckCircle2,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";
import {
  dismissToast,
  getToastSnapshot,
  subscribeToToasts,
} from "./butterpop-store.mjs";
import "./toaster.css";

const ICONS = {
  neutral: Bell,
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: XCircle,
  loading: LoaderCircle,
};
function ToastItem({ record, hidden }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused || hidden;
  const duration =
    record.duration ??
    (record.tone === "loading"
      ? 0
      : record.tone === "error" || record.tone === "warning"
        ? 8000
        : 5000);
  const remaining = useRef(duration);
  const dismiss = useCallback(
    () => dismissToast(record.id, "auto"),
    [record.id],
  );
  useEffect(() => {
    remaining.current = duration;
  }, [duration, record.revision]);
  useEffect(() => {
    if (!duration || paused || record.phase !== "open") return;
    const started = Date.now();
    const timer = setTimeout(dismiss, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started),
      );
    };
  }, [duration, paused, record.phase, record.revision, dismiss]);
  const role =
    record.tone === "error" || record.tone === "warning" ? "alert" : "status";
  const Icon = ICONS[record.tone] || Bell;
  return (
    <article
      className="ui-toast"
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      aria-atomic="true"
      data-tone={record.tone}
      data-state={record.phase}
      data-paused={paused}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerCancel={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <Icon
        className={record.tone === "loading" ? "spin" : undefined}
        size={20}
        aria-hidden="true"
      />
      <div className="ui-toast-content">
        <p>{record.message}</p>
        {record.description ? <small>{record.description}</small> : null}
      </div>
      <button
        className="icon-btn"
        type="button"
        aria-label="بستن اعلان"
        onClick={() => dismissToast(record.id, "close")}
      >
        <X size={17} />
      </button>
      {duration > 0 ? (
        <span
          key={record.revision}
          aria-hidden="true"
          className="ui-toast-progress"
          style={{ animationDuration: duration + "ms" }}
        />
      ) : null}
    </article>
  );
}

// Adapted from Peony's source-owned ButterPop renderer; no toast runtime package.
export default function Toaster() {
  const records = useSyncExternalStore(subscribeToToasts, getToastSnapshot);
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  return createPortal(
    <ol
      className="ui-toast-viewport"
      aria-label="اعلان‌ها"
      aria-live="off"
      dir={document.documentElement.dir}
    >
      {records
        .slice(0, 3)
        .reverse()
        .map((record) => (
          <li key={record.id}>
            <ToastItem record={record} hidden={hidden} />
          </li>
        ))}
    </ol>,
    document.body,
  );
}
