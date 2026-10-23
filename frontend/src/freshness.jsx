import React, { useEffect, useState } from "react";
import {
  Check,
  X,
  RefreshCw,
  Send,
  Globe,
  Instagram,
  MessageCircle,
  Smartphone,
  ArrowLeft,
  Copy,
  Store,
  Clock,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "./ui.jsx";
import { call, copyText } from "./features.jsx";
import "./freshness.css";

// «تازه‌سازی قیمت»: one-tap seller page, refresh queue board and the link card shown after a refresh request.
const num = (n) =>
  n == null ? "—" : Math.round(Number(n)).toLocaleString("fa-IR");
const ICON = {
  website: Globe,
  instagram: Instagram,
  whatsapp: MessageCircle,
  telegram: Send,
  sms: Smartphone,
};
const ago = (s) => {
  if (!s) return "";
  const d = (Date.now() / 1000 - s) / 86400;
  return d < 1 ? "امروز" : num(d) + " روز پیش";
};

export function ShopRefresh({ token }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [edit, setEdit] = useState({}),
    [busy, setBusy] = useState(""),
    [note, setNote] = useState("");
  const load = () =>
    call("shop-link/" + encodeURIComponent(token))
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [token]);
  async function send(items, label) {
    setBusy(label);
    setError("");
    try {
      const d = await call("shop-link/" + encodeURIComponent(token), { items });
      setData((x) => ({ ...x, offers: d.shop_offers }));
      setNote("قیمت ثبت شد");
      setEdit({});
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  if (error && !data)
    return (
      <div className="fr-shop">
        <div className="fr-shop-card">
          <h1>تازه‌سازی قیمت</h1>
          <p className="fr-error">{error}</p>
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="fr-shop">
        <p className="fr-muted">در حال بارگذاری…</p>
      </div>
    );
  const open = data.offers.filter((o) => !o.confirmed_at);
  return (
    <div className="fr-shop" dir="rtl">
      <header className="fr-shop-head">
        <Store size={22} />
        <div>
          <h1>{data.shop.name}</h1>
          <p>{data.shop.address}</p>
        </div>
      </header>
      <p className="fr-intro">قیمت‌ها را تأیید یا اصلاح کنید.</p>
      {open.length > 1 ? (
        <button
          className="fr-bulk"
          disabled={!!busy}
          onClick={() =>
            send(
              open.map((o) => ({ offer_id: o.offer_id, action: "same" })),
              "all",
            )
          }
        >
          <Check size={20} />
          همهٔ قیمت‌ها درست است ({num(open.length)} کالا)
        </button>
      ) : null}
      {note ? (
        <p className="fr-ok" role="status">
          {note}
        </p>
      ) : null}
      {error ? (
        <p className="fr-error" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="fr-items">
        {data.offers.map((o) => (
          <li key={o.offer_id} className={o.confirmed_at ? "done" : ""}>
            <div className="fr-item-head">
              {o.image ? (
                <img src={o.image} alt="" referrerPolicy="no-referrer" />
              ) : null}
              <div>
                <b>{o.title}</b>
                <span className="fr-reason">{o.reason}</span>
              </div>
            </div>
            <div className="fr-price">
              <span>
                {o.confirmed_at
                  ? o.withdrawn
                    ? "ناموجود اعلام شد"
                    : "قیمت تأییدشده " + ago(o.confirmed_at)
                  : "قیمت ثبت‌شده"}
              </span>
              <b>{o.withdrawn ? "—" : num(o.price_toman) + " تومان"}</b>
              {!o.confirmed_at && o.price_age_days != null ? (
                <small>{num(o.price_age_days)} روز پیش</small>
              ) : null}
            </div>
            {edit[o.offer_id] !== undefined ? (
              <form
                className="fr-edit"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(
                    [
                      {
                        offer_id: o.offer_id,
                        action: "price",
                        price: Number(edit[o.offer_id]),
                      },
                    ],
                    o.offer_id,
                  );
                }}
              >
                <input
                  inputMode="numeric"
                  dir="ltr"
                  autoFocus
                  aria-label="قیمت جدید به تومان"
                  placeholder="قیمت جدید (تومان)"
                  value={edit[o.offer_id]}
                  onChange={(e) =>
                    setEdit((v) => ({
                      ...v,
                      [o.offer_id]: e.target.value.replace(/[^\d]/g, ""),
                    }))
                  }
                />
                <button
                  className="fr-btn primary"
                  disabled={!edit[o.offer_id] || !!busy}
                >
                  ثبت قیمت
                </button>
                <button
                  type="button"
                  className="fr-btn"
                  onClick={() =>
                    setEdit((v) => {
                      const n = { ...v };
                      delete n[o.offer_id];
                      return n;
                    })
                  }
                >
                  انصراف
                </button>
              </form>
            ) : (
              <div className="fr-actions">
                <button
                  className="fr-btn ok"
                  disabled={!!busy}
                  onClick={() =>
                    send([{ offer_id: o.offer_id, action: "same" }], o.offer_id)
                  }
                >
                  <Check size={18} />
                  قیمت هنوز درسته
                </button>
                <button
                  className="fr-btn"
                  disabled={!!busy}
                  onClick={() => setEdit((v) => ({ ...v, [o.offer_id]: "" }))}
                >
                  قیمت جدید…
                </button>
                <button
                  className="fr-btn warn"
                  disabled={!!busy}
                  onClick={() =>
                    send(
                      [{ offer_id: o.offer_id, action: "unavailable" }],
                      o.offer_id,
                    )
                  }
                >
                  <X size={18} />
                  موجود نیست
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="fr-muted">{data.expires_note} </p>
    </div>
  );
}

export function RefreshLink({ data, onClose }) {
  const [note, setNote] = useState("");
  async function copy() {
    try {
      await copyText(data.message);
      setNote("کپی شد");
    } catch {
      setNote("متن را انتخاب و کپی کنید.");
    }
  }
  return (
    <Modal title="لینک تازه‌سازی قیمت" onClose={onClose}>
      <div className="fr-link">
        <p className="fr-link-shop">
          <Store size={17} />
          {data.shop_name} · {num(data.items)} کالا · اعتبار{" "}
          {num(data.expires_in_days)} روز
        </p>

        <textarea readOnly rows={4} value={data.message} />
        <div className="fr-link-actions">
          {(data.real_channels || []).map((c) => {
            const I = ICON[c.kind] || ArrowLeft;
            return (
              <a
                key={c.kind}
                className="btn btn-primary"
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={copy}
              >
                <I size={16} />
                {c.label} (کانال واقعی)
              </a>
            );
          })}
          {(data.share || []).map((c) => {
            const I = ICON[c.kind] || ArrowLeft;
            return (
              <a
                key={c.kind}
                className="btn btn-ghost"
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <I size={16} />
                {c.label}
              </a>
            );
          })}
          <button className="btn btn-ghost" onClick={copy}>
            <Copy size={16} />
            کپی متن
          </button>
        </div>
        <a
          className="fr-preview"
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowLeft size={15} />
          صفحه فروشنده
        </a>
        {note ? (
          <p className="success-note" role="status">
            {note}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

export function FreshnessBoard() {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [link, setLink] = useState(null),
    [sent, setSent] = useState(null),
    [web, setWeb] = useState({}),
    [busy, setBusy] = useState("");
  const load = () =>
    call("freshness/queue")
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);
  async function ask(item) {
    setBusy(item.offer_id);
    try {
      const sid = (await call("bootstrap")).sessions[0].id;
      setLink(
        await call("freshness/ask", { session_id: sid, shop_id: item.shop_id }),
      );
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  async function auto() {
    setBusy("auto");
    try {
      setSent((await call("freshness/auto-ask", { top: 5 })).sent);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  async function check(item) {
    setBusy("w" + item.offer_id);
    try {
      const r = await call("freshness/web-check", { offer_id: item.offer_id });
      setWeb((w) => ({ ...w, [item.offer_id]: r }));
      load();
    } catch (e) {
      setWeb((w) => ({
        ...w,
        [item.offer_id]: { status: "error", note: e.message },
      }));
    } finally {
      setBusy("");
    }
  }
  const s = data?.stats;
  const WEB = {
    verified: "قیمت از صفحهٔ فروشگاه خوانده و ثبت شد",
    no_website: "سایت ثبت‌شده ندارد",
    not_on_shop_site: "صفحه‌ای روی سایت خود فروشگاه پیدا نشد",
    url_not_cited: "منبع تأیید نشد",
    different_model: "مدل صفحه با کالا یکی نبود",
    different_product: "محصول صفحه یکی نبود",
    no_price_on_page: "قیمتی در صفحه نبود",
    implausible_price: "قیمت نامعقول بود؛ ثبت نشد",
    error: "انجام نشد",
  };
  return (
    <div className="fr-board" dir="rtl">
      <header className="fr-board-head">
        <div>
          <h1>
            <RefreshCw size={22} />
            وضعیت تازگی قیمت‌ها
          </h1>
        </div>
        <a className="btn btn-ghost" href="./">
          بازگشت به بازارگرد
        </a>
      </header>
      <section className="fr-parts">
        {[
          ["لینک یک‌لمسی فروشنده", "پاسخ فروشنده", Store],
          ["صف هوشمند", "اولویت درخواست‌ها", TrendingUp],
          ["گزارش خریداران", "گزارش کاربران", ShieldCheck],
          ["بررسی سایت فروشگاه", "قیمت از منبع فروشگاه", Globe],
          ["برآورد امروز", "برآورد قیمت", Clock],
        ].map(([t, d, I]) => (
          <div key={t}>
            <I size={18} />
            <b>{t}</b>
            <span>{d}</span>
          </div>
        ))}
      </section>
      {s ? (
        <section className="fr-stats">
          {[
            ["تأییدشده امروز", s.confirmed_today],
            ["پاسخ فروشنده (۷ روز)", s.updates_7d.merchant_link || 0],
            ["از سایت فروشگاه", s.updates_7d.web_verified || 0],
            ["گزارش هم‌نظر خریداران", s.updates_7d.crowd || 0],
            ["درخواست ارسال‌شده", s.asks_7d],
            [
              "باز شده / پاسخ‌داده",
              num(s.asks_opened_7d) + " / " + num(s.asks_answered_7d),
            ],
          ].map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <b>{typeof v === "number" ? num(v) : v}</b>
            </div>
          ))}
        </section>
      ) : null}
      <div className="fr-toolbar">
        <button
          className="btn btn-primary"
          disabled={busy === "auto" || !data?.queue?.length}
          onClick={auto}
        >
          <Send size={16} />
          درخواست خودکار از ۵ فروشگاه اول صف
        </button>
      </div>
      {sent ? (
        <div className="fr-sent">
          {sent.length ? (
            sent.map((x) => (
              <p key={x.shop_id}>
                <b>{x.shop_name}</b> · {num(x.items)} کالا ·{" "}
                {x.mode === "prepared_real_channel"
                  ? "پیام آماده برای کانال واقعی"
                  : "ارسال شبیه‌سازی"}{" "}
                ·{" "}
                <a href={x.url} target="_blank" rel="noopener noreferrer">
                  لینک فروشنده
                </a>
              </p>
            ))
          ) : (
            <p>فروشگاه تازه‌ای برای پرسیدن نبود.</p>
          )}
        </div>
      ) : null}
      {error ? <p className="fr-error">{error}</p> : null}
      {!data ? (
        <p className="fr-muted">در حال محاسبهٔ صف…</p>
      ) : !data.queue.length ? (
        <p className="fr-muted">درخواستی ثبت نشده</p>
      ) : (
        <ol className="fr-queue">
          {data.queue.map((q, i) => (
            <li key={q.offer_id}>
              <span className="fr-rank">{num(i + 1)}</span>
              <div className="fr-q-main">
                <b>{q.title}</b>
                <span>
                  {q.shop_name} · {num(q.price_toman)} تومان ·{" "}
                  {q.freshness_label ||
                    "قیمت " + num(q.price_age_days) + " روز پیش"}
                </span>
                {q.estimate ? (
                  <span className="fr-est">{q.estimate.text}</span>
                ) : null}
                <span className="fr-factors">
                  امتیاز {q.score} = قدمت {q.factors.age} × تقاضا{" "}
                  {q.factors.demand} × (۱ + عدم قطعیت {q.factors.uncertainty}) ×
                  مراجعه {q.factors.visit} · جست‌وجو {num(q.demand.searches)}،
                  برنامه {num(q.demand.plans)}
                </span>
                {q.asked_at ? (
                  <span className="fr-asked">
                    پرسیده شد {ago(q.asked_at)}
                    {q.answered_at ? " · پاسخ داد" : ""}
                  </span>
                ) : null}
                {web[q.offer_id] ? (
                  <span
                    className={"fr-web " + (web[q.offer_id].ok ? "ok" : "")}
                  >
                    {WEB[web[q.offer_id].status] || web[q.offer_id].note}
                    {web[q.offer_id].ok
                      ? " · " + num(web[q.offer_id].price) + " تومان"
                      : ""}
                  </span>
                ) : null}
              </div>
              <div className="fr-q-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={busy === q.offer_id}
                  onClick={() => ask(q)}
                >
                  <Send size={14} />
                  لینک فروشنده
                </button>
                {q.real_channels.some((c) => c.kind === "website") ? (
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={busy === "w" + q.offer_id}
                    onClick={() => check(q)}
                  >
                    <Globe size={14} />
                    {busy === "w" + q.offer_id
                      ? "در حال خواندن…"
                      : "بررسی از سایت فروشگاه"}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
      {link ? <RefreshLink data={link} onClose={() => setLink(null)} /> : null}
    </div>
  );
}
