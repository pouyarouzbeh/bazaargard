import React, { useEffect, useState, lazy, Suspense } from "react";
import { MapPin, Navigation, ArrowLeft, Search } from "lucide-react";
import { Modal } from "./ui.jsx";
import { call } from "./features.jsx";
import "./areas.css";
const AreaMap = lazy(() => import("./areas-map.jsx"));
const number = (n) => Number(n).toLocaleString("fa-IR");
export default function ShoppingAreas({
  sid,
  query = "",
  initial = null,
  onClose,
}) {
  const [data, setData] = useState(initial),
    [topic, setTopic] = useState(initial?.topic || query),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setData(initial);
    setTopic(initial?.topic || query);
    setError("");
  }, [initial, query]);
  async function find(e) {
    e?.preventDefault();
    if (!topic.trim() || pending) return;
    setPending(true);
    setError("");
    try {
      setData(
        await call("shopping-areas", {
          session_id: sid,
          query: topic.trim().slice(0, 120),
        }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  const content = (
    <div className="shopping-areas" dir="rtl">
      <div className="area-heading">
        <MapPin size={22} />
        <div>
          <h3>ادامه جست‌وجو در بازار حضوری</h3>
          <p>ناحیه پیشنهادی، موجودی تأییدشده نیست.</p>
        </div>
      </div>
      <form className="area-search" onSubmit={find}>
        <label>
          دسته کالا
          <input
            aria-label="دسته کالا برای پیدا کردن بازار"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثلاً لپ تاپ، گوشی یا کفش"
            maxLength={120}
          />
        </label>
        <button className="outline" disabled={pending || !topic.trim()}>
          <Search size={16} />
          {pending ? "بررسی…" : "پیدا کردن ناحیه"}
        </button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
      {data?.areas?.length ? (
        <>
          <p className="area-notice">{data.notice}</p>
          <Suspense
            fallback={
              <p>آماده‌سازی نقشه؛ آدرس‌ها در پایین قابل استفاده‌اند.</p>
            }
          >
            <AreaMap areas={data.areas} />
          </Suspense>
          <div className="area-cards">
            {data.areas.map((a, i) => (
              <article key={a.id}>
                <h4>
                  {number(i + 1)}. {a.name}
                </h4>
                <p>{a.address}</p>
                <span className="area-basis">
                  {a.evidence_kind === "public_merchant_source"
                    ? "منبع عمومی"
                    : "دسته فعالیت فروشگاه"}
                </span>
                <p>{a.evidence}</p>
                <small>
                  {a.coordinate_basis}
                  {a.distance_km != null
                    ? " · فاصله مستقیم " + number(a.distance_km) + " کیلومتر"
                    : ""}
                </small>
                {a.outside_radius || a.outside_neighborhood ? (
                  <p className="area-outside">خارج از محدوده</p>
                ) : null}
                <details>
                  <summary>منبع و دسته‌های مرتبط</summary>
                  <p>{a.categories.join("، ")}</p>
                  {a.sources.map((s, k) => (
                    <p key={k}>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer">
                          {s.title} <ArrowLeft size={12} />
                        </a>
                      ) : (
                        s.title
                      )}
                      {s.checked_at ? (
                        <small>
                          آخرین بررسی: <bdi>{s.checked_at}</bdi>
                        </small>
                      ) : null}
                    </p>
                  ))}
                </details>
                <div className="area-links">
                  <a href={a.maps_url} target="_blank" rel="noreferrer">
                    <MapPin size={16} />
                    روی نقشه
                  </a>
                  <a href={a.directions_url} target="_blank" rel="noreferrer">
                    <Navigation size={16} />
                    مسیریابی
                  </a>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="area-empty">
          {data?.needs_category
            ? "نوع کالا را وارد کنید."
            : data
              ? "ناحیه‌ای پیدا نشد. دسته دقیق‌تری وارد کنید."
              : "دسته کالا را وارد کنید."}
        </p>
      )}
    </div>
  );
  return onClose ? (
    <Modal title="نواحی پیشنهادی خرید حضوری" wide onClose={onClose}>
      {content}
    </Modal>
  ) : (
    content
  );
}
