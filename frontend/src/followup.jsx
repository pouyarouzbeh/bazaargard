import React, { useEffect, useState } from "react";
import {
  Copy,
  ArrowLeft,
  Instagram,
  Globe,
  MessageCircle,
  Send,
  Smartphone,
  Share2,
  BellRing,
  Link2,
} from "lucide-react";
import { call, copyText } from "./features";

const num = (n) => Number(n).toLocaleString("fa-IR");
const LABEL = {
  not_asked: "هنوز نپرسیده‌ام",
  asked: "پرسیدم؛ منتظر پاسخ",
  answered: "پاسخ گرفتم",
  confirmed: "قیمت و موجودی تأیید شد",
  no_answer: "پاسخ نداد",
};
const ICON = {
  instagram: Instagram,
  website: Globe,
  whatsapp: MessageCircle,
  telegram: Send,
  sms: Smartphone,
};

// Real follow-up: the shopper sends a prepared message through their own apps or the
// shop's real website/Instagram (only when the dataset has them). Nothing is sent automatically.
export function FollowUpChannels({ c, sid }) {
  const [msg, setMsg] = useState(c.message || c.draft || ""),
    [note, setNote] = useState(""),
    [pending, setPending] = useState(false);
  async function track(channel) {
    try {
      await call("followups", {
        session_id: sid,
        shop_id: c.shop_id,
        product_id: c.product_id,
        status: "asked",
        channel,
      });
    } catch {}
  }
  async function copy() {
    try {
      await copyText(msg);
      setNote("پیام کپی شد");
    } catch {
      setNote("متن را دستی کپی کنید.");
    }
  }
  async function openReal(ch) {
    try {
      await copyText(msg);
      setNote("پیام کپی شد");
    } catch {}
    track(ch.kind);
    window.open(ch.url, "_blank", "noopener,noreferrer");
  }
  async function addReplyLink() {
    setPending(true);
    try {
      const d = await call("merchant-requests", {
        session_id: sid,
        offer_id: c.offer.offer_id,
        hold_until: null,
      });
      setMsg(
        (m) => m + "\n\nبرای پاسخ دقیق می‌توانید این فرم را پر کنید: " + d.url,
      );
      setNote("لینک پاسخ اضافه شد");
    } catch (e) {
      setNote(e.message);
    } finally {
      setPending(false);
    }
  }
  async function addShopLink() {
    setPending(true);
    try {
      const d = await call("freshness/ask", {
        session_id: sid,
        shop_id: c.shop_id,
      });
      setMsg(
        (m) => m + "\n\nتأیید یا اصلاح قیمت با یک لمس (بدون ثبت‌نام): " + d.url,
      );
      setNote("لینک قیمت اضافه شد");
    } catch (e) {
      setNote(e.message);
    } finally {
      setPending(false);
    }
  }
  const enc = encodeURIComponent(msg);
  const share = [
    ["whatsapp", "واتس‌اپ", "https://wa.me/?text=" + enc],
    [
      "telegram",
      "تلگرام",
      "https://t.me/share/url?url=" +
        encodeURIComponent(location.origin + location.pathname) +
        "&text=" +
        enc,
    ],
    ["sms", "پیامک", "sms:?&body=" + enc],
  ];
  return (
    <div className="followup">
      <div className="path-explain">
        <div className="path real">
          <b>مسیر واقعی</b>
          <p>{c.paths?.real || ""}</p>
        </div>
        <div className="path sim">
          <b>شبیه‌سازی</b>
          <p>
            {c.paths?.simulated || "فقط برای آزمایش؛ پاسخ فروشنده واقعی نیست."}
          </p>
        </div>
      </div>
      <label className="followup-msg">
        <span>متن پیام (قابل ویرایش)</span>
        <textarea
          rows={6}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          maxLength={2000}
        />
      </label>
      {c.channels?.length ? (
        <section className="followup-group">
          <h4>کانال واقعی همین فروشگاه</h4>
          <div className="followup-actions">
            {c.channels.map((ch) => {
              const I = ICON[ch.kind] || ArrowLeft;
              return (
                <button
                  key={ch.kind}
                  className="btn btn-primary"
                  onClick={() => openReal(ch)}
                >
                  <I size={16} />
                  {ch.label}
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <p className="followup-none">راه ارتباطی فروشگاه ثبت نشده.</p>
      )}
      <section className="followup-group">
        <h4>ارسال با پیام‌رسان خودتان</h4>
        <div className="followup-actions">
          {share.map(([k, l, u]) => {
            const I = ICON[k];
            return (
              <a
                key={k}
                className="btn btn-ghost"
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track(k)}
              >
                <I size={16} />
                {l}
              </a>
            );
          })}
          {typeof navigator !== "undefined" && navigator.share ? (
            <button
              className="btn btn-ghost"
              onClick={() =>
                navigator
                  .share({ text: msg })
                  .then(() => track("share"))
                  .catch(() => {})
              }
            >
              <Share2 size={16} />
              بله، روبیکا و …
            </button>
          ) : null}
          <button className="btn btn-ghost" onClick={copy}>
            <Copy size={16} />
            کپی متن
          </button>
        </div>
        <small>گیرنده را در پیام‌رسان انتخاب کنید.</small>
      </section>
      {c.shop_id ? (
        <button className="text-btn" disabled={pending} onClick={addShopLink}>
          <Link2 size={15} />
          افزودن لینک به‌روزرسانی قیمت
        </button>
      ) : null}
      {c.offer?.offer_id ? (
        <button className="text-btn" disabled={pending} onClick={addReplyLink}>
          <Link2 size={15} />
          افزودن لینک فرم پاسخ فروشنده به پیام
        </button>
      ) : null}
      {note ? (
        <p className="success-note" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}

// Per-stop follow-up status on the plan page, maintained by the shopper, with a reminder before leaving.
export function FollowUpTracker({ sid, stops, items, departure, onContact }) {
  const [state, setState] = useState({}),
    [note, setNote] = useState("");
  useEffect(() => {
    let live = true;
    call("followups/" + encodeURIComponent(sid))
      .then((d) => {
        if (live) setState(d.followups);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [sid, stops.length, items.map((o) => o.price_confirmed_at || "").join()]); // seller confirmations update the tracker
  async function update(shop, status) {
    try {
      const product = items.find((o) => o.shop_id === shop)?.product_id;
      setState(
        (
          await call("followups", {
            session_id: sid,
            shop_id: shop,
            product_id: product,
            status,
          })
        ).followups,
      );
    } catch (e) {
      setNote(e.message);
    }
  }
  if (!stops.length) return null;
  const pending = stops.filter((s) => state[s.shop_id]?.status !== "confirmed");
  const leave = departure ? new Date(departure) : null,
    minutes = leave ? Math.round((leave - Date.now()) / 60000) : null;
  function remind() {
    if (!("Notification" in window)) {
      setNote("این مرورگر از اعلان پشتیبانی نمی‌کند.");
      return;
    }
    Notification.requestPermission().then((p) => {
      if (p !== "granted") {
        setNote("اعلان غیرفعال است");
        return;
      }
      const at =
        leave && leave - Date.now() > 35 * 60000
          ? leave.getTime() - 30 * 60000
          : Date.now() + 30 * 60000;
      setTimeout(() => {
        try {
          new Notification("بازارگرد · پیش از حرکت", {
            body:
              num(pending.length) +
              " فروشگاه هنوز قیمت و موجودی را تأیید نکرده‌اند.",
          });
        } catch {}
      }, at - Date.now());
      setNote(
        "یادآوری برای " +
          new Date(at).toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          }) +
          " ثبت شد (تا وقتی این صفحه باز است).",
      );
    });
  }
  return (
    <section className="followup-tracker">
      <h2>پیگیری فروشنده‌ها</h2>
      {pending.length ? (
        <div className="reminder-banner">
          <BellRing size={16} />
          <span>
            {minutes != null && minutes > -30 && minutes <= 180
              ? "تا حرکت حدود " + num(Math.max(0, minutes)) + " دقیقه مانده؛ "
              : ""}
            {num(pending.length)} توقف هنوز تأیید قیمت و موجودی ندارد.
          </span>
        </div>
      ) : (
        <p className="ok-line">همه توقف‌ها تأیید شده‌اند.</p>
      )}
      <ul className="followup-list">
        {stops.map((s, i) => {
          const status = state[s.shop_id]?.status || "not_asked";
          const item = items.find((o) => o.shop_id === s.shop_id);
          return (
            <li key={s.shop_id} className={"fu-" + status}>
              <span className="fu-num">{num(i + 1)}</span>
              <div className="fu-body">
                <b>{s.name}</b>
                <select
                  aria-label={"وضعیت پیگیری " + s.name}
                  value={status}
                  onChange={(e) => update(s.shop_id, e.target.value)}
                >
                  {Object.entries(LABEL).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
                {state[s.shop_id]?.channel ? (
                  <small>
                    از طریق{" "}
                    {{
                      instagram: "اینستاگرام",
                      website: "سایت",
                      whatsapp: "واتس‌اپ",
                      telegram: "تلگرام",
                      sms: "پیامک",
                      share: "اشتراک‌گذاری",
                      price_link: "لینک تازه‌سازی قیمت",
                    }[state[s.shop_id].channel] || state[s.shop_id].channel}
                  </small>
                ) : null}
              </div>
              {item ? (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onContact(item)}
                >
                  پیام
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      <button className="btn btn-ghost btn-sm btn-block" onClick={remind}>
        <BellRing size={15} />
        یادآوری پیش از حرکت
      </button>
      {note ? <small className="fu-note">{note}</small> : null}
    </section>
  );
}
