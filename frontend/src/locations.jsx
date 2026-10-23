import React, { useEffect, useState } from "react";
import { ArrowLeft, MapPin, RefreshCw } from "lucide-react";
import { Modal } from "./ui.jsx";
import "./locations.css";
const API = new URL("api/", document.baseURI).pathname;
async function api(path, body) {
  const r = await fetch(API + path, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json();
  if (!r.ok)
    throw Error(
      typeof d.detail === "string" ? d.detail : "بررسی آدرس انجام نشد",
    );
  return d;
}
const when = (t) =>
  t
    ? new Date(t * 1000).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })
    : "نامشخص";
const tags = {
  yes: "بله",
  no: "خیر",
  limited: "محدود",
  private: "خصوصی",
  customers: "مشتریان",
  permissive: "با اجازه مالک",
  main: "اصلی",
  service: "خدماتی",
  emergency: "اضطراری",
  exit: "خروج",
};
export function OpenMapContext({ sid, shop, onResolved }) {
  const [data, setData] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api(
      "locations/" +
        encodeURIComponent(shop.shop_id) +
        "?session_id=" +
        encodeURIComponent(sid),
    )
      .then((d) => {
        if (active) {
          setData(d);
          onResolved?.(d);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [sid, shop.shop_id]);
  async function enrich() {
    setBusy(true);
    setError("");
    try {
      const d = await api("locations/enrich", {
        session_id: sid,
        shop_id: shop.shop_id,
      });
      setData(d);
      onResolved?.(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const osm = data?.osm,
    features = osm?.features || [];
  const status = {
    not_requested: "هنوز نقشه اطراف بررسی نشده",
    ok: features.length
      ? "اطلاعات نقشه پیدا شد"
      : "در این محدوده، اطلاعات بیشتری در نقشه پیدا نشد",
    busy: "سرویس عمومی نقشه شلوغ است",
    unavailable: "سرویس عمومی نقشه فعلاً در دسترس نیست",
    daily_limit: "سقف استفاده روزانه آزمایشگاه رسیده است",
    no_coordinates: "مختصات معتبر برای بررسی نقشه موجود نیست",
  };
  return (
    <div className="free-location">
      <div className="free-location-head">
        <b>
          <MapPin size={15} />
          آدرس و اطراف · منابع رایگان
        </b>
        <button
          type="button"
          className="outline"
          disabled={busy}
          onClick={enrich}
        >
          <RefreshCw size={14} className={busy ? "spin" : ""} />
          {busy ? "بررسی نقشه…" : "تکمیل رایگان آدرس"}
        </button>
      </div>
      {data?.dataset ? (
        <div className="location-source">
          <b>از متن آدرس دیتاست</b>
          <p>
            طبقه: {data.dataset.floor || "در متن مشخص نیست"} · واحد:{" "}
            {data.dataset.unit || "در متن مشخص نیست"}
          </p>
          {data.dataset.building_hint ? (
            <p>نشانه ساختمان: {data.dataset.building_hint}</p>
          ) : null}
          {data.dataset.quotes.map((q, i) => (
            <q key={i}>{q.quote}</q>
          ))}
        </div>
      ) : null}
      {data?.seller ? (
        <div className="location-source seller">
          <b>از پاسخ لینک فروشنده</b>
          <p>
            {[
              data.seller.entrance,
              data.seller.floor && "طبقه " + data.seller.floor,
              data.seller.unit && "واحد " + data.seller.unit,
              data.seller.landmark,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p>
            بدون پله: {data.seller.step_free || "نامشخص"} · آسانسور:{" "}
            {data.seller.elevator || "نامشخص"}
          </p>
          <small>
            ثبت {when(data.seller.reported_at)} · هویت مستقل تأیید نشده
          </small>
        </div>
      ) : null}
      <p className="location-status" role="status">
        {status[osm?.status || "not_requested"]}
        {osm?.cache_hit ? " · نسخه ذخیره‌شده" : ""}
        {osm?.stale ? " · قدیمی؛ دریافت تازه انجام نشد" : ""}
      </p>
      {features.length ? (
        <>
          <p className="location-caution">اطلاعات ساختمان‌های اطراف</p>
          <div className="location-features">
            {features.map((f) => (
              <article key={f.osm_id}>
                <div>
                  <b>{f.title}</b>
                  <small>
                    {Number(f.distance_m).toLocaleString("fa-IR")} متر مستقیم
                  </small>
                </div>
                <p>
                  {f.relationship === "coordinate_within_building"
                    ? "فروشگاه در محدوده این ساختمان"
                    : f.relationship === "entrance_of_enclosing_building"
                      ? "ورودی ثبت‌شده ساختمان"
                      : "ساختمان نزدیک؛ ارتباط با فروشگاه نامشخص"}
                </p>
                {f.entrance_kind ? (
                  <p>
                    نوع ورودی در نقشه:{" "}
                    {tags[f.entrance_kind] || f.entrance_kind}
                    {f.ref ? " · شناسه " + f.ref : ""}
                  </p>
                ) : null}
                {f.level || f.unit ? (
                  <p>
                    طبقه/واحد همین عارضه نقشه: {f.level ?? "نامشخص"} /{" "}
                    {f.unit ?? "نامشخص"}
                  </p>
                ) : null}
                {f.building_levels ? (
                  <p>تعداد طبقات ساختمان: {f.building_levels}</p>
                ) : null}
                {f.wheelchair || f.access ? (
                  <p>
                    دسترسی همین عارضه:{" "}
                    {f.wheelchair
                      ? "ویلچر " + (tags[f.wheelchair] || f.wheelchair)
                      : ""}{" "}
                    {f.access ? " · ورود " + (tags[f.access] || f.access) : ""}
                  </p>
                ) : null}
                <div className="location-links">
                  <a href={f.source_url} target="_blank" rel="noreferrer">
                    مشاهده منبع OSM <ArrowLeft size={12} />
                  </a>
                  <a href={f.map_url} target="_blank" rel="noreferrer">
                    نمایش نقطه روی نقشه
                  </a>
                  {f.image_url ? (
                    <a href={f.image_url} target="_blank" rel="noreferrer">
                      عکس ثبت‌شده در نقشه
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
      {osm?.fetched_at ? (
        <small>دریافت نقشه: {when(osm.fetched_at)}</small>
      ) : null}
      <a
        className="osm-attribution"
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
      >
        © OpenStreetMap contributors · ODbL
      </a>
      {error ? (
        <p className="feature-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
export function LocationPanel({ sid, offer, onClose }) {
  return (
    <Modal title="آدرس، ورودی و اطراف فروشگاه" onClose={onClose} wide>
      <h3>{offer.shop_name || offer.name}</h3>
      <p className="location-original">{offer.address}</p>
      <OpenMapContext sid={sid} shop={offer} />
    </Modal>
  );
}
