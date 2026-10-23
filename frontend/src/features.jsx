import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  ShoppingBasket,
  Clock,
  Check,
  MapPin,
  Copy,
  Download,
  RefreshCw,
  Navigation,
  ArrowLeft,
  LoaderCircle,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "./ui.jsx";
import "./features.css";
import { OpenMapContext } from "./locations.jsx";
const API = new URL("api/", document.baseURI).pathname;
export const money = (n) =>
  n == null ? "نامشخص" : Number(n).toLocaleString("fa-IR");
const date = (n) =>
  n
    ? new Date(n).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })
    : "نامشخص";
const localDate = (d) => {
  if (typeof d === "string" && !/Z$|[+-]\d{2}:\d{2}$/.test(d))
    return d.slice(0, 16);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(d ?? Date.now()))
      .map((x) => [x.type, x.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};
export const NETWORK_ERROR =
  "ارتباط با سرور برقرار نشد؛ چند لحظه بعد دوباره تلاش کنید.";
// Transient network/gateway failures are retried (GET by default, or `retries` for idempotent POSTs); users see a Persian message, never "Failed to fetch".
export async function call(path, body, method, retries) {
  const m = method || (body ? "POST" : "GET"),
    max = retries ?? (m === "GET" ? 2 : 0);
  let r;
  for (let i = 0; ; i++) {
    try {
      r = await fetch(API + path, {
        method: m,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (r.status >= 502 && r.status <= 504 && i < max) throw Error("gateway");
      break;
    } catch (e) {
      if (i >= max) throw Error(NETWORK_ERROR);
      await new Promise((z) => setTimeout(z, 700 * (i + 1)));
    }
  }
  let d;
  try {
    d = await r.json();
  } catch {
    throw Error(r.ok ? "پاسخ سرور ناقص بود؛ دوباره تلاش کنید." : NETWORK_ERROR);
  }
  if (!r.ok)
    throw Error(typeof d.detail === "string" ? d.detail : "درخواست انجام نشد");
  return d;
}
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext)
    return navigator.clipboard.writeText(text);
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.append(el);
  el.select();
  const ok = document.execCommand("copy");
  el.remove();
  if (!ok) throw Error("لینک را از کادر انتخاب و کپی کنید");
}
function Field({ label, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}
function Note({ children }) {
  return <p className="feature-note">{children}</p>;
}
function Pending() {
  return (
    <span className="pending">
      <LoaderCircle size={16} className="spin" />
      در حال بررسی…
    </span>
  );
}

export function Inspection({ inspection }) {
  if (!inspection) return null;
  return (
    <details className="inspection">
      <summary>
        <AlertTriangle size={14} />
        {inspection.flags.length
          ? money(inspection.flags.length) + " نکته درباره تفاوت آفر"
          : "بررسی مدل، وضعیت و گارانتی"}
      </summary>
      {inspection.flags.map((f, i) => (
        <div key={i}>
          <b>{f.label}</b>
          <q>{f.quote}</q>
        </div>
      ))}
      {inspection.missing.length ? (
        <p>هنوز باید پرسیده شود: {inspection.missing.join("، ")}</p>
      ) : null}
      <p>{inspection.notice}</p>
    </details>
  );
}

export function Indoor({ shop, sid, onLocation }) {
  const i = shop.indoor;
  return (
    <div className="indoor">
      <b>تا درِ فروشگاه</b>
      <p>{shop.address}</p>
      {i ? (
        <>
          <p>
            {[
              i.entrance && "ورودی: " + i.entrance,
              i.floor && "طبقه: " + i.floor,
              i.unit && "واحد: " + i.unit,
              i.landmark && "نشانه: " + i.landmark,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p>
            ورودی بدون پله: {i.step_free || "نامشخص"} · آسانسور:{" "}
            {i.elevator || "نامشخص"}
          </p>
          {i.photo_url ? (
            <a href={i.photo_url} target="_blank" rel="noreferrer">
              عکس ورودی از لینک فروشنده <ArrowLeft size={12} />
            </a>
          ) : null}
          <small>
            اطلاعات پاسخ لینک فروشنده · {date(i.reported_at * 1000)} · هویت
            مستقل تأیید نشده
          </small>
        </>
      ) : (
        <small>جزئیات ورودی ثبت نشده</small>
      )}
      {sid ? (
        <OpenMapContext sid={sid} shop={shop} onResolved={onLocation} />
      ) : null}
    </div>
  );
}

export function Timing({ route }) {
  if (!route) return null;
  return (
    <div className={"timing " + (route.feasible === false ? "problem" : "")}>
      <b>
        {route.feasible === true
          ? "برنامه از نظر زمان قابل انجام است"
          : route.feasible === false
            ? "این برنامه نیاز به تغییر دارد"
            : "برای اطمینان، اطلاعات بیشتری لازم است"}
      </b>
      {route.finish_at ? (
        <p>
          پایان با حاشیه اطمینان: {date(route.finish_at)}
          {route.deadline ? " · مهلت: " + date(route.deadline) : ""}
        </p>
      ) : null}
      <p>
        {route.timing_source === "osrm_no_live_traffic"
          ? "زمان جاده از OSRM، بدون ترافیک زنده"
          : route.timing_source === "user_supplied_per_leg"
            ? "زمان هر مسیر از ورودی شما"
            : "زمان مسیر نامشخص"}
        {route.road_km != null
          ? " · " + money(route.road_km.toFixed(1)) + " کیلومتر جاده"
          : ""}
      </p>
      {[...(route.problems || []), ...(route.unknowns || [])].map((s, i) => (
        <p key={i}>• {s}</p>
      ))}
      {route.assumptions ? (
        <small>
          برای هر توقف {money(route.assumptions.shopping_minutes_per_stop)}{" "}
          دقیقه خرید + {money(route.assumptions.buffer_minutes)} دقیقه حاشیه
          اطمینان
        </small>
      ) : null}
    </div>
  );
}

export function Decision({
  question,
  onChoose,
  onSkip,
  pending = false,
  compact = false,
}) {
  const [expanded, setExpanded] = useState(
      () => window.matchMedia("(min-width:761px)").matches,
    ),
    [budget, setBudget] = useState(""),
    [strict, setStrict] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(min-width:761px)"),
      change = () => setExpanded(m.matches);
    m.addEventListener("change", change);
    return () => m.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    setBudget("");
    setStrict(true);
    if (!window.matchMedia("(min-width:761px)").matches) setExpanded(false);
  }, [question?.key]);
  if (!question?.question) return null;
  return (
    <aside className={"decision-card" + (compact ? " compact" : "")}>
      {compact ? null : (
        <>
          <div className="question-stage">پرسش اختیاری پس از بررسی نتایج</div>
          <b>{question.question}</b>
          <button
            className="decision-toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "بستن پاسخ‌ها" : "انتخاب پاسخ برای دقیق‌تر شدن"}
          </button>
        </>
      )}
      {compact || expanded ? (
        <>
          <p>{question.reason}</p>
          <span className="question-kind">
            {question.kind === "budget"
              ? "محدودیت قطعی بودجه"
              : question.kind === "purpose"
                ? "ترجیح همین سفر؛ بدون تغییر بودجه"
                : "مشخصه الزامی یا ترجیحی"}
          </span>
          {question.kind === "budget" ? (
            <form
              className="decision-budget"
              onSubmit={(e) => {
                e.preventDefault();
                onChoose(Number(budget), true);
              }}
            >
              <input
                aria-label="سقف بودجه پرسش تکمیلی"
                type="number"
                min="1"
                max="10000000000000"
                step="1"
                placeholder="تومان"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
              <button className="primary" disabled={pending || !budget}>
                اعمال سقف بودجه
              </button>
            </form>
          ) : (
            <>
              {question.kind === "spec" ? (
                <label className="question-strict">
                  <input
                    type="checkbox"
                    checked={strict}
                    onChange={(e) => setStrict(e.target.checked)}
                  />
                  این ویژگی الزامی است؛ گزینه فاقد آن حذف شود
                </label>
              ) : null}
              <div>
                {question.options.map((o) => (
                  <button
                    key={o.value}
                    disabled={pending}
                    onClick={() => onChoose(o.value, strict)}
                  >
                    {o.label}
                    {o.count != null ? (
                      <small>{money(o.count)} مدل در فهرست</small>
                    ) : null}
                  </button>
                ))}
              </div>
            </>
          )}
          <button className="text-btn" disabled={pending} onClick={onSkip}>
            نمی‌دانم / فعلاً رد کن
          </button>
        </>
      ) : null}
    </aside>
  );
}

export function MerchantRequest({ sid, offer, onClose, onCreated }) {
  const [hold, setHold] = useState(localDate(Date.now() + 3600000)),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  async function create(e) {
    e.preventDefault();
    setPending(true);
    try {
      const d = await call("merchant-requests", {
        session_id: sid,
        offer_id: offer.offer_id,
        hold_until: hold || null,
      });
      setData(d);
      onCreated?.(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal title="درخواست نگهداری" onClose={onClose}>
      <p>
        {offer.persian_title} · {offer.shop_name}
      </p>
      <Note>رزرو پس از پذیرش فروشنده</Note>
      {!data ? (
        <form className="feature-form" onSubmit={create}>
          <Field
            label="درخواست نگهداری تا · وقت تهران"
            type="datetime-local"
            value={hold}
            onChange={(e) => setHold(e.target.value)}
          />
          <button className="primary" disabled={pending}>
            {pending ? <Pending /> : "ساخت لینک فروشنده"}
          </button>
        </form>
      ) : (
        <div className="share-request">
          <label>
            لینک قابل ارسال برای فروشنده
            <input
              readOnly
              dir="ltr"
              value={data.url}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <button
            className="primary"
            onClick={() => copyText(data.url).catch((e) => setError(e.message))}
          >
            <Copy size={16} />
            کپی لینک
          </button>
          <a
            className="outline"
            href={data.url}
            target="_blank"
            rel="noreferrer"
          >
            باز کردن فرم فروشنده <ArrowLeft size={14} />
          </a>
          <Note>{data.notice}</Note>
        </div>
      )}
      {error ? (
        <p role="alert" className="feature-error">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}

export function SellerPortal({ token }) {
  const [request, setRequest] = useState(null),
    [error, setError] = useState(""),
    [done, setDone] = useState(null),
    [pending, setPending] = useState(false);
  const [v, setV] = useState({
    available: true,
    exact_variant: "",
    price_toman: "",
    valid_until: localDate(Date.now() + 2 * 3600000),
    ready_at: localDate(Date.now() + 15 * 60000),
    accept_hold: false,
    hold_until: "",
    open_at: "",
    close_at: "",
    hours: "",
    warranty: "",
    note: "",
    indoor: {},
    payment: {},
  });
  const change = (k, value) => setV((v) => ({ ...v, [k]: value }));
  useEffect(() => {
    call("merchant-requests/" + encodeURIComponent(token))
      .then((d) => {
        setRequest(d);
        setV((v) => ({
          ...v,
          exact_variant: d.product.title,
          hold_until: d.requested_hold_until
            ? localDate(d.requested_hold_until)
            : "",
        }));
      })
      .catch((e) => setError(e.message));
  }, [token]);
  async function submit(e) {
    e.preventDefault();
    setPending(true);
    try {
      setDone(
        await call(
          "merchant-requests/" + encodeURIComponent(token) + "/reply",
          {
            ...v,
            price_toman: v.price_toman === "" ? null : Number(v.price_toman),
            payment: Object.fromEntries(
              Object.entries(v.payment).map(([k, x]) => [
                k,
                x === "" ? null : Number(x),
              ]),
            ),
          },
        ),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="seller-page">
      <div className="seller-card">
        <h1>بازارگرد · پاسخ فروشنده</h1>
        {error ? (
          <p className="feature-error" role="alert">
            {error}
          </p>
        ) : null}
        {!request && !error ? (
          <Pending />
        ) : request ? (
          <>
            <h2>{request.product.title}</h2>
            <p>
              {request.shop.name} · {request.shop.address}
            </p>
            <Note>{request.notice}</Note>
            {done ? (
              <div className="success-note">
                <Check />
                {done.notice}
                {done.hold_code ? " · کد نگهداری: " + done.hold_code : ""}
              </div>
            ) : request.answered ? (
              <div>
                <Note>این درخواست قبلاً پاسخ داده شده است.</Note>
                {request.response?.hold_code ? (
                  <p>
                    کد نگهداری: <b dir="ltr">{request.response.hold_code}</b> ·
                    تا {date(request.response.hold_until)}
                  </p>
                ) : null}
                <p>اعتبار پاسخ: {date(request.response?.valid_until)}</p>
              </div>
            ) : (
              <form className="feature-form" onSubmit={submit}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={v.available}
                    onChange={(e) => change("available", e.target.checked)}
                  />
                  همین مدل موجود است
                </label>
                <Field
                  label="مدل، رنگ، ظرفیت و وضعیت دقیق"
                  value={v.exact_variant}
                  required={v.available}
                  onChange={(e) => change("exact_variant", e.target.value)}
                />
                <div className="form-row">
                  <Field
                    label="قیمت نهایی نقدی · تومان"
                    type="number"
                    min="1"
                    required={v.available}
                    value={v.price_toman}
                    onChange={(e) => change("price_toman", e.target.value)}
                  />
                  <Field
                    label="اعتبار پاسخ تا · وقت تهران"
                    type="datetime-local"
                    required
                    value={v.valid_until}
                    onChange={(e) => change("valid_until", e.target.value)}
                  />
                </div>
                <Field
                  label="کالا از چه زمانی آماده تحویل است؟"
                  type="datetime-local"
                  value={v.ready_at}
                  onChange={(e) => change("ready_at", e.target.value)}
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={v.accept_hold}
                    onChange={(e) => change("accept_hold", e.target.checked)}
                  />
                  نگهداری کالا را می‌پذیرم
                </label>
                {v.accept_hold ? (
                  <Field
                    label="نگهداری تا"
                    type="datetime-local"
                    required
                    value={v.hold_until}
                    onChange={(e) => change("hold_until", e.target.value)}
                  />
                ) : null}
                <div className="form-row">
                  <Field
                    label="ابتدای بازه حضور در فروشگاه"
                    type="datetime-local"
                    value={v.open_at}
                    onChange={(e) => change("open_at", e.target.value)}
                  />
                  <Field
                    label="پایان بازه حضور"
                    type="datetime-local"
                    value={v.close_at}
                    onChange={(e) => change("close_at", e.target.value)}
                  />
                </div>
                <Field
                  label="توضیح ساعت کاری"
                  value={v.hours}
                  onChange={(e) => change("hours", e.target.value)}
                />
                <Field
                  label="گارانتی و اقلام داخل جعبه"
                  value={v.warranty}
                  onChange={(e) => change("warranty", e.target.value)}
                />
                <fieldset>
                  <legend>راهنمای ورودی</legend>
                  {[
                    ["entrance", "ورودی"],
                    ["floor", "طبقه"],
                    ["unit", "واحد"],
                    ["landmark", "نشانه نزدیک در"],
                    ["photo_url", "لینک HTTPS عکس ورودی"],
                  ].map(([k, label]) => (
                    <Field
                      key={k}
                      label={label}
                      value={v.indoor[k] || ""}
                      onChange={(e) =>
                        change("indoor", { ...v.indoor, [k]: e.target.value })
                      }
                    />
                  ))}
                  {[
                    ["step_free", "ورودی بدون پله"],
                    ["elevator", "آسانسور"],
                  ].map(([k, label]) => (
                    <label key={k}>
                      {label}
                      <select
                        value={v.indoor[k] || ""}
                        onChange={(e) =>
                          change("indoor", { ...v.indoor, [k]: e.target.value })
                        }
                      >
                        <option value="">نامشخص</option>
                        <option>بله</option>
                        <option>خیر</option>
                      </select>
                    </label>
                  ))}
                </fieldset>
                <fieldset>
                  <legend>شرایط اقساط، در صورت ارائه</legend>
                  {[
                    ["upfront", "پیش‌پرداخت · تومان"],
                    ["monthly", "مبلغ هر قسط · تومان"],
                    ["months", "تعداد اقساط"],
                    ["fees", "مجموع کارمزد · تومان (صفر را هم مشخص کنید)"],
                  ].map(([k, label]) => (
                    <Field
                      key={k}
                      label={label}
                      type="number"
                      min="0"
                      value={v.payment[k] ?? ""}
                      onChange={(e) =>
                        change("payment", { ...v.payment, [k]: e.target.value })
                      }
                    />
                  ))}
                </fieldset>
                <label>
                  توضیح
                  <textarea
                    maxLength={1000}
                    value={v.note}
                    onChange={(e) => change("note", e.target.value)}
                  />
                </label>
                <button className="primary" disabled={pending}>
                  {pending ? <Pending /> : "ثبت پاسخ فروشنده"}
                </button>
              </form>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}

export function Quotes({ sid, onClose, onRefresh }) {
  const [quotes, setQuotes] = useState([]),
    [error, setError] = useState("");
  async function load() {
    try {
      setQuotes((await call("quotes/" + sid)).quotes);
      await onRefresh?.();
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [sid]);
  const labels = {
    held: "نگهداری پذیرفته شده",
    answered: "پاسخ دریافت شد",
    expired: "منقضی شده",
    hold_expired: "مهلت نگهداری تمام شده",
    unavailable: "کالا ناموجود گزارش شده؛ روی نگهداری قبلی حساب نکنید",
    needs_reconfirmation:
      "گزارش تازه دریافت شده؛ نگهداری نیاز به تأیید دوباره دارد",
    superseded: "پاسخ تازه‌تری برای همین کالا وجود دارد",
    awaiting_seller: "در انتظار فروشنده",
  };
  return (
    <Modal title="پاسخ فروشنده" onClose={onClose}>
      <button className="outline" onClick={load}>
        <RefreshCw size={15} />
        بررسی پاسخ تازه
      </button>
      {!quotes.length ? (
        <Note>از کارت محصول، درخواست نگهداری بسازید.</Note>
      ) : (
        quotes.map((q) => (
          <article className="quote-card" key={q.token}>
            <b>{q.product_title}</b>
            <p>{q.shop_name}</p>
            <strong>{labels[q.status]}</strong>
            {q.response ? (
              <>
                <p>مدل اعلام‌شده: {q.response.exact_variant}</p>
                <p>
                  موجودی:{" "}
                  {q.response.available
                    ? "موجود اعلام شده"
                    : "ناموجود اعلام شده"}{" "}
                  · قیمت: {money(q.response.price_toman)} تومان
                </p>
                <p>اعتبار قیمت و پاسخ: {date(q.response.valid_until)}</p>
                {q.response.hold_until ? (
                  <p>
                    پایان نگهداری: {date(q.response.hold_until)} · کد:{" "}
                    <b dir="ltr">{q.response.hold_code}</b>
                  </p>
                ) : null}
                <p>آماده تحویل: {date(q.response.ready_at)}</p>
              </>
            ) : (
              <Note>در انتظار پذیرش فروشنده</Note>
            )}
            <small>منبع: پاسخ لینک فروشنده · هویت تأییدنشده</small>
          </article>
        ))
      )}
      {error ? <p className="feature-error">{error}</p> : null}
    </Modal>
  );
}

export function Mission({
  sid,
  mission = {},
  profile,
  onClose,
  onSaved,
  onPickOrigin,
}) {
  const [v, setV] = useState({
      ...mission,
      departure: mission.departure ? localDate(mission.departure) : localDate(),
      deadline: mission.deadline ? localDate(mission.deadline) : "",
      return_to_origin: mission.return_to_origin ?? true,
      shopping_minutes: mission.shopping_minutes ?? 15,
      buffer_minutes: mission.buffer_minutes ?? 10,
    }),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const change = (k, val) => setV((v) => ({ ...v, [k]: val }));
  async function save(e) {
    e.preventDefault();
    setPending(true);
    try {
      const d = await call("mission", { session_id: sid, values: v }, "PATCH");
      await onSaved(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal title="مهلت و شرایط سفر خرید" onClose={onClose}>
      <Note>
        {profile.lat != null
          ? "مبدا روی نقشه ثبت شده است."
          : "برای محاسبه زمان، مبدا را روی نقشه انتخاب کنید."}
      </Note>
      <button className="outline" onClick={onPickOrigin}>
        <MapPin size={15} />
        انتخاب مبدا روی نقشه
      </button>
      <form className="feature-form" onSubmit={save}>
        <div className="form-row">
          <Field
            label="حرکت · وقت تهران"
            type="datetime-local"
            value={v.departure}
            onChange={(e) => change("departure", e.target.value)}
          />
          <Field
            label="تا چه زمانی باید تمام شود؟"
            type="datetime-local"
            value={v.deadline}
            onChange={(e) => change("deadline", e.target.value)}
          />
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={v.return_to_origin}
            onChange={(e) => change("return_to_origin", e.target.checked)}
          />
          محاسبه زمان برگشت
        </label>
        <div className="form-row">
          <Field
            label="خرید در هر توقف · دقیقه"
            type="number"
            min="0"
            max="600"
            value={v.shopping_minutes}
            onChange={(e) => change("shopping_minutes", Number(e.target.value))}
          />
          <Field
            label="حاشیه اطمینان · دقیقه"
            type="number"
            min="0"
            max="600"
            value={v.buffer_minutes}
            onChange={(e) => change("buffer_minutes", Number(e.target.value))}
          />
        </div>
        <Field
          label="زمان دستی هر مسیر · دقیقه"
          type="number"
          min="0"
          max="600"
          value={v.manual_leg_minutes ?? ""}
          onChange={(e) =>
            change(
              "manual_leg_minutes",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
        />
        <Field
          label="نیاز دسترسی"
          value={v.accessibility || ""}
          onChange={(e) => change("accessibility", e.target.value)}
        />
        <Note>خودرو: تخمین بدون ترافیک · پیاده و حمل‌ونقل: زمان دستی</Note>
        <button className="primary" disabled={pending}>
          {pending ? <Pending /> : "ذخیره و بررسی برنامه"}
        </button>
        {error ? (
          <p role="alert" className="feature-error">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

export function Basket({ sid, items, onItems, onClose, onPlan }) {
  const [query, setQuery] = useState(""),
    [quantity, setQuantity] = useState(1),
    [plans, setPlans] = useState(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function add(e) {
    e.preventDefault();
    try {
      onItems(
        (await call("basket", { session_id: sid, query, quantity })).items,
      );
      setQuery("");
      setPlans(null);
    } catch (e) {
      setError(e.message);
    }
  }
  async function optimize() {
    setPending(true);
    try {
      setPlans(await call("basket/" + sid + "/plans"));
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal title="سبد خرید" onClose={onClose} wide>
      <form className="basket-add" onSubmit={add}>
        <input
          aria-label="قلم جدید سبد"
          placeholder="مثلاً لپ تاپ، ماوس یا کیف"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <input
          aria-label="تعداد"
          type="number"
          min="1"
          max="20"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button className="primary">افزودن</button>
      </form>
      <div className="basket-items">
        {items.map((i) => (
          <div key={i.id}>
            <span>
              {i.query} × {money(i.quantity)}
            </span>
            <button
              onClick={async () => {
                try {
                  onItems(
                    (
                      await call(
                        "basket/" + sid + "/" + i.id,
                        undefined,
                        "DELETE",
                      )
                    ).items,
                  );
                  setPlans(null);
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              حذف
            </button>
          </div>
        ))}
      </div>
      <button
        className="primary"
        disabled={!items.length || pending}
        onClick={optimize}
      >
        {pending ? <Pending /> : "مقایسه هزینه و تعداد فروشگاه‌ها"}
      </button>
      {plans ? (
        <>
          <Note>{plans.notice}</Note>
          {plans.missing?.length ? (
            <p>پیشنهادی پیدا نشد: {plans.missing.join("، ")}</p>
          ) : null}
          {!plans.plans.length && !plans.missing?.length ? (
            <Note>ترکیبی پیدا نشد. بودجه یا کالاها را تغییر دهید.</Note>
          ) : null}
          <div className="basket-plans">
            {plans.plans.map((p, i) => (
              <article key={i}>
                <h3>{p.label}</h3>
                <strong>
                  {money(p.subtotal_toman)} تومان · {money(p.stop_count)} توقف
                </strong>
                {p.offers.map((o) => (
                  <p key={o.offer_id}>
                    {o.persian_title} × {money(o.quantity)}
                    <small>
                      {o.shop_name} · هر واحد {money(o.effective_price_toman)}{" "}
                      تومان
                    </small>
                  </p>
                ))}
                {p.compatibility.map((c, j) => (
                  <Note key={j}>
                    {c.products.join(" + ")}: {c.detail}
                  </Note>
                ))}
                <button
                  className="outline"
                  onClick={() => onPlan(p.shop_ids, p.offers)}
                >
                  <Navigation size={15} />
                  بررسی زمان و مسیر این ترکیب
                </button>
              </article>
            ))}
          </div>
        </>
      ) : null}
      {error ? (
        <p className="feature-error" role="alert">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}

export function Costs({ sid, offers, route, onClose }) {
  const [v, setV] = useState(() =>
      route?.road_km != null ? { travel_km: route.road_km } : {},
    ),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  async function calculate(e) {
    e?.preventDefault();
    setPending(true);
    try {
      setData(
        await call("costs", {
          session_id: sid,
          offer_ids: offers.map((o) => o.offer_id),
          values: v,
        }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  useEffect(() => {
    calculate();
  }, []);
  return (
    <Modal title="هزینه خرید و اقساط" onClose={onClose}>
      <Note>{offers.map((o) => o.persian_title).join("، ")}</Note>
      <form className="feature-form" onSubmit={calculate}>
        <fieldset>
          <legend>رفت‌وآمد</legend>
          {[
            ["travel_km", "کل مسیر رفت‌وبرگشت · کیلومتر"],
            ["cost_per_km_toman", "هزینه هر کیلومتر · تومان"],
            ["parking_toman", "پارکینگ · تومان (صفر را هم مشخص کنید)"],
          ].map(([k, label]) => (
            <Field
              key={k}
              label={label}
              type="number"
              min="0"
              value={v[k] ?? ""}
              onChange={(e) =>
                setV({
                  ...v,
                  [k]: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          ))}
        </fieldset>
        <fieldset>
          <legend>اقساط</legend>
          {[
            ["upfront", "پیش‌پرداخت · تومان"],
            ["monthly", "هر قسط · تومان"],
            ["months", "تعداد اقساط"],
            ["fees", "مجموع کارمزد · تومان"],
          ].map(([k, label]) => (
            <Field
              key={k}
              label={label}
              type="number"
              min="0"
              value={v[k] ?? data?.installments?.[k] ?? ""}
              onChange={(e) =>
                setV({
                  ...v,
                  [k]: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          ))}
        </fieldset>
        <button className="primary" disabled={pending}>
          {pending ? <Pending /> : "محاسبه هزینه"}
        </button>
      </form>
      {data ? (
        <div className="cost-result">
          <p>
            مجموع قیمت مبنای کالاها: <b>{money(data.subtotal_toman)} تومان</b>
          </p>
          <p>
            رفت‌وآمد: {money(data.travel_toman)} · پارکینگ:{" "}
            {money(data.parking_toman)}
          </p>
          <p>
            کل خرید و سفر: <b>{money(data.trip_total_toman)} تومان</b>
          </p>
          <p>
            مجموع بازپرداخت: <b>{money(data.installment_total_toman)} تومان</b>
          </p>
          {data.extra_vs_cash_toman != null ? (
            <p>
              تفاوت بازپرداخت با قیمت نقدی: {money(data.extra_vs_cash_toman)}{" "}
              تومان
            </p>
          ) : null}
          <small>
            منبع اقساط:{" "}
            {data.installment_source === "merchant_link"
              ? "پاسخ لینک فروشنده"
              : "ورودی شما"}
          </small>
          <Note>{data.notice}</Note>
        </div>
      ) : null}
      {error ? <p className="feature-error">{error}</p> : null}
    </Modal>
  );
}

export function PhotoSearch({ sid, onClose, onSearch }) {
  const [preview, setPreview] = useState(""),
    [pending, setPending] = useState(false),
    [found, setFound] = useState(null),
    [query, setQuery] = useState(""),
    [error, setError] = useState("");
  const file = useRef(null);
  async function read(f) {
    if (!f) return;
    setPending(true);
    setError("");
    setFound(null);
    try {
      if (f.size > 15_000_000) throw Error("عکس ورودی حداکثر ۱۵ مگابایت باشد");
      const bitmap = await createImageBitmap(f);
      const canvas = document.createElement("canvas"),
        scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas
        .getContext("2d")
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const url = canvas.toDataURL("image/jpeg", 0.8);
      setPreview(url);
      const d = await call("identify-image", {
        session_id: sid,
        image: url.split(",")[1],
        media_type: "image/jpeg",
      });
      setFound(d);
      setQuery(d.query);
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal title="پیدا کردن کالا از عکس" onClose={onClose}>
      <Note>عکس برای شناسایی مدل ارسال می‌شود.</Note>
      <input
        ref={file}
        type="file"
        accept="image/*"
        aria-label="انتخاب عکس محصول"
        onChange={(e) => read(e.target.files[0])}
      />
      {preview ? (
        <img
          className="photo-preview"
          src={preview}
          alt="تصویر انتخابی برای خواندن مدل"
        />
      ) : null}
      {pending ? <Pending /> : null}
      {found ? (
        <form
          className="feature-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(query, found.model);
          }}
        >
          <Field
            label="مدل محصول"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <Note>متن قابل مشاهده: {found.visible_text}</Note>
          <Note>{found.uncertainty}</Note>
          <button className="primary">جست‌وجو</button>
        </form>
      ) : null}
      {error ? (
        <p className="feature-error" role="alert">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}

export function ShopperProfiles({ sid, onApplied }) {
  const [profiles, setProfiles] = useState([]),
    [name, setName] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    call("shopper-profiles")
      .then((d) => setProfiles(d.profiles))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div className="shopper-profiles">
      <h3>پروفایل خرید برای دیگران</h3>
      <form
        className="basket-add"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            setProfiles(
              (await call("shopper-profiles", { session_id: sid, name }))
                .profiles,
            );
            setName("");
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <input
          aria-label="نام پروفایل خرید"
          placeholder="مثلاً خرید برای پدر"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="outline">ذخیره شرایط این سفر</button>
      </form>
      {profiles.map((p) => (
        <div className="profile-row" key={p.id}>
          <span>{p.name}</span>
          <button
            className="outline"
            onClick={async () => {
              try {
                onApplied(
                  (
                    await call("shopper-profiles/" + p.id + "/apply", {
                      session_id: sid,
                    })
                  ).facts,
                );
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            استفاده در این سفر
          </button>
          <button
            onClick={async () => {
              try {
                setProfiles(
                  (await call("shopper-profiles/" + p.id, undefined, "DELETE"))
                    .profiles,
                );
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            حذف
          </button>
        </div>
      ))}
      {error ? <p className="feature-error">{error}</p> : null}
    </div>
  );
}

const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function downloadPass(stops, offers) {
  const html = `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>برگه سفر بازارگرد</title><style>body{font:17px/1.9 sans-serif;margin:20px auto;max-width:650px;padding:15px;background:#f4f6fa}article{background:white;border-radius:16px;padding:20px;margin:15px 0}button,a{display:inline-block;font:inherit;margin:6px;padding:12px;border-radius:8px;border:1px solid #ddd}small{display:block;color:#666}.done{opacity:.5}</style><h1>برگه آفلاین سفر بازارگرد</h1><p>ذخیره‌شده در ${escape(date(Date.now()))}. این برگه بدون اینترنت خوانده می‌شود؛ قیمت، نگهداری و موجودی ممکن است منقضی شوند. گزارش‌های این فایل به فروشنده یا سرور ارسال نمی‌شود.</p>${stops
    .map(
      (s, i) =>
        `<article><h2>${i + 1}. ${escape(s.name || s.shop_name)}</h2><p>${escape(s.address)}</p>${s.indoor ? `<p>${escape([s.indoor.entrance, s.indoor.floor, s.indoor.unit, s.indoor.landmark].filter(Boolean).join(" · "))}</p><small>بدون پله: ${escape(s.indoor.step_free || "نامشخص")} · آسانسور: ${escape(s.indoor.elevator || "نامشخص")}</small>` : ""}<p>${escape(s.opening?.label || "ساعت حضور نامشخص")}</p>${s.location_context?.features?.length ? `<details><summary>نقشه اطراف؛ ارتباط با مغازه تأیید نشده</summary>${s.location_context.features.map((f) => `<p>${escape(f.title)} · ${escape(f.distance_m)} متر · <a href="${escape(f.source_url)}">منبع نقشه</a></p>`).join("")}<small>© OpenStreetMap contributors · ODbL · https://www.openstreetmap.org/copyright · طبقه و واحد عارضه نقشه به مغازه نسبت داده نشده است.</small></details>` : ""}${offers
          .filter((o) => o.shop_id === s.shop_id)
          .map(
            (o) =>
              `<p>${escape(o.persian_title)} · ${escape(money(o.effective_price_toman ?? o.price_toman))} تومان <small>منبع قیمت: ${escape(o.price_basis || "dataset")}${o.merchant_quote?.hold_code ? " · کد نگهداری: " + escape(o.merchant_quote.hold_code) + " تا " + escape(date(o.merchant_quote.hold_until)) : ""}</small></p>`,
          )
          .join(
            "",
          )}<button onclick="this.closest('article').classList.toggle('done')">رسیدم / انجام شد</button><button onclick="this.closest('article').classList.add('done');this.textContent='ثبت محلی: بسته یا ناموجود'">بسته / ناموجود</button><a href="${escape(s.maps_url || "#")}" target="_blank" rel="noreferrer">نقشه (نیازمند اینترنت)</a></article>`,
    )
    .join("")}<button onclick="print()">چاپ / ذخیره PDF</button></html>`;
  const url = URL.createObjectURL(
    new Blob([html], { type: "text/html;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "hamrah-offline-trip.html";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Street({ sid, offers, route, onClose, onResults, onPlan }) {
  const key = "hamrah-street-" + sid,
    queueKey = key + "-queue";
  const saved = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  };
  const prior = useRef(saved()).current;
  const newerRoute =
    route?.stops?.length &&
    (!prior.saved || (route.planned_at || 0) * 1000 > prior.saved);
  const [stops, setStops] = useState(() =>
    newerRoute
      ? route.stops
      : Array.isArray(prior.stops)
        ? prior.stops
        : route?.stops ||
          [
            ...new Map(
              offers.map((o) => [o.shop_id, { ...o, name: o.shop_name }]),
            ).values(),
          ].slice(0, 4),
  );
  const [index, setIndex] = useState(() => saved().index || 0),
    [status, setStatus] = useState(""),
    [actions, setActions] = useState(() => saved().actions || []),
    [price, setPrice] = useState(""),
    [priceForm, setPriceForm] = useState(false),
    [pending, setPending] = useState(false),
    [online, setOnline] = useState(navigator.onLine),
    [queue, setQueue] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem(queueKey) || "[]");
      } catch {
        return [];
      }
    });
  const [tripOffers, setTripOffers] = useState(() =>
    !newerRoute && prior.offers ? prior.offers : offers,
  );
  useEffect(() => {
    localStorage.setItem(
      key,
      JSON.stringify({
        stops,
        index,
        offers: tripOffers,
        actions,
        saved: Date.now(),
      }),
    );
  }, [stops, index, tripOffers, actions]);
  useEffect(() => {
    localStorage.setItem(queueKey, JSON.stringify(queue));
  }, [queue]);
  useEffect(() => {
    const yes = () => setOnline(true),
      no = () => setOnline(false);
    window.addEventListener("online", yes);
    window.addEventListener("offline", no);
    return () => {
      window.removeEventListener("online", yes);
      window.removeEventListener("offline", no);
    };
  }, []);
  function applyReport(body, d) {
    onResults(d);
    const available = d.results.offers || [];
    const original = available.find(
      (o) => o.shop_id === body.shop_id && o.product_id === body.product_id,
    );
    setTripOffers((old) => [
      ...new Map(
        [
          ...old.filter(
            (o) =>
              !(o.shop_id === body.shop_id && o.product_id === body.product_id),
          ),
          ...available,
        ].map((o) => [o.offer_id, o]),
      ).values(),
    ]);
    if (original) {
      setStops((old) =>
        old.map((s) =>
          s.shop_id === body.shop_id
            ? { ...original, name: original.shop_name }
            : s,
        ),
      );
      return "قیمت تازه ثبت شد و همچنان با شرایط خرید سازگار است";
    }
    const next = available.find((o) => o.shop_id !== body.shop_id);
    setStops((old) =>
      [
        ...old.filter((s) => s.shop_id !== body.shop_id),
        ...(next ? [{ ...next, name: next.shop_name }] : []),
      ]
        .filter((s, i, a) => a.findIndex((x) => x.shop_id === s.shop_id) === i)
        .slice(0, 4),
    );
    setIndex(0);
    return next
      ? "گزارش ثبت شد؛ فروشگاه جایگزین مطابق شرایط به برنامه اضافه شد"
      : "گزارش ثبت شد؛ فعلاً جایگزین مطابق شرایط پیدا نشد";
  }
  async function flush() {
    if (!queue.length) return;
    setPending(true);
    try {
      for (const body of queue) {
        const d = await call("seller-events", body);
        applyReport(body, d);
        setQueue((q) => q.filter((x) => x !== body));
      }
      setStatus("گزارش‌های ذخیره‌شده همگام شدند");
    } catch (e) {
      setStatus(e.message);
    } finally {
      setPending(false);
    }
  }
  useEffect(() => {
    if (online && queue.length) flush();
  }, [online]);
  const stop = stops[Math.min(index, Math.max(0, stops.length - 1))];
  const offer = stop && tripOffers.find((o) => o.shop_id === stop.shop_id);
  function mark(kind) {
    if (!stop) return;
    setActions((a) => [...a, { shop_id: stop.shop_id, kind, at: Date.now() }]);
    setStatus(
      kind === "bought"
        ? "خرید این توقف انجام شد"
        : "رسیدن به این توقف روی دستگاه ثبت شد",
    );
    if (kind === "bought") setIndex((i) => Math.min(i + 1, stops.length - 1));
  }
  async function report(kind) {
    if (!offer) {
      setStatus("برای این فروشگاه، یک آفر از فهرست انتخاب کنید");
      return;
    }
    const body = {
      session_id: sid,
      shop_id: offer.shop_id,
      product_id: offer.product_id,
      status: kind === "price" ? "reported" : kind,
      price: kind === "price" ? Number(price) : null,
      note: "گزارش کاربر در حالت سفر؛ تأیید مستقل نیست",
    };
    if (kind === "price" && (!price || Number(price) <= 0)) {
      setStatus("قیمت مثبت لازم است");
      return;
    }
    if (!online) {
      setQueue((q) => [...q, body]);
      setStatus("گزارش روی این دستگاه ذخیره شد؛ بعد از اتصال همگام می‌شود");
      setPriceForm(false);
      return;
    }
    setPending(true);
    try {
      const d = await call("seller-events", body);
      setPriceForm(false);
      setStatus(applyReport(body, d));
    } catch (e) {
      setStatus(e.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal title="حالت سفر خرید" onClose={onClose} wide>
      <div className="street-top">
        <span>{online ? "متصل" : "آفلاین؛ اطلاعات ذخیره‌شده"}</span>
        <button
          className="outline"
          onClick={() => downloadPass(stops, tripOffers)}
        >
          <Download size={16} />
          ذخیره برگه آفلاین
        </button>
      </div>
      {queue.length ? (
        <button
          className="outline"
          disabled={!online || pending}
          onClick={flush}
        >
          {money(queue.length)} گزارش در انتظار همگام‌سازی
        </button>
      ) : null}
      {stop ? (
        <>
          <div className="street-progress">
            توقف {money(index + 1)} از {money(stops.length)}
          </div>
          <h3>{stop.name || stop.shop_name}</h3>
          <Indoor
            shop={stop}
            sid={sid}
            onLocation={(ctx) =>
              setStops((old) =>
                old.map((s) =>
                  s.shop_id === stop.shop_id
                    ? { ...s, location_context: ctx.osm }
                    : s,
                ),
              )
            }
          />
          {offer ? (
            <p>
              {offer.persian_title} ·{" "}
              {money(offer.effective_price_toman ?? offer.price_toman)} تومان
            </p>
          ) : null}
          <div className="street-actions">
            <button onClick={() => mark("arrived")}>
              <MapPin />
              رسیدم
            </button>
            <button disabled={pending} onClick={() => report("closed")}>
              بسته‌ست
            </button>
            <button disabled={pending} onClick={() => report("unavailable")}>
              ناموجود
            </button>
            <button onClick={() => setPriceForm(!priceForm)}>
              قیمت عوض شد
            </button>
            <button onClick={() => mark("bought")}>
              <Check />
              خریدم
            </button>
          </div>
          {priceForm ? (
            <form
              className="basket-add"
              onSubmit={(e) => {
                e.preventDefault();
                report("price");
              }}
            >
              <input
                aria-label="قیمت جدید در سفر"
                type="number"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="قیمت جدید · تومان"
              />
              <button className="primary" disabled={pending}>
                ثبت قیمت
              </button>
            </form>
          ) : null}
          <div className="street-navigation">
            <button
              className="outline"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              توقف قبل
            </button>
            <button
              className="outline"
              disabled={index >= stops.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              توقف بعد
            </button>
            <button
              className="primary"
              disabled={!online}
              onClick={() =>
                onPlan(
                  stops.map((s) => s.shop_id),
                  tripOffers,
                )
              }
            >
              بازبینی زمان و مسیر
            </button>
          </div>
        </>
      ) : (
        <Note>ابتدا فروشگاهی به برنامه مراجعه اضافه کنید.</Note>
      )}
      <p role="status">{status}</p>
      {actions.length ? (
        <p className="feature-note">
          {money(actions.filter((a) => a.kind === "bought").length)} خرید و{" "}
          {money(actions.filter((a) => a.kind === "arrived").length)} رسیدن روی
          این دستگاه ثبت شده است.
        </p>
      ) : null}
    </Modal>
  );
}
