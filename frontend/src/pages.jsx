import React, { useEffect, useRef, useState } from "react";
import { FollowUpTracker } from "./followup";
import PurchaseChecklist from "./purchase-checklist.jsx";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowRight,
  Clock,
  CreditCard,
  ArrowLeft,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
  Printer,
  Route,
  ShoppingBag,
  Store,
  Trash2,
  TriangleAlert,
  Wallet,
  Building2,
  Globe,
  Instagram,
  Check,
  MessageCircle,
  Footprints,
  LocateFixed,
} from "lucide-react";
import { call } from "./features.jsx";

export const money = (n) =>
  n == null ? "نامشخص" : Number(n).toLocaleString("fa-IR");
export const num = (n) => Number(n).toLocaleString("fa-IR");
const price = (o) => o.effective_price_toman ?? o.price_toman ?? 0;
const DAYS = [
  ["sat", "شنبه"],
  ["sun", "یکشنبه"],
  ["mon", "دوشنبه"],
  ["tue", "سه‌شنبه"],
  ["wed", "چهارشنبه"],
  ["thu", "پنجشنبه"],
  ["fri", "جمعه"],
];
const hhmm = (t) => String(t || "").slice(0, 5);
const fa = (t) => t.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

/** Fields of an offer worth keeping in the saved plan (localStorage). */
export function planEntry(o) {
  const keep = [
    "offer_id",
    "product_id",
    "shop_id",
    "persian_title",
    "category_name",
    "shop_name",
    "address",
    "location_label",
    "lat",
    "lon",
    "effective_price_toman",
    "price_toman",
    "image_urls",
    "in_person_credit",
    "opening",
    "distance_km",
    "last_price_changed_at",
    "price_basis",
  ];
  const e = Object.fromEntries(keep.map((k) => [k, o[k]]));
  e.image_urls = (o.image_urls || []).slice(0, 1);
  e.quantity = 1;
  return e;
}

function Thumb({ src, size = 56 }) {
  const [bad, setBad] = useState(false);
  return (
    <div className="thumb" style={{ width: size, height: size }}>
      {src && !bad ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBad(true)}
        />
      ) : (
        <ShoppingBag size={size * 0.4} />
      )}
    </div>
  );
}

