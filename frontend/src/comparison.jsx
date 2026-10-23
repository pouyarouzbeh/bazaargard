import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
} from "react";
const UserReviews = lazy(() =>
  import("./pages.jsx").then((m) => ({ default: m.UserReviews })),
);
import { Download, GitCompareArrows, BarChart3, Table2, X } from "lucide-react";
import { Modal } from "./ui.jsx";
import "./comparison.css";
import { ReviewCard, GroundedAnalysis } from "./buying-review.jsx";

const number = (n) =>
  Number(n).toLocaleString("fa-IR", { maximumFractionDigits: 3 });
const units = {
  toman: "تومان",
  GB: "گیگابایت",
  kg: "کیلوگرم",
  inch: "اینچ",
  Hz: "هرتز",
  Wh: "وات‌ساعت",
  mAh: "میلی‌آمپرساعت",
  mm: "میلی‌متر",
  m: "متر",
  mm2: "میلی‌متر مربع",
  V: "ولت",
  A: "آمپر",
  W: "وات",
  L: "لیتر",
  bar: "بار",
  ohm: "اهم",
  g: "گرم",
  cm: "سانتی‌متر",
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
const sourceName = (s) =>
  ({
    dataset: "کاتالوگ",
    catalogue: "کاتالوگ",
    user_reported: "گزارش کاربر",
    merchant_link: "پاسخ لینک فروشنده",
    simulated: "شبیه‌سازی ساختگی",
    unavailable: "بدون قیمت",
    public_spec: "تکمیل از وب",
    listing_title: "عنوان آگهی",
  })[s] || "منبع ثبت‌شده";
const evidenceState = (s) =>
  ({
    accepted: "تطابق مدل و پیکربندی ایستا",
    ambiguous: "چند مقدار یا پیکربندی؛ نامشخص",
    model_or_variant_unproven: "مدل یا گونه نامطمئن",
    configuration_conflict: "تفاوت پیکربندی",
    configuration_unproven: "پیکربندی اثبات نشده",
    non_manufacturer_unverified: "منبع غیرسازنده؛ نیازمند تأیید",
    partial_document: "صفحه ناقص",
    source_conflict: "تعارض منابع وب",
    catalogue_disagreement: "تفاوت با کاتالوگ",
    unverified: "تأیید نشده",
    search_summary: "خلاصه جست‌وجوی وب؛ متن صفحه بررسی نشد",
  })[s] || s;
const provenance = (c) =>
  (c.research_evidence || [])
    .map((e) =>
      [
        e.url,
        "دریافت " + new Date(e.retrieved_at * 1000).toISOString(),
        evidenceState(e.status),
        e.model_match,
        e.variant_match,
        "شاهد: " + e.quote,
      ].join(" · "),
    )
    .join("\n");
const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};
function WebSource({ cell }) {
  const seen = [
    ...new Map(
      cell.research_evidence
        .filter((e) => e.status === "accepted" || e.status === "search_summary")
        .map((e) => [e.url, e]),
    ).values(),
  ];
  const summary =
    seen.length && seen.every((e) => e.status === "search_summary");
  return (
    <span className={"web-source" + (summary ? " search-summary" : "")}>
      <b>
        {summary
          ? "🔎 خلاصه جست‌وجوی وب (نقل‌قول در صفحه تأیید نشد)"
          : "🌐 از منبع آنلاین (در دیتاست نبود)"}
      </b>
      {seen.map((e, i) => (
        <a
          key={i}
          href={e.url}
          target="_blank"
          rel="noopener noreferrer"
          title={e.quote}
        >
          {host(e.url)}
        </a>
      ))}
    </span>
  );
}
function SpecEvidence({ cell }) {
  return cell.research_evidence?.length ? (
    <details className="spec-evidence">
      <summary>شاهد مشخصات وب · {evidenceState(cell.research_status)}</summary>
      {cell.research_evidence.map((e, i) => (
        <div key={i}>
          <a href={e.url} target="_blank" rel="noopener noreferrer">
            منبع مشخصه
          </a>
          <small>
            دریافت {new Date(e.retrieved_at * 1000).toLocaleString("fa-IR")} ·{" "}
            {evidenceState(e.status)}
          </small>
          <small>
            {{
              manufacturer: "سازنده",
              spec_reference: "مرجع مشخصات",
              retailer_spec: "اظهار فروشگاه",
              document_mirror: "آینه سند سازنده",
            }[e.source_type || e.source_kind] || "منبع عمومی"}
          </small>
          <small dir="auto">
            {e.model_match} · {e.variant_match}
          </small>
          {e.status === "search_summary" ? (
            <small dir="auto">
              متن پیشنهادی جست‌وجو (نقل‌قول تأییدنشده): {e.quote}
            </small>
          ) : (
            <blockquote dir="auto">{e.quote}</blockquote>
          )}
        </div>
      ))}
    </details>
  ) : null;
}
const searchable = (t) =>
  String(t ?? "")
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[٫]/g, ".")
    .replace(/[\u200c\s]+/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .toLocaleLowerCase()
    .trim();
function display(cell, row) {
  return cell.numeric != null
    ? number(cell.numeric) + (row.unit ? " " + units[row.unit] : "")
    : cell.value;
}
function saveFile(name, body, type) {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function exportComparison(data, kind) {
  data = {
    ...data,
    rows: [
      ...data.rows,
      ...(data.detailed_rows || []).map((r) => ({
        ...r,
        label: "جزئیات خام · " + r.label,
      })),
    ],
  };
  const supplements = data.buying_reviews || [];
  const researchText = (r) =>
    [
      ...(r.grounded_analysis?.claims || []).map(
        (c) => "تحلیل دستیار: " + c.text,
      ),
      ...r.research.sources.map(
        (s) =>
          s.url +
          " · دریافت " +
          new Date(s.retrieved_at * 1000).toISOString() +
          " · " +
          s.status +
          " · مدل " +
          s.match.status +
          " · پیکربندی " +
          s.match.configuration,
      ),
      ...r.seller_questions.map((q) => "از فروشنده بپرسید: " + q),
    ].join("\n");
  if (kind === "csv") {
    // Spreadsheet formula protection applies to catalogue titles and specification text.
    const quoted = (s) =>
      '"' +
      (/^[\s]*[=+@-]/.test(String(s)) ? "'" : "") +
      String(s).replaceAll('"', '""') +
      '"';
    const rows = [
      ["مشخصه", ...data.products.map((p) => p.persian_title)],
      ...data.rows.map((r) => [
        r.label,
        ...r.cells.map(
          (c) =>
            display(c, r) +
            (c.status === "conflict" ? " · تعارض در منبع" : "") +
            " · " +
            sourceName(c.source) +
            (c.price_band ? " · " + c.price_band.label : "") +
            (c.research_evidence?.length
              ? "\n" + evidenceState(c.research_status) + "\n" + provenance(c)
              : ""),
        ),
      ]),
      ...(supplements.length
        ? [
            [
              "تحقیق تکمیلی · جدا از مشخصات دیتاست",
              ...data.products.map((p) => {
                const r = supplements.find(
                  (r) => r.product_id === p.product_id,
                );
                return r
                  ? researchText(r)
                  : "این مدل در این نوبت تحقیق نشده است.";
              }),
            ],
          ]
        : []),
      ["یادداشت", data.notice],
      ["زمان ثبت", new Date(data.created * 1000).toISOString()],
    ];
    saveFile(
      "hamrah-comparison.csv",
      "\ufeff" + rows.map((r) => r.map(quoted).join(",")).join("\r\n"),
      "text/csv;charset=utf-8",
    );
    return;
  }
  const researchHtml = supplements.length
    ? "<h2>تحقیق تکمیلی · جدا از دیتاست</h2>" +
      supplements
        .map(
          (r) =>
            `<article><h3>${escape(r.title)}</h3><p>${escape(r.notice)}</p>${(r.grounded_analysis?.claims || []).map((c) => `<p><b>تحلیل دستیار: </b>${escape(c.text)}</p>`).join("")}${r.research.sources.map((source) => `<p><a href="${escape(source.url)}">${escape(source.title || source.url)}</a> · ${escape(source.status)} · ${escape(source.match.configuration)} · دریافت ${escape(new Date(source.retrieved_at * 1000).toISOString())}</p>${(source.excerpts || []).map((t) => `<blockquote>${escape(t)}</blockquote>`).join("")}`).join("")}<h4>از فروشنده بپرسید</h4><ul>${r.seller_questions.map((q) => `<li>${escape(q)}</li>`).join("")}</ul></article>`,
        )
        .join("")
    : "";
  const html = `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>مقایسه محصول‌ها — بازارگرد</title><style>body{font:16px/1.9 Tahoma,sans-serif;max-width:1300px;margin:25px auto;padding:16px;color:#263440}table{border-collapse:collapse;width:100%}th,td{border:1px solid #dce1e6;text-align:right;padding:12px;min-width:170px;vertical-align:top}.scroll{overflow:auto}small{display:block;color:#637080}h1{font-size:25px}.bar{display:block;height:12px;background:#226495;margin:7px 0;border-radius:4px}article{border:1px solid #dce1e6;padding:16px;margin:15px 0;border-radius:12px}p{overflow-wrap:anywhere}</style><h1>مقایسه محصول‌ها</h1><p>${escape(new Date(data.created * 1000).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" }))} · نسخه ذخیره‌شده</p><p>${escape(data.notice)}</p><div class="scroll"><table><thead><tr><th>مشخصه</th>${data.products.map((p) => `<th>${escape(p.persian_title)}</th>`).join("")}</tr></thead><tbody>${data.rows
    .map(
      (r) =>
        `<tr><th>${escape(r.label)}</th>${r.cells
          .map(
            (c) =>
              `<td>${escape(display(c, r))}<small>${escape(c.status === "conflict" ? "تعارض در منبع" : c.source === "public_spec" ? "از منبع آنلاین (در دیتاست نبود)" : sourceName(c.source))}</small>${
                c.source === "public_spec"
                  ? (c.research_evidence || [])
                      .filter((e) => e.status === "accepted")
                      .map(
                        (e) =>
                          `<small><a href="${escape(e.url)}">${escape(host(e.url))}</a></small>`,
                      )
                      .join("")
                  : ""
              }${c.research_evidence?.length ? `<small>${escape(evidenceState(c.research_status))}</small><p style="white-space:pre-wrap">${escape(provenance(c))}</p>` : ""}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("")}</tbody></table></div>${data.charts
    .map((c) => {
      const max = Math.max(0, ...c.values.map((v) => v.value ?? 0));
      return `<article><h2>${escape(c.label)} · ${escape(c.unit_label)}</h2>${c.values.map((v, i) => `<p>${escape(data.products[i].persian_title)}<strong> — ${v.value == null ? "نامشخص" : escape(number(v.value))}</strong><small>${escape(sourceName(v.source || "catalogue"))} ${escape(provenance(v))}</small>${v.value != null ? `<span class="bar" style="width:${max ? (v.value / max) * 100 : 0}%"></span>` : ""}</p>`).join("")}<small>${escape(c.note)}</small></article>`;
    })
    .join(
      "",
    )}<h2>نظر خریداران</h2>${data.reviews.map((r, i) => `<article><b>${escape(data.products[i].persian_title)}</b><p>${escape(r.notice)}</p>${r.entries.map((e) => `<p>${escape(e.key)}: ${escape(e.value)}</p>`).join("")}</article>`).join("")}${researchHtml}</html>`;
  saveFile("hamrah-comparison.html", html, "text/html;charset=utf-8");
}

const stageLabel = {
  harmonize: "یکسان‌سازی مشخصات کاتالوگ",
  discovery: "جست‌وجو",
  source: "خواندن منبع",
  evaluated: "بررسی شواهد",
  cache: "شواهد ذخیره‌شده",
};
const duration = (s) =>
  s >= 60
    ? number(Math.floor(s / 60)) +
      " دقیقه" +
      (s % 60 ? " و " + number(s % 60) + " ثانیه" : "")
    : number(s) + " ثانیه";
function SpecProgress({ job, busy, data }) {
  const [now, setNow] = useState(() => Date.now() / 1000);
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(t);
  }, [busy]);
  if (!job) {
    if (!data.harmonizer || !data.web_enriched) return null;
    job = { status: "completed" };
  }
  const st = job.stats || {},
    done = job.status === "completed",
    failed = ["failed", "interrupted", "cancelled"].includes(job.status),
    retrying = job.status === "retry_queued";
  const cells = data.rows.slice(1).flatMap((r) => r.cells),
    total = cells.length,
    filled = cells.filter((c) =>
      ["recorded", "conflict", "web_completed"].includes(c.status),
    ).length;
  const web = cells.filter((c) => c.status === "web_completed").length,
    pending = cells.filter((c) => c.pending).length,
    pct = total ? Math.round((filled / total) * 100) : 0;
  const harmonizing =
    !done &&
    !failed &&
    (!st.stage || st.stage === "harmonize" || !data.harmonizer);
  const overall = done
    ? 100
    : harmonizing
      ? Math.min(22, Math.round(((now - (job.created || now)) / 35) * 22))
      : 25 +
        Math.round(
          (75 * (st.products_done || 0)) / Math.max(1, st.products_total || 1),
        );
  const eta = done
    ? 0
    : Math.max(0, Math.round((st.eta_seconds ?? 125) - (now - (st.at || now))));
  const last = (job.progress || []).slice(-1)[0];
  return (
    <div
      className={"spec-progress" + (done ? " done" : "")}
      role="status"
      aria-live="polite"
    >
      <div className="spec-progress-head">
        <strong>
          {retrying
            ? "در صف تلاش مجدد؛ تکمیل خودکار ادامه می‌یابد"
            : failed
              ? "تکمیل متوقف شد"
              : done
                ? "بررسی پایان یافت"
                : harmonizing
                  ? "مرحله ۱ از ۲ · یکسان‌سازی مشخصات کاتالوگ"
                  : "مرحله ۲ از ۲ · تکمیل خانه‌های خالی از وب"}
        </strong>
        {!done && !failed ? (
          <span>
            {eta > 10
              ? "حدود " + duration(eta) + " تا جدول کامل"
              : "چند لحظه دیگر…"}
          </span>
        ) : null}
      </div>
      <div
        className="spec-progress-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={overall}
      >
        <span style={{ width: overall + "%" }} />
      </div>
      <div className="spec-progress-stats">
        {harmonizing ? (
          <span>در حال تکمیل جدول…</span>
        ) : (
          <span>
            <b>{number(pct)}٪</b> جدول پر است · {number(filled)} از{" "}
            {number(total)} خانه
          </span>
        )}
        {web ? (
          <span className="web">🌐 {number(web)} خانه از منابع آنلاین</span>
        ) : null}
        {pending ? (
          <span className="pending">
            ⏳ {number(pending)} خانه در حال جست‌وجو
          </span>
        ) : null}
        {!harmonizing && st.products_total ? (
          <span>
            {number(st.products_done || 0)} از {number(st.products_total)} محصول
            در وب بررسی شد
          </span>
        ) : null}
      </div>
      {busy && last ? (
        <small className="spec-progress-last">
          {last.model} · {stageLabel[last.stage] || last.stage}
          {last.round ? " · دور " + number(last.round) : ""}
        </small>
      ) : null}
    </div>
  );
}

function BuyerReviews({ products, sid }) {
  const [pick, setPick] = useState(products[0]?.product_id);
  if (!sid || !products.length) return null;
  return (
    <section className="buyer-reviews">
      <h3>نظرات خریداران</h3>
      <div className="chip-scroll">
        {products.map((p) => (
          <button
            key={p.product_id}
            className={"chip" + (pick === p.product_id ? " chosen" : "")}
            onClick={() => setPick(p.product_id)}
          >
            {p.persian_title.slice(0, 42)}
          </button>
        ))}
      </div>
      <Suspense fallback={<p>در حال آماده‌سازی نظرها…</p>}>
        {pick ? <UserReviews key={pick} sid={sid} productId={pick} /> : null}
      </Suspense>
    </section>
  );
}
export default function Comparison({
  data,
  sid,
  onClose,
  onReview,
  onResearch,
  onSpecFetch,
  onRebuild,
  onSpecCancel,
  onOriginal,
}) {
  const [tab, setTab] = useState("table"),
    [differences, setDifferences] = useState(false),
    [filter, setFilter] = useState(""),
    [removed, setRemoved] = useState(() =>
      data.view_product_ids
        ? data.product_ids.filter((id) => !data.view_product_ids.includes(id))
        : [],
    ),
    [metric, setMetric] = useState(data.charts[0]?.id || "");
  const [details, setDetails] = useState(false),
    [specBusy, setSpecBusy] = useState(false),
    [specProgress, setSpecProgress] = useState(null),
    [specError, setSpecError] = useState("");
  async function fetchSpecs(retry = true) {
    setSpecBusy(true);
    setSpecError("");
    try {
      await onSpecFetch(
        data.product_ids.filter((id) => !removed.includes(id)),
        setSpecProgress,
        retry,
      );
    } catch (e) {
      setSpecError(e.message);
    } finally {
      setSpecBusy(false);
    }
  }
  const started = useRef(null),
    visibleSelection = useRef(removed);
  visibleSelection.current = removed;
  useEffect(() => {
    if (
      !data.suppress_auto &&
      data.auto_completion &&
      !data.web_enriched &&
      started.current !== data.snapshot_id
    ) {
      started.current = data.snapshot_id;
      fetchSpecs(false);
    }
  }, [data.snapshot_id]);
  const [researchIds, setResearchIds] = useState(
      (data.view_product_ids || data.product_ids).slice(0, 2),
    ),
    [researching, setResearching] = useState(false),
    [researchError, setResearchError] = useState("");
  async function investigate() {
    setResearching(true);
    setResearchError("");
    try {
      await onResearch(
        researchIds.filter((id) => !removed.includes(id)),
        data.product_ids.filter((id) => !removed.includes(id)),
      );
    } catch (e) {
      setResearchError(e.message);
    } finally {
      setResearching(false);
    }
  }
  const shown = useMemo(() => {
    const indexes = data.products
      .map((p, i) => (removed.includes(p.product_id) ? -1 : i))
      .filter((i) => i >= 0);
    return {
      ...data,
      buying_reviews: data.buying_reviews?.filter(
        (r) => !removed.includes(r.product_id),
      ),
      products: indexes.map((i) => data.products[i]),
      product_ids: indexes.map((i) => data.product_ids[i]),
      reviews: indexes.map((i) => data.reviews[i]),
      rows: data.rows.map((r) => {
        const cells = indexes.map((i) => r.cells[i]);
        const tokens = cells.map(
          (c) => c.status + ":" + (c.numeric ?? c.value),
        );
        return { ...r, cells, different: new Set(tokens).size > 1 };
      }),
      detailed_rows: (data.detailed_rows || []).map((r) => {
        const cells = indexes.map((i) => r.cells[i]);
        return {
          ...r,
          cells,
          different:
            new Set(cells.map((c) => c.status + ":" + (c.numeric ?? c.value)))
              .size > 1,
        };
      }),
      charts: data.charts
        .map((c) => ({ ...c, values: indexes.map((i) => c.values[i]) }))
        .filter((c) => c.values.filter((v) => v.value != null).length >= 2),
    };
  }, [data, removed]);
  const needle = searchable(filter);
  const rows = [...shown.rows, ...(details ? shown.detailed_rows : [])].filter(
    (r) =>
      (!differences || r.different) &&
      (!needle ||
        [
          r.label,
          ...r.cells.flatMap((c) => [
            c.value,
            display(c, r),
            ...(c.raw || []).map((e) => e.key),
          ]),
        ].some((t) => searchable(t).includes(needle))),
  );
  const chart = shown.charts.find((c) => c.id === metric) || shown.charts[0];
  const maximum = chart
    ? Math.max(0, ...chart.values.map((v) => v.value ?? 0))
    : 0;
  const stamp = new Date(data.created * 1000).toLocaleString("fa-IR", {
    timeZone: "Asia/Tehran",
  });
  return (
    <Modal title="مقایسه محصول‌ها" onClose={onClose} wide>
      <div className="compare-workspace" dir="rtl">
        <p className="compare-intro">
          <GitCompareArrows size={18} />
          <span>
            {number(shown.products.length)} محصول · {stamp}
          </span>
        </p>
        <details className="compare-selection">
          <summary>
            ویرایش محصول‌های مقایسه ({number(shown.products.length)})
          </summary>
          <div className="compare-products">
            {shown.products.map((p, i) => (
              <div key={p.product_id}>
                <b>{number(i + 1)}.</b>
                <span>{p.persian_title}</span>
                <button
                  disabled={specBusy || shown.products.length <= 2}
                  aria-label={"حذف از مقایسه " + p.persian_title}
                  onClick={() => setRemoved((v) => [...v, p.product_id])}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </details>
        {removed.length ? (
          <button className="text-btn" onClick={() => setRemoved([])}>
            بازگرداندن محصول‌های حذف‌شده
          </button>
        ) : null}
        {onRebuild && data.snapshot_id ? (
          <button
            className="outline"
            disabled={specBusy}
            onClick={async () => {
              setSpecBusy(true);
              setSpecError("");
              try {
                await onRebuild(
                  data.product_ids.filter((id) => !removed.includes(id)),
                );
              } catch (e) {
                setSpecError(e.message);
              } finally {
                setSpecBusy(false);
              }
            }}
          >
            به‌روزرسانی جدول
          </button>
        ) : null}
        {onSpecFetch && data.snapshot_id ? (
          <section className="spec-fetch-action">
            <button
              className="outline"
              disabled={specBusy}
              onClick={() => fetchSpecs(true)}
            >
              {specBusy ? "در حال تکمیل مشخصات…" : "تکمیل مشخصات از وب"}
            </button>
            {specBusy && specProgress && onSpecCancel ? (
              <button
                className="text-btn"
                onClick={() => onSpecCancel(specProgress)}
              >
                لغو تکمیل وب
              </button>
            ) : null}
            {data.base_snapshot_id && onOriginal ? (
              <button className="text-btn" onClick={onOriginal}>
                دیدن نسخه اصلی مقایسه
              </button>
            ) : null}
            <SpecProgress job={specProgress} busy={specBusy} data={shown} />
            {specError ? <p role="alert">{specError}</p> : null}
          </section>
        ) : null}
        <div className="compare-tabs" role="tablist" aria-label="نمای مقایسه">
          {[
            ["table", "جدول مقایسه", Table2],
            ["charts", "نمودارها", BarChart3],
            ["reviews", "بررسی و نظرها", GitCompareArrows],
          ].map(([key, label, Icon]) => (
            <button
              type="button"
              key={key}
              role="tab"
              id={"compare-tab-" + key}
              aria-controls="compare-panel"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>
        <div
          id="compare-panel"
          role="tabpanel"
          aria-labelledby={"compare-tab-" + tab}
        >
          {tab === "table" ? (
            <>
              <div className="compare-controls">
                <label>
                  <input
                    type="checkbox"
                    checked={details}
                    onChange={(e) => setDetails(e.target.checked)}
                  />
                  مشخصات بیشتر
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={differences}
                    onChange={(e) => setDifferences(e.target.checked)}
                  />
                  فقط تفاوت‌ها
                </label>
                <input
                  aria-label="جست‌وجو در مشخصات مقایسه"
                  placeholder="مثلاً رم، وزن، باتری…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div
                className="comparison-scroll"
                tabIndex={0}
                role="region"
                aria-label="جدول قابل جابه‌جایی مقایسه"
              >
                <table
                  className={
                    "comparison compare-table" +
                    (specBusy && !data.harmonizer ? " provisional" : "")
                  }
                >
                  <caption className="sr-only">
                    مشخصات ثبت‌شده محصول‌های انتخابی
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">مشخصه</th>
                      {shown.products.map((p, i) => (
                        <th key={p.product_id} scope="col">
                          <span className="compare-column-number">
                            {number(i + 1)}
                          </span>
                          {p.persian_title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.id}
                        className={r.different ? "is-different" : ""}
                      >
                        <th scope="row">{r.label}</th>
                        {r.cells.map((c, i) => (
                          <td
                            key={shown.products[i].product_id}
                            className={"compare-cell " + c.status}
                          >
                            <span
                              key={c.status + ":" + c.value}
                              dir="auto"
                              className={
                                c.pending
                                  ? "cell-pending"
                                  : c.status === "web_completed"
                                    ? "cell-arrived"
                                    : ""
                              }
                            >
                              {c.status === "missing" &&
                              specBusy &&
                              !data.harmonizer &&
                              !c.pending
                                ? "…"
                                : display(c, r)}
                            </span>
                            {c.status === "conflict" ? (
                              <strong>منابع متفاوت‌اند</strong>
                            ) : null}
                            {c.price_band ? (
                              <small>{c.price_band.label}</small>
                            ) : null}
                            {c.source === "public_spec" &&
                            c.research_evidence?.length ? (
                              <WebSource cell={c} />
                            ) : (
                              <small>
                                {sourceName(c.source)}
                                {c.shop_name ? " · " + c.shop_name : ""}
                              </small>
                            )}
                            <SpecEvidence cell={c} />
                            {c.raw?.length ? (
                              <details>
                                <summary>متن منبع</summary>
                                {c.raw.map((e, k) => (
                                  <p key={k}>
                                    {e.section ? e.section + " · " : ""}
                                    {e.key}: <bdi>{e.value}</bdi>
                                  </p>
                                ))}
                              </details>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!rows.length ? (
                <p className="compare-empty">مشخصه‌ای پیدا نشد.</p>
              ) : null}
            </>
          ) : null}
          {tab === "charts" ? (
            chart ? (
              <figure className="compare-chart">
                <label>
                  مشخصه قابل اندازه‌گیری
                  <select
                    aria-label="مشخصه نمودار"
                    value={chart.id}
                    onChange={(e) => setMetric(e.target.value)}
                  >
                    {shown.charts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} · {c.unit_label}
                      </option>
                    ))}
                  </select>
                </label>
                <figcaption>
                  <h3>{chart.label}</h3>
                  <p>
                    واحد: {chart.unit_label} · مقیاس مشترک از صفر تا{" "}
                    {number(maximum)}
                  </p>
                  {chart.id === "price" ? <p>کمترین قیمت ثبت‌شده</p> : null}
                </figcaption>
                <ol>
                  {chart.values.map((v, i) => (
                    <li key={v.product_id}>
                      <div className="compare-chart-label">
                        <span>
                          {number(i + 1)}. {shown.products[i].persian_title}
                        </span>
                        <strong>
                          {v.value == null
                            ? "نامشخص"
                            : number(v.value) + " " + chart.unit_label}
                        </strong>
                      </div>
                      <small>{sourceName(v.source || "catalogue")}</small>
                      <SpecEvidence cell={v} />
                      {v.value == null ? (
                        <p className="compare-missing-chart">نامشخص</p>
                      ) : (
                        <div className="compare-bar-track" aria-hidden="true">
                          <span
                            style={{
                              width:
                                (maximum ? (v.value / maximum) * 100 : 0) + "%",
                            }}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
                <p className="compare-hint">{chart.note}</p>
              </figure>
            ) : (
              <p className="compare-empty">داده کافی برای نمودار نیست.</p>
            )
          ) : null}
          {tab === "reviews" ? (
            <div className="compare-reviews">
              <BuyerReviews products={shown.products} sid={sid} />
              {onResearch && data.snapshot_id ? (
                <fieldset disabled={researching} className="research-selection">
                  <legend>تحقیق اختیاری درباره دو تا پنج مدل</legend>
                  {shown.products.map((p) => (
                    <label key={p.product_id}>
                      <input
                        type="checkbox"
                        checked={researchIds.includes(p.product_id)}
                        disabled={
                          !researchIds.includes(p.product_id) &&
                          researchIds.filter((id) => !removed.includes(id))
                            .length >= 5
                        }
                        onChange={(e) =>
                          setResearchIds((ids) =>
                            e.target.checked
                              ? [
                                  ...ids.filter((id) => !removed.includes(id)),
                                  p.product_id,
                                ].slice(0, 5)
                              : ids.filter((id) => id !== p.product_id),
                          )
                        }
                      />
                      {p.persian_title}
                    </label>
                  ))}
                  <button
                    className="outline"
                    disabled={
                      researchIds.filter((id) => !removed.includes(id)).length <
                        2 ||
                      researchIds.filter((id) => !removed.includes(id)).length >
                        5
                    }
                    onClick={investigate}
                  >
                    {researching
                      ? "در حال بررسی…"
                      : "تحقیق درباره " +
                        number(
                          researchIds.filter((id) => !removed.includes(id))
                            .length,
                        ) +
                        " مدل منتخب"}
                  </button>
                </fieldset>
              ) : null}
              {researchError ? <p role="alert">{researchError}</p> : null}
              {shown.buying_reviews?.length ? (
                <div className="researched-comparison">
                  <h3>نتیجه تحقیق مدل‌های منتخب</h3>
                  {shown.buying_reviews.map((r) => (
                    <article key={r.product_id}>
                      <h3>{r.title}</h3>
                      <GroundedAnalysis data={r.grounded_analysis} />
                      <details>
                        <summary>منابع و جزئیات</summary>
                        <ReviewCard data={r} />
                      </details>
                    </article>
                  ))}
                </div>
              ) : null}
              {shown.reviews.map((r, i) => (
                <article key={r.product_id}>
                  <h3>{shown.products[i].persian_title}</h3>
                  {onReview ? (
                    <button
                      className="outline"
                      onClick={() => onReview(r.product_id)}
                    >
                      بررسی شواهد و نقد این مدل
                    </button>
                  ) : null}
                  <p>{r.notice}</p>
                  {r.entries.map((e, k) => (
                    <p key={k}>
                      <b>{e.key}: </b>
                      <bdi>{e.value}</bdi>
                    </p>
                  ))}
                </article>
              ))}
            </div>
          ) : null}
        </div>
        <div className="compare-export">
          <button
            className="outline"
            onClick={() => exportComparison(shown, "html")}
          >
            <Download size={16} />
            ذخیره نسخه آفلاین
          </button>
          <button
            className="outline"
            onClick={() => exportComparison(shown, "csv")}
          >
            دریافت جدول CSV
          </button>
        </div>
      </div>
    </Modal>
  );
}
