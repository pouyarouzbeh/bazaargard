import React, { useState, lazy, Suspense } from "react";
import { Modal } from "./ui.jsx";
import { call } from "./features.jsx";
import "./areas.css";
const ShoppingAreas = lazy(() => import("./areas.jsx"));
const labels = {
  blocked: "منبع مسدود",
  timeout: "منبع کند یا بی‌پاسخ",
  unavailable: "منبع در دسترس نبود",
  readable: "متن خوانده شد",
  unreadable: "متن قابل خواندن نبود",
  unsupported_content: "قالب پشتیبانی نشده",
};
export default function ExternalDiscovery({
  sid,
  query = "",
  productId,
  snapshot,
  onClose,
  onSaved,
}) {
  const [data, setData] = useState(snapshot),
    [value, setValue] = useState(
      (query || snapshot?.query || "").slice(0, 160),
    ),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function search(e) {
    e.preventDefault();
    if (pending || !value.trim()) return;
    setPending(true);
    setError("");
    try {
      const result = await call("external-discovery", {
        session_id: sid,
        query: value.trim(),
        product_id:
          productId && value.trim() === query.slice(0, 160).trim()
            ? productId
            : undefined,
      });
      setData(result);
      onSaved?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal title="سرنخ عمومی خرید حضوری تهران" wide onClose={onClose}>
      <div className="external-discovery" dir="rtl">
        <form className="area-search" onSubmit={search}>
          <label>
            نام کوتاه کالا و مدل دقیق
            <input
              aria-label="مدل برای جست‌وجوی حضوری تهران"
              value={value}
              maxLength={160}
              onChange={(e) => setValue(e.target.value)}
              placeholder="مثلاً گوشی A55"
            />
          </label>
          <button className="outline" disabled={pending || !value.trim()}>
            {pending ? "بررسی محدود منابع عمومی…" : "بررسی سرنخ حضوری"}
          </button>
        </form>
        {error ? <p role="alert">{error}</p> : null}
        {data ? (
          <>
            <p>
              {data.cached ? "نسخه ذخیره‌شده منابع" : "دریافت تازه منابع"} · ثبت
              بررسی: {new Date(data.created * 1000).toLocaleString("fa-IR")}
            </p>
            <section>
              <h3>اولویت با آفرهای واجد شرایط دیتاست</h3>
              {data.catalogue.offers.length ? (
                data.catalogue.offers.map((o) => (
                  <article className="external-catalogue" key={o.offer_id}>
                    <strong>{o.persian_title}</strong>
                    <p>
                      {o.shop_name} ·{" "}
                      {Number(
                        o.effective_price_toman ?? o.price_toman,
                      ).toLocaleString("fa-IR")}{" "}
                      تومان ·{" "}
                      {o.price_basis === "simulated"
                        ? "قیمت ساختگی سناریو"
                        : "قیمت ثبت‌شده یا گزارش برچسب‌دار؛ زنده تأیید نشده"}
                    </p>
                    <p>{o.address}</p>
                  </article>
                ))
              ) : (
                <p>پیشنهاد مطابق شرایط پیدا نشد.</p>
              )}
            </section>
            <section>
              <h3>سرنخ بیرونی · هنوز فروشنده واجد شرایط نیست</h3>
              <p>{data.notice}</p>
              {data.leads.length ? (
                <div className="area-cards">
                  {data.leads.map((lead, i) => (
                    <article key={i}>
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="auto"
                      >
                        {lead.title}
                      </a>
                      <p>
                        {lead.address || "آدرس دقیق در متن قابل اتکا پیدا نشد."}
                      </p>
                      <p>{lead.notice}</p>
                      <p>کد مدل منطبق؛ موجودی نامشخص</p>
                      <small>
                        دریافت:{" "}
                        {new Date(lead.retrieved_at * 1000).toLocaleString(
                          "fa-IR",
                        )}{" "}
                        · منبع نشانی:{" "}
                        {lead.tehran_evidence === "catalogue_shop_address"
                          ? "نشانی فروشگاه دارای وب‌سایت در دیتاست"
                          : "اشاره صفحه به تهران"}
                      </small>
                      {lead.outside_radius ||
                      lead.location_constraint_unverified ? (
                        <p className="area-outside">محدوده تأیید نشده</p>
                      ) : null}
                      {lead.budget_constraint_unverified ||
                      lead.credit_constraint_unverified ? (
                        <p className="area-outside">
                          قیمت و شرایط پرداخت نامشخص
                        </p>
                      ) : null}
                      {lead.price_texts.length ? (
                        <details>
                          <summary>
                            متن قیمت در صفحه؛ قطعی و قابل مقایسه نیست
                          </summary>
                          <p>
                            {lead.price_texts.join(" / ")} تومان · احتمال چند
                            نسخه/قیمت وجود دارد.
                          </p>
                        </details>
                      ) : null}
                      {lead.maps_url ? (
                        <a
                          href={lead.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          جست‌وجوی نشانی در نقشه؛ محل دقیق تأیید نشده
                        </a>
                      ) : null}
                      <ul>
                        <li>مدل و آدرس را از فروشنده بپرسید.</li>
                        <li></li>
                      </ul>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="area-empty">فروشنده‌ای برای این مدل پیدا نشد.</p>
              )}
            </section>
            <details>
              <summary>وضعیت منابع و سقف جست‌وجو</summary>
              {data.sources.map((s, i) => (
                <p key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {new URL(s.url).hostname}
                  </a>{" "}
                  · {labels[s.status] || s.status}
                  {s.reason ? " · تطابق مدل/تهران/خرید حضوری اثبات نشد" : ""}
                </p>
              ))}
            </details>
            <Suspense fallback={<p>آماده‌سازی راهنمای ناحیه‌ای…</p>}>
              <ShoppingAreas
                sid={sid}
                initial={data.areas}
                query={data.areas.topic || ""}
              />
            </Suspense>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