export function OfferRow({ o, inPlan, onPlan, onContact }) {
  return (
    <div className="offer-row">
      <Thumb src={o.image_urls?.[0]} />
      <div className="offer-row-body">
        <b>{o.persian_title}</b>
        <span>{o.category_name}</span>
      </div>
      <div className="offer-row-price">
        <b>{money(price(o))}</b>
        <small>تومان</small>
      </div>
      <div className="offer-row-actions">
        {onContact ? (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onContact(o)}
            title="پرسش از فروشنده"
          >
            <MessageCircle size={16} />
          </button>
        ) : null}
        <button
          className={"btn btn-sm " + (inPlan ? "btn-soft" : "btn-primary")}
          onClick={() => onPlan(o)}
        >
          {inPlan ? (
            <>
              <Check size={15} />
              در برنامه
            </>
          ) : (
            <>
              <Plus size={15} />
              برنامه
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function MiniMap({ lat, lon, label }) {
  const box = useRef(null);
  useEffect(() => {
    if (lat == null || lon == null) return;
    const m = L.map(box.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
    }).setView([lat, lon], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(m);
    L.marker([lat, lon], {
      icon: L.divIcon({
        className: "pin",
        html: '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M3 9l1-5h16l1 5"/><path d="M5 9v11h14V9"/></svg></span>',
        iconSize: [34, 40],
        iconAnchor: [17, 40],
      }),
    }).addTo(m);
    return () => m.remove();
  }, [lat, lon]);
  if (lat == null || lon == null) return null;
  return (
    <div
      className="mini-map"
      ref={box}
      role="img"
      aria-label={"موقعیت " + label}
    />
  );
}

function SkeletonLines({ rows = 3 }) {
  return (
    <div className="skeleton-block">
      {Array.from({ length: rows }, (_, i) => (
        <span
          key={i}
          className="skeleton"
          style={{ width: 90 - i * 15 + "%" }}
        />
      ))}
    </div>
  );
}

export function ShopPage({
  sid,
  shopId,
  query,
  planIds,
  onPlan,
  onContact,
  onBack,
  onRoute,
}) {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    setData(null);
    setError("");
    call(
      "shops/" +
        encodeURIComponent(shopId) +
        "?session_id=" +
        encodeURIComponent(sid) +
        "&query=" +
        encodeURIComponent(query || ""),
    )
      .then((d) => {
        if (live) setData(d);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [shopId, sid, query]);
  if (error)
    return (
      <div className="page shop-page">
        <button className="back-link" onClick={onBack}>
          <ArrowRight size={18} />
          بازگشت
        </button>
        <div className="empty">
          <TriangleAlert size={34} />
          <h3>{error}</h3>
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="page shop-page">
        <button className="back-link" onClick={onBack}>
          <ArrowRight size={18} />
          بازگشت
        </button>
        <div className="shop-hero skeleton-hero">
          <span className="skeleton circle" />
          <SkeletonLines rows={3} />
        </div>
        <div className="shop-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="panel">
              <SkeletonLines rows={4} />
            </div>
          ))}
        </div>
      </div>
    );
  const s = data.shop,
    loc = data.location?.dataset || {},
    open = s.opening || {},
    credit = (s.payment_options || []).filter((p) => p.channel === "in_person");
  const hours = s.weekly_hours || {};
  return (
    <div className="page shop-page">
      <button className="back-link" onClick={onBack}>
        <ArrowRight size={18} />
        بازگشت
      </button>
      <header className="shop-hero">
        <div className="shop-avatar">
          <Store size={30} />
        </div>
        <div className="shop-hero-text">
          <h1>{s.name}</h1>
          <p>
            <MapPin size={15} />
            {s.location_label || "تهران"}
            {data.offer_count
              ? " · " + num(data.offer_count) + " کالا در ترب"
              : ""}
          </p>
          <div className="badges">
            <span
              className={
                "badge " +
                (open.state === "open"
                  ? "badge-green"
                  : open.state === "closed"
                    ? "badge-red"
                    : "")
              }
            >
              <Clock size={13} />
              {open.label || "ساعت کاری نامشخص"}
            </span>
            {credit.length ? (
              <span className="badge badge-blue">
                <Wallet size={13} />
                خرید اقساطی حضوری
              </span>
            ) : null}
            {s.supports_fast_delivery === "true" ||
            s.supports_fast_delivery === true ? (
              <span className="badge">ارسال سریع</span>
            ) : null}
          </div>
        </div>
        <div className="shop-hero-actions">
          <a
            className="btn btn-primary"
            href={data.directions_url}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation size={17} />
            مسیریابی
          </a>
          {onRoute ? (
            <button
              className="btn btn-ghost"
              onClick={() => onRoute(s.shop_id)}
            >
              <Route size={17} />
              زمان رسیدن
            </button>
          ) : null}
        </div>
      </header>
      <div className="shop-grid">
        <section className="panel">
          <h2>
            <Building2 size={18} />
            آدرس و ورود
          </h2>
          <p className="shop-address">{s.address}</p>
          <dl className="facts">
            <div>
              <dt>طبقه</dt>
              <dd>{loc.floor ? fa(String(loc.floor)) : "ثبت نشده"}</dd>
            </div>
            <div>
              <dt>واحد / پلاک</dt>
              <dd>
                {loc.unit
                  ? fa(String(loc.unit))
                  : s.address.match(/پلاک\s*([\d۰-۹]+)/)?.[1] || "ثبت نشده"}
              </dd>
            </div>
            {loc.building_hint ? (
              <div>
                <dt>ساختمان</dt>
                <dd>{loc.building_hint}</dd>
              </div>
            ) : null}
          </dl>
          <MiniMap lat={s.lat} lon={s.lon} label={s.name} />
          {data.location?.seller?.notes?.length ? (
            <p className="muted">{data.location.seller.notes.join(" · ")}</p>
          ) : null}
        </section>
        <section className="panel">
          <h2>
            <Clock size={18} />
            ساعت کاری
          </h2>
          <ul className="hours">
            {DAYS.map(([key, label]) => {
              const d = hours[key];
              const closed = d?.status === "closed";
              return (
                <li key={key} className={closed ? "closed" : ""}>
                  <span>{label}</span>
                  <b>
                    {closed
                      ? "تعطیل"
                      : d?.status === "declared"
                        ? (d.shifts || [])
                            .filter(
                              (x) => hhmm(x.start_time) !== hhmm(x.end_time),
                            )
                            .map(
                              (x) =>
                                fa(hhmm(x.start_time)) +
                                " تا " +
                                fa(hhmm(x.end_time)),
                            )
                            .join("، ") || "نامشخص"
                        : "نامشخص"}
                  </b>
                </li>
              );
            })}
          </ul>
          <p className="muted">
            برنامه ثبت‌شده در ترب؛ پیش از مراجعه تأیید کنید.
          </p>
        </section>
        <section className="panel">
          <h2>
            <CreditCard size={18} />
            روش‌های پرداخت
          </h2>
          <ul className="pay-list">
            <li>
              <CreditCard size={15} />
              روش پرداخت فقط مطابق اطلاعات ثبت‌شده قابل بررسی است
            </li>
            {credit.map((p, i) => (
              <li key={i}>
                <Wallet size={15} />
                {p.provider_name} · اقساط حضوری
                {p.min_price_toman || p.max_price_toman
                  ? " · خرید " +
                    (p.min_price_toman
                      ? "از " + money(p.min_price_toman)
                      : "") +
                    (p.max_price_toman
                      ? " تا " + money(p.max_price_toman)
                      : "") +
                    " تومان"
                  : ""}
              </li>
            ))}
          </ul>
          <h2 className="sub">
            <Phone size={18} />
            تماس
          </h2>
          <ul className="pay-list">
            {!s.website_url && !s.instagram ? (
              <li>راه ارتباطی ثبت نشده</li>
            ) : null}
            {s.website_url ? (
              <li>
                <Globe size={15} />
                <a
                  href={
                    s.website_url.startsWith("http")
                      ? s.website_url
                      : "https://" + s.website_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.website_url}
                </a>
              </li>
            ) : null}
            {s.instagram ? (
              <li>
                <Instagram size={15} />
                {s.instagram}
              </li>
            ) : null}
          </ul>
        </section>
      </div>
      {data.matching_offers.length ? (
        <section className="shop-offers">
          <h2>پیشنهادهای این فروشگاه برای «{data.query}»</h2>
          {data.matching_offers.map((o) => (
            <OfferRow
              key={o.offer_id}
              o={o}
              inPlan={planIds.has(o.offer_id)}
              onPlan={onPlan}
              onContact={onContact}
            />
          ))}
        </section>
      ) : null}
      {data.other_offers.length ? (
        <section className="shop-offers">
          <h2>
            {data.matching_offers.length
              ? "سایر کالاهای این فروشگاه"
              : "کالاهای این فروشگاه"}
          </h2>
          {data.other_offers.map((o) => (
            <OfferRow
              key={o.offer_id}
              o={o}
              inPlan={planIds.has(o.offer_id)}
              onPlan={onPlan}
              onContact={onContact}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}

export function PlanPage({
  sid,
  items,
  setItems,
  profile,
  route,
  setRoute,
  onShop,
  onContact,
  onMap,
  onOffline,
  onBasket,
  onTiming,
  onClear,
  showError,
}) {
  const [loading, setLoading] = useState(false);
  const shopIds = [...new Set(items.map((o) => o.shop_id))];
  const key = shopIds.join(",") + "|" + profile.lat + "," + profile.lon;
  useEffect(() => {
    if (!shopIds.length) {
      return;
    }
    let live = true;
    setLoading(true);
    const t = setTimeout(
      () =>
        call(
          "route",
          { session_id: sid, shop_ids: shopIds.slice(0, 4) },
          undefined,
          2,
        )
          .then((d) => {
            if (live) setRoute(d);
          })
          .catch((e) => {
            if (live) showError(e);
          })
          .finally(() => {
            if (live) setLoading(false);
          }),
      350,
    );
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [key, sid]);
  // Seller updates (one-tap link, shop website, agreeing shoppers) flow back into the plan.
  useEffect(() => {
    if (!items.length) return;
    let live = true;
    const ids = items.map((o) => o.offer_id).slice(0, 30);
    const pull = () =>
      call("offers/refresh", { session_id: sid, offer_ids: ids })
        .then((d) => {
          if (!live) return;
          const by = Object.fromEntries(d.offers.map((o) => [o.offer_id, o]));
          setItems((list) =>
            list.map((o) =>
              by[o.offer_id]
                ? {
                    ...o,
                    ...Object.fromEntries(
                      [
                        "effective_price_toman",
                        "price_basis",
                        "price_age_days",
                        "freshness_label",
                        "price_confirmed_today",
                        "price_confirmed_at",
                        "price_estimate",
                        "price_stale",
                        "availability",
                      ].map((k) => [k, by[o.offer_id][k]]),
                    ),
                  }
                : o,
            ),
          );
        })
        .catch(() => {});
    pull();
    window.addEventListener("focus", pull);
    return () => {
      live = false;
      window.removeEventListener("focus", pull);
    };
  }, [sid, items.map((o) => o.offer_id).join(",")]);
  const stops = route?.stops?.length
    ? route.stops
    : shopIds.map((id) => {
        const o = items.find((x) => x.shop_id === id);
        return {
          shop_id: id,
          name: o.shop_name,
          address: o.address,
          opening: o.opening || {},
        };
      });
  const ordered = [
    ...stops,
    ...shopIds
      .filter((id) => !stops.some((s) => s.shop_id === id))
      .map((id) => {
        const o = items.find((x) => x.shop_id === id);
        return {
          shop_id: id,
          name: o.shop_name,
          address: o.address,
          opening: o.opening || {},
        };
      }),
  ];
  const total = items.reduce((sum, o) => sum + price(o) * (o.quantity || 1), 0);
  const km =
    route?.road_km ??
    (route?.stops || []).reduce((s, x) => s + (x.leg_straight_km || 0), 0);
  const located = ordered.filter((s) => s.lat != null);
  const dirUrl =
    route?.google_maps_url ||
    (located.length
      ? "https://www.google.com/maps/dir/?api=1&destination=" +
        located.at(-1).lat +
        "," +
        located.at(-1).lon +
        (located.length > 1
          ? "&waypoints=" +
            encodeURIComponent(
              located
                .slice(0, -1)
                .map((s) => s.lat + "," + s.lon)
                .join("|"),
            )
          : "")
      : null);
  const setQty = (id, d) =>
    setItems((list) =>
      list.map((o) =>
        o.offer_id === id
          ? { ...o, quantity: Math.max(1, Math.min(20, (o.quantity || 1) + d)) }
          : o,
      ),
    );
  const remove = (id) =>
    setItems((list) => list.filter((o) => o.offer_id !== id));
  if (!items.length && !route?.stops?.length)
    return (
      <div className="page plan-page">
        <header className="page-head">
          <div>
            <h1>آماده حرکت</h1>
          </div>
        </header>
        <div className="empty big">
          <h3>هنوز برنامه‌ای نساخته‌اید</h3>
          <p>یک محصول به برنامه اضافه کنید.</p>
          <div className="row-gap">
            <button className="btn btn-primary" onClick={onMap}>
              <MapPin size={17} />
              انتخاب فروشگاه
            </button>
            <button className="btn btn-ghost" onClick={onBasket}>
              <ShoppingBag size={17} />
              سبد خرید
            </button>
          </div>
        </div>
      </div>
    );
  return (
    <div className="page plan-page">
      <header className="page-head">
        <div>
          <h1>آماده حرکت</h1>
          <p>
            {num(items.length)} کالا · {num(ordered.length)} توقف
            {shopIds.length > 4 ? " · فقط ۴ فروشگاه اول در مسیر" : ""}
          </p>
        </div>
        <div className="row-gap">
          <button className="btn btn-ghost btn-sm" onClick={onTiming}>
            <Clock size={15} />
            مهلت و زمان‌ها
          </button>
          <button className="btn btn-ghost btn-sm danger" onClick={onClear}>
            <Trash2 size={15} />
            پاک کردن
          </button>
        </div>
      </header>
      <div className="plan-layout">
        <ol className="plan-stops">
          {ordered.map((s, i) => {
            const stopItems = items.filter((o) => o.shop_id === s.shop_id);
            const sub = stopItems.reduce(
              (a, o) => a + price(o) * (o.quantity || 1),
              0,
            );
            return (
              <li key={s.shop_id} className="plan-stop" style={{ "--i": i }}>
                <div className="stop-rail">
                  <span className="stop-num">{num(i + 1)}</span>
                  {i < ordered.length - 1 ? (
                    <span className="stop-line" />
                  ) : null}
                </div>
                <div className="stop-card">
                  <div className="stop-head">
                    <button
                      className="stop-name"
                      onClick={() => onShop(s.shop_id)}
                    >
                      <Store size={16} />
                      {s.name}
                    </button>
                    <span
                      className={
                        "badge " +
                        ((s.opening_at_arrival || s.opening || {}).state ===
                        "open"
                          ? "badge-green"
                          : (s.opening_at_arrival || s.opening || {}).state ===
                              "closed"
                            ? "badge-red"
                            : "")
                      }
                    >
                      <Clock size={12} />
                      {(s.opening_at_arrival || s.opening || {}).label ||
                        "ساعت نامشخص"}
                    </span>
                  </div>
                  <p className="stop-address">
                    <MapPin size={14} />
                    {s.address}
                  </p>
                  <div className="stop-meta">
                    {s.arrival_at ? (
                      <span>
                        رسیدن حدود{" "}
                        {new Date(s.arrival_at).toLocaleTimeString("fa-IR", {
                          timeZone: "Asia/Tehran",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : null}
                    {s.leg_straight_km != null ? (
                      <span>
                        {money(s.leg_straight_km.toFixed(1))} کیلومتر از توقف
                        قبل
                      </span>
                    ) : null}
                  </div>
                  {stopItems.length ? (
                    <ul className="stop-items">
                      {stopItems.map((o) => (
                        <li key={o.offer_id}>
                          <Thumb src={o.image_urls?.[0]} size={44} />
                          <div className="stop-item-text">
                            <b>{o.persian_title}</b>
                            <span>
                              {money(price(o))} تومان · آخرین تغییر:{" "}
                              {o.last_price_changed_at
                                ? new Date(
                                    o.last_price_changed_at,
                                  ).toLocaleDateString("fa-IR", {
                                    timeZone: "Asia/Tehran",
                                  })
                                : "نامشخص"}
                              {o.price_confirmed_today ? (
                                <em className="badge badge-fresh">
                                  قیمت تأییدشده امروز
                                </em>
                              ) : null}
                            </span>
                            {o.price_estimate && !o.price_confirmed_today ? (
                              <small className="offer-estimate">
                                {o.price_estimate.text}
                              </small>
                            ) : null}
                          </div>
                          <div className="qty">
                            <button
                              aria-label="کم کردن"
                              onClick={() => setQty(o.offer_id, -1)}
                            >
                              <Minus size={14} />
                            </button>
                            <span>{num(o.quantity || 1)}</span>
                            <button
                              aria-label="زیاد کردن"
                              onClick={() => setQty(o.offer_id, 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            className="icon-btn"
                            aria-label="حذف از برنامه"
                            onClick={() => remove(o.offer_id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">
                      کالایی برای این توقف انتخاب نشده است.
                    </p>
                  )}
                  <div className="stop-foot">
                    <span>
                      جمع این توقف <b>{money(sub)} تومان</b>
                    </span>
                    <div className="row-gap">
                      {stopItems[0] ? (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => onContact(stopItems[0])}
                        >
                          <MessageCircle size={15} />
                          تأیید قیمت و موجودی
                        </button>
                      ) : null}
                      <a
                        className="btn btn-ghost btn-sm"
                        href={
                          s.maps_url ||
                          "https://www.google.com/maps/search/?api=1&query=" +
                            encodeURIComponent(s.address + " تهران")
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ArrowLeft size={14} />
                        نقشه
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <aside className="plan-summary">
          <div className="summary-card">
            <h2>خلاصه برنامه</h2>
            <div className="sum-row">
              <span>جمع کالاها</span>
              <b>
                {money(total)} <small>تومان</small>
              </b>
            </div>
            <div className="sum-row">
              <span>تعداد توقف</span>
              <b>{num(ordered.length)}</b>
            </div>
            <div className="sum-row">
              <span>
                {route?.road_km != null
                  ? "مسافت جاده‌ای"
                  : "مسافت مستقیم تقریبی"}
              </span>
              <b>{km ? money(Number(km).toFixed(1)) + " کیلومتر" : "—"}</b>
            </div>
            {route?.travel_minutes != null ? (
              <div className="sum-row">
                <span>زمان رانندگی (بدون ترافیک زنده)</span>
                <b>{num(Math.round(route.travel_minutes))} دقیقه</b>
              </div>
            ) : null}
            {route?.finish_at ? (
              <div className="sum-row">
                <span>پایان تقریبی خرید</span>
                <b>
                  {new Date(route.finish_at).toLocaleTimeString("fa-IR", {
                    timeZone: "Asia/Tehran",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </b>
              </div>
            ) : null}
            {route?.feasible === true ? (
              <p className="ok-line">
                <Check size={15} />
                برنامه با ساعت کاری و مهلت شما جور است.
              </p>
            ) : null}
            {loading ? (
              <div className="sum-loading">
                <span className="dots">
                  <i />
                  <i />
                  <i />
                </span>
                محاسبه ترتیب و زمان مسیر…
              </div>
            ) : null}
            {dirUrl ? (
              <a
                className="btn btn-primary btn-block"
                href={dirUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation size={18} />
                مسیریابی در گوگل مپ
              </a>
            ) : null}
            <button className="btn btn-ghost btn-block" onClick={onMap}>
              <LocateFixed size={17} />
              {profile.lat != null ? "تغییر نقطه شروع" : "انتخاب مبدأ"}
            </button>
            <button className="btn btn-ghost btn-block" onClick={onOffline}>
              <Footprints size={17} />
              شروع سفر
            </button>
            <button
              className="btn btn-ghost btn-block"
              onClick={() => window.print()}
            >
              <Printer size={17} />
              چاپ برنامه
            </button>
          </div>
          {route?.skipped_stops?.map((s) => (
            <div key={s.shop_id} className="reminder warn">
              <TriangleAlert size={18} />
              <div>
                <b>{s.name} از مسیر حذف شد</b>
                <p>{s.reason}</p>
              </div>
            </div>
          ))}
          {route?.warning ? <p className="muted">{route.warning}</p> : null}
          {route?.problems?.length ? (
            <div className="reminder warn">
              <TriangleAlert size={18} />
              <div>
                {route.problems.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ) : null}
          {route?.unknowns?.length ? (
            <ul className="unknowns">
              {route.unknowns.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
            </ul>
          ) : null}
          <PurchaseChecklist sid={sid} items={items} />
          <FollowUpTracker
            sid={sid}
            stops={ordered}
            items={items}
            departure={route?.departure_at}
            onContact={onContact}
          />
        </aside>
      </div>
    </div>
  );
}

const SOURCE_LABEL = {
  catalogue: "ترب",
  listing_title: "عنوان آگهی",
  public_spec: "منبع آنلاین",
};
const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};
function SpecValue({ cell, unit }) {
  const web = cell.source === "public_spec";
  const ev = (cell.research_evidence || []).filter(
    (e) => e.status === "accepted",
  );
  const shown =
    cell.numeric != null && unit
      ? Number(cell.numeric).toLocaleString("fa-IR", {
          maximumFractionDigits: 3,
        }) +
        " " +
        (UNIT_FA[unit] || unit)
      : cell.value;
  return (
    <div
      className={
        "spec-val" + (web ? " web" : "") + (cell.pending ? " pending" : "")
      }
    >
      <span dir="auto">{cell.pending ? "در حال جست‌وجو در وب…" : shown}</span>
      {web ? (
        <small className="spec-src">
          🌐{" "}
          {ev.slice(0, 2).map((e, i) => (
            <a
              key={i}
              href={e.url}
              target="_blank"
              rel="noreferrer"
              title={e.quote}
            >
              {host(e.url)}
            </a>
          ))}
        </small>
      ) : cell.status === "missing" || cell.pending ? null : (
        <small className="spec-src muted">
          {SOURCE_LABEL[cell.source] || "ترب"}
        </small>
      )}
    </div>
  );
}
const UNIT_FA = {
  GB: "گیگابایت",
  kg: "کیلوگرم",
  g: "گرم",
  inch: "اینچ",
  Hz: "هرتز",
  Wh: "وات‌ساعت",
  mAh: "میلی‌آمپرساعت",
  mm: "میلی‌متر",
  cm: "سانتی‌متر",
  m: "متر",
  mm2: "میلی‌متر مربع",
  V: "ولت",
  A: "آمپر",
  W: "وات",
  L: "لیتر",
  bar: "بار",
  ohm: "اهم",
  MP: "مگاپیکسل",
  dB: "دسی‌بل",
  lm: "لومن",
  K: "کلوین",
  rpm: "دور در دقیقه",
  ms: "میلی‌ثانیه",
  h: "ساعت",
  GHz: "گیگاهرتز",
  core: "هسته",
};

export function ProductPage({
  sid,
  productId,
  planIds,
  onPlan,
  onContact,
  onShop,
  onBack,
  onReview,
  onCompare,
}) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [job, setJob] = useState(null),
    [img, setImg] = useState(0),
    [showRaw, setShowRaw] = useState(false);
  useEffect(() => {
    let live = true;
    setData(null);
    setError("");
    setJob(null);
    setImg(0);
    call(
      "products/" +
        encodeURIComponent(productId) +
        "?session_id=" +
        encodeURIComponent(sid),
    )
      .then((d) => {
        if (live) setData(d);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    (async () => {
      try {
        let j = await call(
          "products/" +
            encodeURIComponent(productId) +
            "/specs?session_id=" +
            encodeURIComponent(sid),
          {},
        );
        if (!live) return;
        setJob(j);
        for (
          let n = 0;
          n < 600 && live && ["running", "retry_queued"].includes(j.status);
          n++
        ) {
          await new Promise((r) =>
            setTimeout(r, j.status === "retry_queued" ? 4000 : 1300),
          );
          j = await call(
            "products/specs/" + j.id + "?session_id=" + encodeURIComponent(sid),
          );
          if (live) setJob(j);
        }
      } catch {}
    })();
    return () => {
      live = false;
    };
  }, [productId, sid]);
  if (error)
    return (
      <div className="page">
        <button className="back-link" onClick={onBack}>
          <ArrowRight size={18} />
          بازگشت
        </button>
        <div className="empty">
          <TriangleAlert size={34} />
          <h3>{error}</h3>
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="page product-page">
        <button className="back-link" onClick={onBack}>
          <ArrowRight size={18} />
          بازگشت
        </button>
        <div className="product-hero">
          <span
            className="skeleton"
            style={{ width: "100%", height: 260, borderRadius: 20 }}
          />
          <SkeletonLines rows={5} />
        </div>
      </div>
    );
  const p = data.product,
    images = (p.image_urls || []).slice(0, 8),
    table = job?.result || job?.preview,
    rows = (table?.rows || []).filter((r) => r.id !== "price");
  const filled = rows.filter((r) =>
      ["recorded", "conflict", "web_completed"].includes(r.cells[0]?.status),
    ).length,
    web = rows.filter((r) => r.cells[0]?.status === "web_completed").length;
  const best = data.offers[0];
  return (
    <div className="page product-page">
      <button className="back-link" onClick={onBack}>
        <ArrowRight size={18} />
        بازگشت
      </button>
      <section className="product-hero">
        <div className="gallery">
          <div className="gallery-main">
            {images[img] ? (
              <img
                src={images[img]}
                alt={p.persian_title}
                referrerPolicy="no-referrer"
              />
            ) : (
              <ShoppingBag size={60} />
            )}
          </div>
          {images.length > 1 ? (
            <div className="gallery-thumbs">
              {images.map((u, i) => (
                <button
                  key={u}
                  className={i === img ? "on" : ""}
                  onClick={() => setImg(i)}
                  aria-label={"تصویر " + num(i + 1)}
                >
                  <img
                    src={u}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="product-info">
          <span className="offer-cat">
            {p.category_name}
            {p.brand_name && p.brand_name !== "null"
              ? " · " + p.brand_name
              : ""}
          </span>
          <h1>{p.persian_title}</h1>
          <div className="price-range">
            {data.price_min != null ? (
              <>
                <b>{money(data.price_min)}</b>
                {data.price_max > data.price_min ? (
                  <>
                    {" "}
                    تا <b>{money(data.price_max)}</b>
                  </>
                ) : null}{" "}
                <small>تومان</small>
              </>
            ) : (
              <span className="muted">قیمت ثبت‌شده‌ای نیست</span>
            )}
          </div>
          <p className="muted">
            {num(data.seller_count)} فروشنده در تهران · قیمت‌ها ثبت‌شده در
            ترب‌اند، نه زنده
          </p>
          <div className="row-gap">
            {best ? (
              <button
                className={
                  "btn " +
                  (planIds.has(best.offer_id) ? "btn-soft" : "btn-primary")
                }
                onClick={() => onPlan(best)}
              >
                {planIds.has(best.offer_id) ? (
                  <>
                    <Check size={16} />
                    در برنامه
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    ارزان‌ترین را به برنامه اضافه کن
                  </>
                )}
              </button>
            ) : null}
            <button className="btn btn-ghost" onClick={onReview}>
              <MessageCircle size={16} />
              بررسی و نقد
            </button>
            {onCompare ? (
              <button className="btn btn-ghost" onClick={onCompare}>
                افزودن به مقایسه
              </button>
            ) : null}
          </div>
        </div>
      </section>
      <div className="product-grid">
        <section className="panel spec-panel">
          <h2>
            <ShieldIcon />
            مشخصات
          </h2>
          {job?.status === "retry_queued" ? (
            <p className="muted retry-queued">
              ⏳ {job.message || "در صف تلاش مجدد"}
            </p>
          ) : null}
          {job?.status === "running" ? (
            <div className="spec-progress mini">
              <div className="spec-progress-bar">
                <span
                  style={{
                    width:
                      (rows.length
                        ? Math.max(15, Math.round((filled / rows.length) * 100))
                        : 10) + "%",
                  }}
                />
              </div>
              <small>
                {rows.length
                  ? num(filled) +
                    " از " +
                    num(rows.length) +
                    " مشخصه پر است" +
                    (web ? " · " + num(web) + " از وب" : "") +
                    " · در حال تکمیل از وب…"
                  : "در حال یکسان‌سازی مشخصات…"}
              </small>
            </div>
          ) : null}
          {rows.length ? (
            <dl className="spec-table">
              {rows
                .filter(
                  (r) =>
                    r.cells[0] &&
                    (r.cells[0].status !== "missing" ||
                      r.cells[0].pending ||
                      r.core),
                )
                .map((r) => (
                  <div key={r.id} className={r.cells[0].status}>
                    <dt>{r.label}</dt>
                    <dd>
                      <SpecValue cell={r.cells[0]} unit={r.unit} />
                    </dd>
                  </div>
                ))}
            </dl>
          ) : job &&
            !["running", "retry_queued"].includes(job.status) ? null : (
            <SkeletonLines rows={6} />
          )}
          {job && job.status !== "running" && web ? (
            <p className="muted">
              🌐 {num(web)} مشخصه در دیتاست ترب نبود و از منابع آنلاین (با لینک
              منبع) تکمیل شد.
            </p>
          ) : null}
          {data.sections.length ? (
            <details
              className="raw-specs"
              open={!rows.length && job?.status !== "running"}
              onToggle={(e) => setShowRaw(e.target.open)}
            >
              <summary>
                مشخصات خام ثبت‌شده در ترب (
                {num(data.sections.reduce((a, s) => a + s.specs.length, 0))})
              </summary>
              {data.sections.map((s) => (
                <div key={s.title}>
                  <h3>{s.title}</h3>
                  <dl className="spec-table raw">
                    {s.specs.map((x, i) => (
                      <div key={i}>
                        <dt>{x.key}</dt>
                        <dd dir="auto">{x.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </details>
          ) : null}
        </section>
        <section className="panel sellers-panel">
          <h2>
            <Store size={18} />
            فروشندگان ({num(data.offers.length)})
          </h2>
          {data.offers.length ? (
            data.offers.map((o) => (
              <div key={o.offer_id} className="seller-row">
                <button
                  className="seller-main"
                  onClick={() => onShop(o.shop_id)}
                >
                  <b>{o.shop_name}</b>
                  <small>
                    {o.location_label || o.address}
                    {o.distance_km != null
                      ? " · " + money(o.distance_km) + " کیلومتر"
                      : ""}
                  </small>
                  <span className="badges">
                    <span
                      className={
                        "badge " +
                        (o.opening?.state === "open"
                          ? "badge-green"
                          : o.opening?.state === "closed"
                            ? "badge-red"
                            : "")
                      }
                    >
                      <Clock size={12} />
                      {o.opening?.label || "نامشخص"}
                    </span>
                    {o.in_person_credit?.length ? (
                      <span className="badge badge-blue">
                        <Wallet size={12} />
                        اقساطی
                      </span>
                    ) : null}
                  </span>
                </button>
                <div className="seller-side">
                  <b>
                    {money(o.effective_price_toman ?? o.price_toman)}{" "}
                    <small>تومان</small>
                  </b>
                  <div className="row-gap">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onContact(o)}
                      aria-label="پرسش از فروشنده"
                    >
                      <MessageCircle size={15} />
                    </button>
                    <button
                      className={
                        "btn btn-sm " +
                        (planIds.has(o.offer_id) ? "btn-soft" : "btn-primary")
                      }
                      onClick={() => onPlan(o)}
                    >
                      {planIds.has(o.offer_id) ? (
                        <Check size={15} />
                      ) : (
                        <Plus size={15} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">با شرایط فعلی فروشنده‌ای در دیتاست نیست.</p>
          )}
        </section>
      </div>
      <UserReviews sid={sid} productId={productId} />
    </div>
  );
}
function ShieldIcon() {
  return <Building2 size={18} />;
}

const REVIEW_STAGES = {
  digikala_search: "جست‌وجوی کالا در دیجی‌کالا",
  digikala_reviews: "خواندن نظرهای خریداران",
  web_reviews: "جست‌وجوی نظرهای خریداران خارجی",
  summary: "جمع‌بندی و ترجمه نظرها",
};
function RatingScore({ value }) {
  return <span className="rating-score">امتیاز {num(value)} از ۵</span>;
}
function ReviewCard({ r }) {
  const [open, setOpen] = useState(false),
    [orig, setOrig] = useState(false);
  const long = (r.fa || r.text).length > 260;
  const body = r.source === "digikala" ? r.text : r.fa || r.text;
  return (
    <article className={"review" + (r.source === "digikala" ? "" : " foreign")}>
      <div className="review-head">
        {r.rate ? <RatingScore value={r.rate} /> : null}
        {r.source === "digikala" ? (
          <span className="badge">دیجی‌کالا{r.buyer ? " · خریدار" : ""}</span>
        ) : (
          <a
            className="badge badge-blue"
            href={r.url}
            target="_blank"
            rel="noreferrer"
          >
            🌐 {r.source}
          </a>
        )}
        {r.lang === "en" ? (
          <span className="badge badge-violet">ترجمه از انگلیسی</span>
        ) : null}
        {r.sentiment ? (
          <span
            className={
              "badge " +
              (r.sentiment === "positive"
                ? "badge-green"
                : r.sentiment === "negative"
                  ? "badge-red"
                  : "")
            }
          >
            {
              {
                positive: "مثبت",
                negative: "منفی",
                mixed: "متفاوت",
                neutral: "خنثی",
              }[r.sentiment]
            }
          </span>
        ) : null}
        <small className="review-date">{r.date}</small>
      </div>
      {r.title && r.source === "digikala" ? (
        <b className="review-title">{r.title}</b>
      ) : null}
      <p className={"review-body" + (open || !long ? "" : " clamp")} dir="auto">
        {body}
      </p>
      {long ? (
        <button className="text-btn" onClick={() => setOpen(!open)}>
          {open ? "کمتر" : "ادامه نظر"}
        </button>
      ) : null}
      {r.pros?.length || r.cons?.length ? (
        <div className="review-pc">
          {r.pros?.map((x) => (
            <span key={x} className="pc pro">
              + {x}
            </span>
          ))}
          {r.cons?.map((x) => (
            <span key={x} className="pc con">
              − {x}
            </span>
          ))}
        </div>
      ) : null}
      {r.lang === "en" ? (
        <details
          className="review-orig"
          onToggle={(e) => setOrig(e.target.open)}
        >
          <summary>متن اصلی (انگلیسی)</summary>
          <p dir="ltr">{r.display || r.text}</p>
        </details>
      ) : null}
      {r.likes ? (
        <small className="muted">
          {num(r.likes)} نفر این نظر را مفید دانستند
        </small>
      ) : null}
    </article>
  );
}
export function UserReviews({ sid, productId }) {
  const [job, setJob] = useState(null),
    [tab, setTab] = useState("all"),
    [focus, setFocus] = useState(null),
    [shown, setShown] = useState(8);
  useEffect(() => {
    let live = true;
    setJob(null);
    setFocus(null);
    setShown(8);
    // A failed poll is retried; only a job that really ended as failed (or 6 errors in a row) shows the failure state.
    (async () => {
      const base =
        "products/" +
        encodeURIComponent(productId) +
        "/reviews?session_id=" +
        encodeURIComponent(sid);
      let j = null,
        errors = 0;
      for (let n = 0; n < 600 && live; n++) {
        try {
          j = await call(base, j ? undefined : {}, undefined, j ? 2 : 1);
          errors = 0;
          if (!live) return;
          setJob(j);
          if (!["running", "retry_queued"].includes(j.status)) return;
        } catch {
          if (++errors >= 6) {
            if (live) setJob({ status: "failed" });
            return;
          }
        }
        await new Promise((r) =>
          setTimeout(
            r,
            errors ? 2500 : j?.status === "retry_queued" ? 4000 : 1500,
          ),
        );
      }
    })();
    return () => {
      live = false;
    };
  }, [productId, sid]);
  const r = job?.result;
  const last = (job?.progress || []).slice(-1)[0];
  if (job?.status === "retry_queued")
    return (
      <section className="panel reviews-panel">
        <h2>
          <MessageCircle size={18} />
          نظرات خریداران
        </h2>
        <p className="muted retry-queued">
          ⏳ {job.message || "در صف تلاش مجدد"}
        </p>
        <SkeletonLines rows={3} />
      </section>
    );
  if (!job || job.status === "running")
    return (
      <section className="panel reviews-panel">
        <h2>
          <MessageCircle size={18} />
          نظرات خریداران
        </h2>
        <div className="spec-progress mini">
          <div className="spec-progress-bar">
            <span
              style={{
                width:
                  ({
                    digikala_search: 15,
                    digikala_reviews: 40,
                    web_reviews: 55,
                    summary: 85,
                  }[last?.stage] || 8) + "%",
              }}
            />
          </div>
          <small>
            {REVIEW_STAGES[last?.stage] || "آماده‌سازی…"} · نظرها از دیجی‌کالا و
            منابع خارجی خوانده و ترجمه می‌شوند
          </small>
        </div>
        <SkeletonLines rows={4} />
      </section>
    );
  if (job.status === "failed" || !r)
    return (
      <section className="panel reviews-panel">
        <h2>
          <MessageCircle size={18} />
          نظرات خریداران
        </h2>
        <p className="muted">
          دریافت نظرها کامل نشد؛ بعداً دوباره امتحان کنید.
        </p>
      </section>
    );
  // Interleave sources so foreign (translated) and Digikala reviews are both visible up front.
  const all = [];
  for (let i = 0; i < Math.max(r.reviews.length, r.web_reviews.length); i++) {
    if (r.reviews[i]) all.push(r.reviews[i]);
    if (r.web_reviews[i]) all.push(r.web_reviews[i]);
  }
  const ids = focus ? new Set(focus.review_ids) : null;
  const list = all.filter(
    (x) =>
      (tab === "all" ||
        (tab === "dk" ? x.source === "digikala" : x.source !== "digikala")) &&
      (!ids || ids.has(x.id)),
  );
  const dk = r.digikala || {};
  const dist = dk.distribution || {};
  const maxD = Math.max(1, ...Object.values(dist));
  if (r.status === "none")
    return (
      <section className="panel reviews-panel">
        <h2>
          <MessageCircle size={18} />
          نظرات خریداران
        </h2>
        <p className="muted">
          نظری پیدا نشد.
          {dk.status === "no_model_code" ? " کد مدل مشخص نیست." : ""}
        </p>
      </section>
    );
  return (
    <section className="panel reviews-panel">
      <div className="reviews-head">
        <h2>
          <MessageCircle size={18} />
          نظرات خریداران
        </h2>
        <div className="reviews-score">
          {dk.average ? (
            <>
              <b>
                {num(dk.average)} <small>از ۵</small>
              </b>
            </>
          ) : null}
          <small>
            {dk.total ? num(dk.total) + " نظر در دیجی‌کالا" : ""}
            {dk.total && r.web_reviews.length ? " · " : ""}
            {r.web_reviews.length
              ? num(r.web_reviews.length) + " نظر خارجی (ترجمه‌شده)"
              : ""}
          </small>
        </div>
      </div>
      {dk.average ? (
        <div className="dist">
          {[5, 4, 3, 2, 1].map((n) => (
            <div key={n}>
              <span>{num(n)} از ۵</span>
              <i>
                <b style={{ width: ((dist[n] || 0) / maxD) * 100 + "%" }} />
              </i>
              <small>{num(dist[n] || 0)}</small>
            </div>
          ))}
        </div>
      ) : null}
      {r.summary ? (
        <div className="review-summary">
          <div>
            <b>جمع‌بندی نظرها</b>
            <p>{r.summary}</p>
          </div>
        </div>
      ) : null}
      {r.pros.length || r.cons.length ? (
        <div className="themes">
          {r.pros.length ? (
            <div>
              <h3 className="good">نقاط قوت از نگاه خریداران</h3>
              {r.pros.map((p) => (
                <button
                  key={p.text}
                  className={"theme pro" + (focus === p ? " on" : "")}
                  onClick={() => setFocus(focus === p ? null : p)}
                >
                  {p.text}
                  <span>×{num(p.count)}</span>
                </button>
              ))}
            </div>
          ) : null}
          {r.cons.length ? (
            <div>
              <h3 className="bad">ایرادها از نگاه خریداران</h3>
              {r.cons.map((p) => (
                <button
                  key={p.text}
                  className={"theme con" + (focus === p ? " on" : "")}
                  onClick={() => setFocus(focus === p ? null : p)}
                >
                  {p.text}
                  <span>×{num(p.count)}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {r.seller_issues.length ? (
        <div className="reminder">
          <TriangleAlert size={18} />
          <div>
            <b>مربوط به فروشنده یا ارسال، نه خود کالا</b>
            {r.seller_issues.map((p) => (
              <p key={p.text}>
                {p.text} (×{num(p.count)})
              </p>
            ))}
          </div>
        </div>
      ) : null}
      <div className="list-bar static">
        <div className="seg" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "all"}
            onClick={() => setTab("all")}
          >
            همه<span>{num(all.length)}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === "dk"}
            onClick={() => setTab("dk")}
          >
            دیجی‌کالا<span>{num(r.reviews.length)}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === "web"}
            onClick={() => setTab("web")}
          >
            خارجی<span>{num(r.web_reviews.length)}</span>
          </button>
        </div>
        {focus ? (
          <button className="notice-chip" onClick={() => setFocus(null)}>
            فقط نظرهای «{focus.text}» · نمایش همه ×
          </button>
        ) : null}
      </div>
      <div className="review-list">
        {list.slice(0, shown).map((x) => (
          <ReviewCard key={x.id} r={x} />
        ))}
      </div>
      {list.length > shown ? (
        <button
          className="btn btn-ghost btn-block"
          onClick={() => setShown(shown + 10)}
        >
          نظرهای بیشتر ({num(list.length - shown)})
        </button>
      ) : null}
      {r.web_summaries?.length ? (
        <div className="web-summaries">
          <h3>خلاصه نتایج وب</h3>
          <p className="muted">خلاصه جست‌وجو؛ متن کامل نظرها در دسترس نیست.</p>
          <ul>
            {r.web_summaries.map((s) => (
              <li key={s.id}>
                <span dir="auto">{s.text}</span> ·{" "}
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.source}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="muted">
        {r.notice}
        {dk.url ? (
          <>
            {" "}
            ·{" "}
            <a href={dk.url} target="_blank" rel="noreferrer">
              صفحه کالا در دیجی‌کالا
            </a>
          </>
        ) : null}
      </p>
    </section>
  );
}
