import React, { useEffect, useState } from "react";
import { Modal } from "./ui.jsx";
import { call } from "./features.jsx";
import "./buying-review.css";
const date = (n) =>
  n
    ? new Date(n * 1000).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })
    : "نامشخص";
const state = {
  blocked: "دسترسی مسدود",
  timeout: "منبع پاسخ نداد",
  unavailable: "در دسترس نبود",
  unreadable: "متن قابل خواندن نبود",
  unsupported_content: "قالب قابل خواندن نبود",
  readable: "خوانده شد",
  redirect_limit: "تغییر مسیر بیش از حد",
};
function Sources({ items, empty }) {
  return items?.length ? (
    <div className="review-sources">
      {items.map((s, i) => (
        <article key={i}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" dir="auto">
            {s.title || new URL(s.url).hostname}
          </a>
          <p>
            {state[s.status] || s.status} · دریافت: {date(s.retrieved_at)} ·
            انتشار: {date(s.published_at)}
          </p>
          <p>
            مدل:{" "}
            {s.match?.status === "model_tokens_match"
              ? "کد مدل در متن پیدا شد"
              : "تطابق مدل اثبات نشد"}
            ؛{" "}
            {s.match?.configuration === "matched_test_unit"
              ? "مدل منطبق"
              : "پیکربندی آزمایش‌شده تأیید نشده است."}
          </p>
          {s.excerpts?.map((t, k) => (
            <blockquote key={k} dir="auto">
              {t}
            </blockquote>
          ))}
          {s.match?.configuration_checks?.length ? (
            <details>
              <summary>بررسی پیکربندی نمونه آزمایش‌شده</summary>
              {s.match.configuration_checks.map((c) => (
                <p key={c.field}>
                  {c.label}: {c.recorded || "در دیتاست نیست"} ·{" "}
                  {c.status === "matched_in_test_unit"
                    ? "در نمونه آزمایش‌شده تطبیق داشت"
                    : c.status === "conflict"
                      ? "تعارض در دیتاست"
                      : "تأیید نشده"}
                </p>
              ))}
            </details>
          ) : null}
          <small>{s.evidence_label}</small>
        </article>
      ))}
    </div>
  ) : (
    <p className="review-unknown">{empty}</p>
  );
}
const claimName = {
  strength: "نقطه قوت مستند",
  weakness: "محدودیت مستند",
  fit: "تناسب و کاربرد",
  uncertainty: "هنوز نامشخص",
};
export function GroundedAnalysis({ data }) {
  return (
    <div className="grounded-analysis">
      {data?.claims?.length ? (
        data.claims.map((c, i) => (
          <article key={i}>
            <strong>{claimName[c.kind]}</strong>
            <p>{c.text}</p>
            <small>
              تحلیل دستیار بر پایه{" "}
              {c.evidence.map((e, k) => (
                <React.Fragment key={k}>
                  {k ? "، " : ""}
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noopener noreferrer">
                      {e.kind === "community"
                        ? "متن انجمن"
                        : e.kind === "specialist"
                          ? "نظر نویسنده نقد"
                          : e.kind === "manufacturer"
                            ? "اظهار سازنده"
                            : "منبع عمومی"}
                    </a>
                  ) : (
                    "واقعیت ثبت‌شده دیتاست"
                  )}
                </React.Fragment>
              ))}
            </small>
          </article>
        ))
      ) : (
        <p className="review-unknown">تحلیل بیشتری در دسترس نیست.</p>
      )}
    </div>
  );
}
export function ReviewCard({ data }) {
  return (
    <div className="buying-review" dir="rtl">
      <h2>{data.title}</h2>
      <p className="review-notice">{data.notice}</p>
      <p>
        ثبت بررسی: {date(data.created)} ·{" "}
        {data.research.cached ? "نسخه ذخیره‌شده منابع" : "دریافت تازه منابع"}
      </p>
      <section>
        <h3>روی کاغذ · واقعیت ثبت‌شده در دیتاست</h3>
        <dl>
          {data.recorded_facts.map((f, i) => (
            <div key={i}>
              <dt>{f.label}</dt>
              <dd dir="auto">
                {f.value}
                {f.status === "conflict" ? (
                  <strong> · تعارض در داده</strong>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
        {!data.recorded_facts.length ? (
          <p>مشخصه قابل اتکایی برای این فیلدها ثبت نشده است.</p>
        ) : null}
        <p>
          مشخصات غایب:{" "}
          {data.missing_facts.join("، ") || "در این فیلدها موردی نیست"}
        </p>
        <p>
          {data.catalogue.offers.length
            ? `${data.catalogue.offers.length.toLocaleString("fa-IR")} آفر دیتاست مطابق قیود فعلی پیدا شد؛ موجودی زنده نیست.`
            : "پیشنهاد مطابق شرایط پیدا نشد."}
        </p>
        {data.catalogue.offers.map((o) => (
          <p key={o.offer_id}>
            {o.persian_title} · {o.shop_name} ·{" "}
            {Number(o.effective_price_toman ?? o.price_toman).toLocaleString(
              "fa-IR",
            )}{" "}
            تومان (ثبت‌شده)
          </p>
        ))}
      </section>
      {data.condition_evidence?.length ? (
        <section>
          <h3>وضعیت آگهی و بازرسی حضوری</h3>
          {data.condition_evidence.map((c, i) => (
            <p className="review-unknown" key={i}>
              عبارت ثبت‌شده: «{c.wording}» · {c.notice}
            </p>
          ))}
        </section>
      ) : null}
      <section>
        <h3>تحلیل دستیار و تناسب با نیاز</h3>
        {data.assistant_analysis.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
        <GroundedAnalysis data={data.grounded_analysis} />
      </section>
      <section>
        <h3>مشخصات پایه با شاهد وب</h3>
        {data.basic_spec_evidence?.length ? (
          data.basic_spec_evidence.map((f, i) => (
            <article key={i}>
              <bdi>
                {f.field}: {f.value}
              </bdi>
              <p>
                {f.status === "accepted"
                  ? "مدل و پیکربندی ایستا منطبق"
                  : "نامطمئن؛ برای تکمیل پذیرفته نشد"}{" "}
                ·{" "}
                <a href={f.url} target="_blank" rel="noopener noreferrer">
                  منبع مشخصه
                </a>{" "}
                · دریافت {date(f.retrieved_at)}
              </p>
              <blockquote dir="auto">{f.quote}</blockquote>
              <small>
                {f.model_match} · {f.variant_match}
              </small>
            </article>
          ))
        ) : (
          <p>مشخصه پایه قابل انتساب از وب دریافت نشد.</p>
        )}
      </section>
      <section>
        <h3>اطلاعات مکمل وب · جدا از دیتاست</h3>
        {data.external_facts?.length ? (
          data.external_facts.map((f, i) => (
            <p key={i}>
              {f.label}:{" "}
              <bdi>
                {f.values.join(" / ")} {f.unit}
              </bdi>{" "}
              ·{" "}
              {f.status === "ambiguous"
                ? "چند مقدار در منبع؛ انتساب به این کالا نامشخص"
                : "اظهار منبع؛ پیکربندی تأیید نشده"}{" "}
              ·{" "}
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                منبع
              </a>
            </p>
          ))
        ) : (
          <p>واقعیت مکمل قابل انتساب در این بررسی یافت نشد.</p>
        )}
        {data.external_conflicts?.map((c, i) => (
          <p className="review-unknown" key={i}>
            {c.label}: دیتاست {c.recorded} / وب {c.external} · {c.notice}
          </p>
        ))}
      </section>
      <section>
        <h3>بررسی تخصصی · متن قابل خواندن</h3>
        <Sources
          items={data.specialist_reviews}
          empty="بررسی تخصصی پیدا نشد."
        />
      </section>
      <section>
        <h3>اظهارات سازنده</h3>
        <Sources
          items={data.manufacturer_sources}
          empty="منبع سازنده قابل خواندن و منطبق در این بررسی نداریم."
        />
      </section>
      <section>
        <h3>تجربه مشتری و انجمن</h3>
        <p>{data.customer_notice}</p>
        <Sources items={data.community_evidence} empty="نظری پیدا نشد." />
        <p>{data.aggregate_reviews.notice}</p>
      </section>
      <section>
        <h3>هنوز از فروشنده بپرسید</h3>
        <ul>
          {data.seller_questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>
      <details>
        <summary>منابع دیگر و محدودیت دسترسی</summary>
        <p>{data.research.notice}</p>
        <p>
          جست‌وجوی عمومی:{" "}
          {state[data.research.discovery.status] ||
            data.research.discovery.status}
        </p>
        <Sources
          items={[...data.other_sources, ...data.unavailable_sources]}
          empty="منبع دیگری پیدا نشد."
        />
      </details>
    </div>
  );
}
export default function BuyingReview({
  sid,
  productId,
  snapshot,
  onClose,
  onSaved,
}) {
  const [data, setData] = useState(snapshot),
    [error, setError] = useState("");
  useEffect(() => {
    if (snapshot) return;
    let active = true;
    call("buying-review", { session_id: sid, product_id: productId })
      .then((d) => {
        if (active) {
          setData(d);
          onSaved?.();
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [sid, productId, snapshot]);
  return (
    <Modal title="کارت بررسی خرید" onClose={onClose} wide>
      {error ? (
        <p role="alert">{error}</p>
      ) : data ? (
        <ReviewCard data={data} />
      ) : (
        <p role="status">در حال بررسی منابع…</p>
      )}
    </Modal>
  );
}
