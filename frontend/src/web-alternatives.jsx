import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Modal } from "./ui.jsx";
import { call } from "./features.jsx";
import "./web-alternatives.css";

const num = (n) =>
  Number(n).toLocaleString("fa-IR", { maximumFractionDigits: 1 });
const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};
const STAGES = {
  plan: "برنامه‌ریزی جست‌وجو",
  search: "جست‌وجوی فروشگاه‌ها در وب",
  read: "خواندن صفحه‌های فروشگاه‌ها",
  done: "پایان جست‌وجو",
};

function PinMap({ items }) {
  const box = useRef(null);
  const pins = items.filter((i) => i.lat != null && i.lon != null);
  const signature = pins.map((i) => i.lat + "," + i.lon).join("|");
  useEffect(() => {
    if (!pins.length) return;
    const map = L.map(box.current, {
      scrollWheelZoom: false,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    const seen = new Map();
    pins.forEach((item) => {
      const key = item.lat.toFixed(5) + "," + item.lon.toFixed(5);
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(item);
    });
    [...seen.values()].forEach((group) => {
      const first = group[0],
        index = items.indexOf(first) + 1;
      const card = document.createElement("div");
      card.dir = "rtl";
      const title = document.createElement("b");
      title.textContent = first.store.name;
      const text = document.createElement("p");
      text.textContent =
        (first.store.address || "") +
        (first.location_precision === "approximate" ? " (موقعیت تقریبی)" : "");
      const list = document.createElement("small");
      list.textContent = group
        .map((g) => g.title)
        .slice(0, 3)
        .join(" · ");
      card.append(title, text, list);
      L.marker([first.lat, first.lon], {
        icon: L.divIcon({
          className: "area-pin",
          html: "<span>" + index + "</span>",
          iconSize: [32, 38],
          iconAnchor: [16, 38],
        }),
      })
        .bindPopup(card)
        .addTo(map);
    });
    map.fitBounds(
      pins.map((i) => [i.lat, i.lon]),
      { padding: [30, 30], maxZoom: 15, animate: false },
    );
    const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    resize.observe(box.current);
    return () => {
      resize.disconnect();
      map.remove();
    };
  }, [signature]);
  if (!pins.length) return null;
  return (
    <div
      className="webalt-map"
      ref={box}
      role="region"
      aria-label="نقشه فروشگاه‌های پیدا شده"
    />
  );
}

export function WebAltPanel({ sid, query = "", jobId, autoStart, onJob }) {
  const [job, setJob] = useState(null),
    [id, setId] = useState(jobId),
    [value, setValue] = useState(query.slice(0, 200)),
    [error, setError] = useState("");
  const active = useRef(true);
  useEffect(
    () => () => {
      active.current = false;
    },
    [],
  );
  async function start(text) {
    setError("");
    try {
      const j = await call("web-alternatives", {
        session_id: sid,
        query: text,
      });
      setJob(j);
      setId(j.id);
      onJob?.(j);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    if (!jobId && autoStart && query.trim()) start(query.trim());
  }, []);
  useEffect(() => {
    if (!id) return;
    let stop = false;
    (async () => {
      for (let n = 0; n < 400 && !stop; n++) {
        try {
          const j = await call(
            "web-alternatives/" + id + "?session_id=" + encodeURIComponent(sid),
          );
          if (!active.current || stop) return;
          setJob(j);
          if (
            ["completed", "failed", "interrupted", "cancelled"].includes(
              j.status,
            )
          )
            return;
        } catch (e) {
          setError(e.message);
          return;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    })();
    return () => {
      stop = true;
    };
  }, [id]);
  const r = job?.result || {},
    items = r.items || [],
    running = job && ["queued", "running", "retry_queued"].includes(job.status);
  const pct =
    r.stage === "done" || job?.status === "completed"
      ? 100
      : r.stage === "read" && r.pages_total
        ? Math.round(25 + (75 * (r.pages_done || 0)) / r.pages_total)
        : r.stage === "search"
          ? 15
          : 5;
  const city = r.city || "شهر شما";
  return (
    <div className="webalt" dir="rtl">
      {job ? (
        <div className="webalt-banner">
          <b>
            {job.catalogue_matches
              ? "در دیتاست ترب فقط " +
                num(job.catalogue_matches) +
                " محصول مرتبط بود (در نتایج جست‌وجو)."
              : "در دیتاست ترب محصولی مطابق درخواست شما پیدا نشد."}
          </b>{" "}
          {job.catalogue_matches ? "گزینه‌های بیشتر" : "گزینه‌های جایگزین"} از
          فروشگاه‌های {city} در وب: {job.query}
        </div>
      ) : null}
      {!id ? (
        <form
          className="webalt-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) start(value.trim());
          }}
        >
          <label>
            چه محصولی می‌خواهید؟
            <input
              value={value}
              maxLength={200}
              onChange={(e) => setValue(e.target.value)}
              placeholder="مثلاً تلویزیون ۵۵ اینچ 4K"
            />
          </label>
          <button className="primary" disabled={!value.trim()}>
            جست‌وجو در وب
          </button>
        </form>
      ) : null}
      {error ? (
        <p role="alert" className="webalt-error">
          {error}
        </p>
      ) : null}
      {job ? (
        <div
          className={
            "spec-progress" + (job.status === "completed" ? " done" : "")
          }
          role="status"
          aria-live="polite"
        >
          <div className="spec-progress-head">
            <strong>
              {job.status === "completed"
                ? "جست‌وجو تمام شد"
                : job.status === "failed"
                  ? "جست‌وجو کامل نشد"
                  : job.status === "retry_queued"
                    ? "در صف جست‌وجو…"
                    : STAGES[r.stage] || "آماده‌سازی…"}
            </strong>
          </div>
          <div className="spec-progress-bar">
            <span style={{ width: pct + "%" }} />
          </div>
          <div className="spec-progress-stats">
            <span>
              <b>{num(items.length)}</b> مورد پیدا شد
            </span>
            {r.pages_total ? (
              <span>
                {num(r.pages_done || 0)} از {num(r.pages_total)} صفحه بررسی شد
              </span>
            ) : null}
            {r.requirements?.length ? (
              <span>شرط‌ها: {r.requirements.join("، ")}</span>
            ) : null}
          </div>
        </div>
      ) : null}
      <PinMap items={items} />
      {items.length ? (
        <ol className="webalt-list">
          {items.map((item, i) => (
            <li key={item.url + i} className="webalt-card">
              <div className="webalt-card-head">
                <span className="webalt-index">{num(i + 1)}</span>
                <b dir="auto">{item.title}</b>
                <span className={"webalt-match " + item.match}>
                  {item.match === "exact" ? "مطابق درخواست" : "جایگزین نزدیک"}
                </span>
              </div>
              {item.price ? (
                <p className="webalt-price" dir="auto">
                  {item.price}
                </p>
              ) : (
                <p className="webalt-muted">قیمت نامشخص</p>
              )}
              {item.why ? <p className="webalt-why">{item.why}</p> : null}
              <p className="webalt-store">
                <b>{item.store.name}</b>
                {item.store.in_person === "yes" ? (
                  <span className="webalt-badge">خرید حضوری</span>
                ) : item.store.in_person === "no" ? (
                  <span className="webalt-badge muted">فقط آنلاین</span>
                ) : null}
              </p>
              {item.store.address ? (
                <p dir="auto">
                  📍 {item.store.address}
                  {item.distance_km != null
                    ? " · حدود " + num(item.distance_km) + " کیلومتر از شما"
                    : ""}
                  {item.location_precision === "approximate"
                    ? " · موقعیت تقریبی"
                    : ""}
                </p>
              ) : (
                <p className="webalt-muted">آدرس نامشخص</p>
              )}
              {item.store.phone ? (
                <p dir="ltr" className="webalt-phone">
                  {item.store.phone}
                </p>
              ) : null}
              {item.verification === "search_summary" ? (
                <p className="webalt-muted">🔎 {item.label}</p>
              ) : null}
              <p className="webalt-links">
                <span className="web-source">
                  <b>از وب</b>
                </span>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {host(item.url)}
                </a>
                {item.maps_url ? (
                  <a
                    href={item.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    مسیریابی
                  </a>
                ) : null}
              </p>
            </li>
          ))}
        </ol>
      ) : job && !running ? (
        <p className="webalt-muted">
          {job.status === "failed"
            ? job.error
            : "فروشنده‌ای پیدا نشد. عبارت دیگری جست‌وجو کنید."}
        </p>
      ) : null}
      {r.sources?.length ? (
        <details className="webalt-sources">
          <summary>منابع بررسی‌شده ({num(r.sources.length)})</summary>
          {r.sources.map((s, i) => (
            <p key={i}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {host(s.url)}
              </a>{" "}
              ·{" "}
              {s.status === "readable"
                ? num(s.listings) + " مورد"
                : "در دسترس نبود"}
            </p>
          ))}
        </details>
      ) : null}
      <p className="webalt-notice">{r.notice || ""}</p>
    </div>
  );
}

export default function WebAlternatives({ onClose, ...props }) {
  return (
    <Modal title="جایگزین‌ها از وب و فروشگاه‌های شهر" wide onClose={onClose}>
      <WebAltPanel {...props} />
    </Modal>
  );
}
