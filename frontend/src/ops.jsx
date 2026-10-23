import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import {
  Activity,
  ArrowLeft,
  Check,
  Cloud,
  Code,
  FileText,
  LoaderCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Modal } from "./ui.jsx";
import { call } from "./features.jsx";
import "./ops.css";
const labels = {
  pending: "در انتظار تأیید",
  executing: "در حال اجرا",
  succeeded: "انجام شد",
  failed: "ناموفق",
  rolled_back: "بازگشت خودکار موفق",
  rejected: "رد شد",
  expired: "منقضی",
};
const statusText = {
  healthy: "سالم",
  degraded: "نیازمند بررسی",
  not_deployed: "آماده راه‌اندازی",
  stopped: "متوقف",
};
const n = (v) => (v == null ? "نامشخص" : Number(v).toLocaleString("fa-IR"));
const stamp = (v) => new Date(v * 1000).toLocaleTimeString("fa-IR");
export default function Ops() {
  const [state, setState] = useState(null),
    [tab, setTab] = useState("health"),
    [input, setInput] = useState(""),
    [turns, setTurns] = useState([]),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [review, setReview] = useState(null),
    [confirmed, setConfirmed] = useState(false),
    [domain, setDomain] = useState(""),
    [guide, setGuide] = useState(null),
    [lastResult, setLastResult] = useState(null);
  const end = useRef(null),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    call("ops/bootstrap")
      .then((d) => {
        setState(d);
        setTurns(d.turns);
        const rid = localStorage.getItem("hamrah-ops-run-" + d.session_id);
        if (rid) poll(rid, d.session_id);
      })
      .catch((e) => setError(e.message));
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [turns, status]);
  async function refresh(sid = state.session_id) {
    const d = await call("ops/state/" + sid);
    setState(d);
    setTurns(d.turns);
    return d;
  }
  async function propose(kind) {
    setError("");
    setBusy(true);
    try {
      const p = await call("ops/actions", {
        session_id: state.session_id,
        kind,
      });
      setConfirmed(false);
      setReview(p);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function approve(accept) {
    setBusy(true);
    setError("");
    try {
      setStatus(
        accept ? "اجرای عملیات تأییدشده و بررسی HTTP…" : "ثبت رد پیشنهاد…",
      );
      const d = await call("ops/actions/" + review.id + "/approve", {
        session_id: state.session_id,
        nonce: review.nonce,
        accept,
      });
      setLastResult(d);
      setReview(null);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      setStatus("");
    }
  }
  async function poll(rid, sid) {
    setBusy(true);
    try {
      let after = 0;
      for (let i = 0; i < 450 && mounted.current; i++) {
        const d = await call("chat-runs/" + rid + "?after=" + after);
        for (const { seq, event: e } of d.events) {
          after = seq;
          if (e.type === "status") setStatus(e.message);
          if (e.type === "done") {
            setState(e.state);
            setTurns(e.state.turns);
            setStatus(
              e.analysis_source === "model_with_live_evidence"
                ? "تحلیل مدل با شواهد زنده"
                : "تحلیل قواعد شواهد؛ مدل در دسترس نبود",
            );
          }
          if (e.type === "error") throw Error(e.message);
        }
        if (
          ["completed", "failed", "cancelled", "interrupted"].includes(d.status)
        ) {
          localStorage.removeItem("hamrah-ops-run-" + sid);
          await refresh(sid);
          return;
        }
        await new Promise((r) => setTimeout(r, 900));
      }
    } catch (e) {
      setError(
        e.message + "؛ با باز کردن دوباره صفحه، پاسخ ذخیره‌شده بازیابی می‌شود.",
      );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function send(text = input) {
    if (!text.trim() || busy) return;
    setInput("");
    setError("");
    setTurns((t) => [...t, { role: "user", content: text }]);
    setBusy(true);
    try {
      const r = await call("ops/chat-runs", {
        session_id: state.session_id,
        message: text,
      });
      localStorage.setItem("hamrah-ops-run-" + state.session_id, r.run_id);
      await poll(r.run_id, state.session_id);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  if (!state)
    return (
      <div className="loading-screen">
        <Cloud />
        <h1>همراه زیرساخت</h1>
        <p>{error || "آماده کردن فضای مدیریت…"}</p>
      </div>
    );
  const e = state.evidence,
    s = e.snapshot,
    p = state.project;
  const pending = state.actions.filter((a) => a.status === "pending");
  return (
    <main className="ops-page" dir="rtl">
      <header className="ops-header">
        <div>
          <Cloud size={23} />
          <div>
            <h1>همراه زیرساخت</h1>
            <small>از اولین انتشار تا بازیابی سایت</small>
          </div>
        </div>
        <a href={location.pathname}>
          <ShoppingBag size={17} />
          دستیار خرید
        </a>
      </header>
      <div className="ops-banner">
        <ShieldCheck size={19} />
        <div>
          <b>آزمایش واقعی روی Arvan</b>
          <p>مدیریت سایت نمونه</p>
        </div>
        <span>لیارا: متصل نشده</span>
      </div>
      {error ? (
        <div role="alert" className="ops-error">
          {error}
          <button onClick={() => setError("")}>بستن</button>
        </div>
      ) : null}
      <div className="ops-layout">
        <section className="ops-chat">
          <div className="ops-section-title">
            <h2>همکار فنی شما</h2>
            <span>تغییرات با تأیید شما</span>
          </div>
          <div className="ops-conversation">
            {turns.length ? (
              turns.map((t, i) => (
                <article key={i} className={"ops-message " + t.role}>
                  <small>{t.role === "user" ? "شما" : "همراه"}</small>
                  <Markdown>{t.content}</Markdown>
                </article>
              ))
            ) : (
              <div className="ops-welcome">
                <Cloud size={35} />
                <h2>سایتت را با هم راه بیندازیم.</h2>
                <p>درخواستت را بنویس.</p>
                {[
                  "این پروژه چه زیرساختی لازم دارد؟",
                  "سایت نمونه را راه‌اندازی کن",
                  "سایتم خطای ۵۰۰ می‌دهد؛ علت را پیدا کن",
                ].map((t) => (
                  <button key={t} onClick={() => send(t)} disabled={busy}>
                    {t}
                    <ArrowLeft size={16} />
                  </button>
                ))}
              </div>
            )}
            {status ? (
              <p className="ops-progress" role="status">
                {busy ? (
                  <LoaderCircle size={15} className="spin" />
                ) : (
                  <Check size={15} />
                )}{" "}
                {status}
              </p>
            ) : null}
            <div ref={end} />
          </div>
          <form
            className="ops-composer"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              aria-label="درخواست مدیریت سایت"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="مثلاً: سایتم کند شده، بررسی کن…"
              disabled={busy}
              maxLength={5000}
            />
            <button
              className="primary"
              aria-label="ارسال درخواست مدیریت"
              disabled={busy || !input.trim()}
            >
              <Send size={19} />
            </button>
          </form>
        </section>
        <section className="ops-details">
          <nav className="ops-tabs">
            {[
              ["health", "وضعیت و تشخیص", Activity],
              ["setup", "آماده‌سازی لیارا", Code],
              ["history", "عملیات و تأییدها", ShieldCheck],
              ["logs", "لاگ‌ها", FileText],
            ].map(([key, title, Icon]) => (
              <button
                key={key}
                aria-selected={tab === key}
                className={tab === key ? "active" : ""}
                onClick={() => setTab(key)}
              >
                <Icon size={16} />
                {title}
                {key === "history" && pending.length
                  ? " · " + n(pending.length)
                  : ""}
              </button>
            ))}
          </nav>
          {tab === "health" ? (
            <>
              <div className="ops-section-title">
                <h2>سایت نمونه · {s.version}</h2>
                <button
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    refresh()
                      .catch((e) => setError(e.message))
                      .finally(() => setBusy(false));
                  }}
                >
                  <RefreshCw size={16} />
                  بررسی تازه
                </button>
              </div>
              <div className={"ops-health " + s.state}>
                <Activity />
                <strong>{statusText[s.state]}</strong>
                <span dir="ltr">HTTP {s.http_status ?? "—"}</span>
                <small>نمونه‌برداری {stamp(e.captured_at)}</small>
              </div>
              <div className="ops-metrics">
                {[
                  ["زمان پاسخ", s.latency_ms, "ms"],
                  ["حافظه فرایند", s.rss_mb, "MB"],
                  ["CPU فرایند", s.cpu_percent_one_core, "% یک هسته"],
                ].map(([title, value, unit]) => (
                  <div key={title}>
                    <span>{title}</span>
                    <b>
                      {n(value)} <small>{unit}</small>
                    </b>
                  </div>
                ))}
              </div>
              <p className="ops-note">سقف منابع پلن نامشخص است.</p>
              <div className="ops-card">
                <h3>تشخیص بر اساس شواهد</h3>
                {state.diagnosis.ranked_causes.map((c, i) => (
                  <div key={i} className="ops-cause">
                    <b>
                      {n(i + 1)}. {c.cause}
                    </b>
                    <p>{c.evidence}</p>
                    <small>
                      {c.confidence === "observed"
                        ? "مشاهده مستقیم"
                        : c.confidence === "high"
                          ? "احتمال بالا با شواهد"
                          : "فرضیه نیازمند بررسی"}
                    </small>
                  </div>
                ))}
                {state.diagnosis.recommended_action ? (
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={() => propose(state.diagnosis.recommended_action)}
                  >
                    بررسی اقدام پیشنهادی
                  </button>
                ) : null}
              </div>
              <div className="ops-card">
                <h3>انتشار و بازیابی</h3>
                <div className="ops-actions">
                  {(s.state === "not_deployed"
                    ? [["deploy_v1", "راه‌اندازی سایت نمونه"]]
                    : [
                        ["deploy_v2", "انتشار نسخه ۲"],
                        ["restart", "راه‌اندازی دوباره"],
                        ["rollback", "بازگشت به نسخه سالم"],
                      ]
                  ).map(([kind, title]) => (
                    <button
                      className="outline"
                      key={kind}
                      disabled={busy}
                      onClick={() => propose(kind)}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              </div>
              <details className="ops-card">
                <summary>آزمون کنترل‌شده خرابی</summary>
                <p>تغییر سایت نمونه با تأیید شما</p>
                <div className="ops-actions">
                  {[
                    ["fault_500", "ایجاد خطای ۵۰۰"],
                    ["fault_slow", "ایجاد کندی"],
                    ["deploy_broken", "آزمون انتشار خراب و بازگشت"],
                  ].map(([k, t]) => (
                    <button
                      className="outline"
                      key={k}
                      disabled={busy || s.state === "not_deployed"}
                      onClick={() => propose(k)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </details>
              {lastResult ? (
                <div className="ops-card" role="status">
                  <h3>{labels[lastResult.status] || lastResult.status}</h3>
                  {lastResult.result ? (
                    <p>
                      {lastResult.result.verified
                        ? "نتیجه با HTTP واقعی تأیید شد"
                        : "نتیجه تأیید نشد"}{" "}
                      · HTTP {lastResult.result.after?.http_status ?? "—"}
                      {lastResult.result.rolled_back
                        ? " · نسخه سالم قبلی بازیابی شد"
                        : ""}
                      {lastResult.result.error
                        ? " · " + lastResult.result.error
                        : ""}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
          {tab === "setup" ? (
            <>
              <div className="ops-card">
                <h2>آماده‌سازی همین پروژه برای لیارا</h2>
                <p>
                  {p.project} · کاتالوگ {n(p.persistent_catalog_mb)} MB
                </p>
                <div className="ops-metrics">
                  <div>
                    <span>CPU پیشنهادی اولیه</span>
                    <b>{n(p.suggested_starting_resources.cpu_cores)} هسته</b>
                  </div>
                  <div>
                    <span>RAM پیشنهادی اولیه</span>
                    <b>{n(p.suggested_starting_resources.ram_mb)} MB</b>
                  </div>
                  <div>
                    <span>دیسک پایدار پیشنهادی</span>
                    <b>{n(p.suggested_starting_resources.disk_gb)} GB</b>
                  </div>
                </div>
                <p className="ops-note">
                  {p.suggested_starting_resources.basis}
                </p>
                <ul>
                  {p.checks.map((c, i) => (
                    <li key={i}>
                      <b>{c.state === "ready" ? "✓ " : ""}</b>
                      {c.label}
                    </li>
                  ))}
                </ul>
                <p>
                  Dockerfile:{" "}
                  {p.artifacts.dockerfile ? "آماده" : "در حال آماده‌سازی"} ·
                  liara.json:{" "}
                  {p.artifacts.liara_config ? "آماده" : "در حال آماده‌سازی"}
                </p>
                <a href={p.api_spec} target="_blank" rel="noreferrer">
                  مرجع رسمی API لیارا
                </a>
              </div>
              <div className="ops-card">
                <h3>دامنه و ایرنیک</h3>
                <p>رکوردهای حساب لیارا را وارد کنید.</p>
                <form
                  className="ops-domain"
                  onSubmit={async (ev) => {
                    ev.preventDefault();
                    try {
                      setGuide(
                        await call(
                          "ops/dns-guide?domain=" + encodeURIComponent(domain),
                        ),
                      );
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  <input
                    aria-label="دامنه"
                    placeholder="example.ir"
                    value={domain}
                    onChange={(ev) => setDomain(ev.target.value)}
                    dir="ltr"
                  />
                  <button className="outline">نمایش مراحل اتصال</button>
                </form>
                {guide ? (
                  <>
                    <ol>
                      {guide.steps.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ol>
                    <p className="ops-note">{guide.limit}</p>
                  </>
                ) : null}
              </div>
              <div className="ops-card">
                <h3>وضعیت اتصال و محدودیت‌ها</h3>
                <ul>
                  {state.capabilities.limits.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
          {tab === "history" ? (
            <>
              <div className="ops-card">
                <h2>پیشنهادها و نتیجه اجرا</h2>
                {state.actions.length ? (
                  state.actions.map((a) => (
                    <article className="ops-action-row" key={a.id}>
                      <div>
                        <b>{a.title}</b>
                        <span className={"ops-tag " + a.status}>
                          {labels[a.status]}
                        </span>
                      </div>
                      <p>{a.impact}</p>
                      {a.status === "pending" ? (
                        <button
                          className="primary"
                          disabled={busy}
                          onClick={() => {
                            setConfirmed(false);
                            setReview(a);
                          }}
                        >
                          بررسی و تصمیم
                        </button>
                      ) : a.result ? (
                        <p>
                          {a.result.verified
                            ? "بررسی نتیجه: تأیید شد"
                            : "بررسی نتیجه: تأیید نشد"}{" "}
                          · HTTP {a.result.after?.http_status ?? "—"}{" "}
                          {a.result.error || ""}
                        </p>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <p>هنوز عملیاتی پیشنهاد نشده است.</p>
                )}
              </div>
              <div className="ops-card">
                <h3>ردپای عملیات</h3>
                {state.history.map((h, i) => (
                  <p key={i} dir="ltr" className="ops-audit">
                    {stamp(h.created)} · {h.event} · {h.action_id.slice(0, 8)}
                  </p>
                ))}
              </div>
            </>
          ) : null}
          {tab === "logs" ? (
            <div className="ops-card">
              <h2>لاگ واقعی سایت نمونه</h2>
              <p>آخرین ۵۰ خط؛ موارد حساس شناخته‌شده پوشانده می‌شوند.</p>
              <pre className="ops-logs" dir="ltr">
                {e.logs.join("\n") || "هنوز لاگی ثبت نشده است."}
              </pre>
            </div>
          ) : null}
        </section>
      </div>
      {review ? (
        <Modal
          title={"تأیید عملیات: " + review.title}
          onClose={() => {
            if (!busy) setReview(null);
          }}
        >
          <div className="ops-review">
            <span className="ops-target">
              هدف: فقط سایت نمونه شما روی Arvan
            </span>
            <h3>{review.title}</h3>
            <p>{review.impact}</p>
            <p>اعتبار تأیید: ۱۰ دقیقه</p>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={busy}
              />
              اثر این عملیات را خواندم و اجازه اجرا می‌دهم.
            </label>
            <div className="form-actions">
              <button
                className="primary"
                onClick={() => approve(true)}
                disabled={busy || !confirmed}
              >
                {busy ? "در حال اجرا…" : "تأیید و اجرا"}
              </button>
              <button
                className="outline"
                disabled={busy}
                onClick={() => approve(false)}
              >
                رد پیشنهاد
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}
