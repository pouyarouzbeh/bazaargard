import React, { useState, useEffect } from "react";
import { LocateFixed, LoaderCircle } from "lucide-react";
import { Modal } from "./ui.jsx";
import { parseBudget } from "./shopping-model.mjs";

export default function ShoppingFilters({
  profile,
  neighborhoods = [],
  onSave,
  onClose,
  draft,
  onDraft,
}) {
  const [values, setValues] = useState({ ...(draft || profile) });
  useEffect(() => {
    onDraft?.(
      JSON.stringify(values) === JSON.stringify(profile) ? null : values,
    );
  }, [values]);
  const [scope, setScope] = useState("trip");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const change = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const budget = parseBudget(values.budget_max_toman);
    if (budget === undefined) {
      setError("بودجه را به تومان وارد کن.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(
        {
          ...values,
          budget_max_toman: budget,
          lat:
            values.neighborhood !== profile.neighborhood && values.neighborhood
              ? null
              : values.lat,
          lon:
            values.neighborhood !== profile.neighborhood && values.neighborhood
              ? null
              : values.lon,
        },
        scope,
      );
    } catch (failure) {
      setError(failure.message || "ذخیره نشد. دوباره تلاش کن.");
    } finally {
      setSaving(false);
    }
  }
  function locate() {
    if (!navigator.geolocation) {
      setError("محدوده را دستی انتخاب کن.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValues((current) => ({
          ...current,
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          neighborhood: null,
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("موقعیت دریافت نشد. محدوده را انتخاب کن.");
      },
      { timeout: 15000 },
    );
  }
  return (
    <Modal title="شرایط خرید" onClose={onClose}>
      <form className="filter-form" onSubmit={submit} aria-busy={saving}>
        <label>
          سقف بودجه · تومان
          <input
            inputMode="numeric"
            value={values.budget_max_toman ?? ""}
            placeholder="مثلاً ۳٬۰۰۰٬۰۰۰"
            onChange={(event) => change("budget_max_toman", event.target.value)}
          />
        </label>
        <label>
          برند · اختیاری
          <input
            value={values.brand || ""}
            placeholder="مثلاً سامسونگ"
            onChange={(event) => change("brand", event.target.value || null)}
          />
        </label>
        <label>
          محدوده
          <select
            value={values.neighborhood || ""}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                neighborhood: event.target.value || null,
                lat: null,
                lon: null,
                radius_km: null,
              }))
            }
          >
            <option value="">همه تهران</option>
            {neighborhoods.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </label>
        <button
          className="text-btn"
          type="button"
          onClick={locate}
          disabled={locating}
        >
          {locating ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <LocateFixed size={16} />
          )}
          {values.lat != null ? "مبدأ انتخاب شده؛ تغییر موقعیت" : "موقعیت من"}
        </button>
        <label>
          اولویت پیشنهادها
          <select
            value={values.priority || "balanced"}
            onChange={(event) => change("priority", event.target.value)}
          >
            <option value="balanced">تعادل قیمت و فاصله</option>
            <option value="price">قیمت کمتر</option>
            <option value="distance">فاصله کمتر</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!values.installment_only}
            onChange={(event) => {
              change("installment_only", event.target.checked);
              if (!event.target.checked) change("payment_provider", null);
            }}
          />
          فقط اقساط حضوری
        </label>
        <details className="advanced-filters">
          <summary>تنظیمات بیشتر</summary>
          <div className="advanced-filter-fields">
            <label>
              شعاع از مبدأ · کیلومتر
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.5"
                disabled={values.lat == null}
                value={values.radius_km ?? ""}
                onChange={(event) =>
                  change(
                    "radius_km",
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
              />
            </label>
            {values.installment_only ? (
              <label>
                سرویس اعتباری
                <select
                  value={values.payment_provider || ""}
                  onChange={(event) =>
                    change("payment_provider", event.target.value || null)
                  }
                >
                  <option value="">هر سرویس ثبت‌شده</option>
                  {["ترب‌پی", "اسنپ‌پی", "دیجی پی", "تارا"].map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={!!values.open_now}
                onChange={(event) => change("open_now", event.target.checked)}
              />
              باز طبق ساعت کاری
            </label>
            <label>
              زمان مراجعه · به وقت تهران
              <input
                type="datetime-local"
                value={values.visit_at || ""}
                onChange={(event) =>
                  change("visit_at", event.target.value || null)
                }
              />
            </label>
            <label>
              روش رفتن
              <select
                value={values.travel_mode || "driving"}
                onChange={(event) => change("travel_mode", event.target.value)}
              >
                <option value="driving">خودرو</option>
                <option value="walking">پیاده</option>
                <option value="transit">حمل‌ونقل عمومی</option>
              </select>
            </label>
            <label>
              خرید برای · اختیاری
              <input
                value={values.recipient || ""}
                onChange={(event) =>
                  change("recipient", event.target.value || null)
                }
              />
            </label>
            <label>
              ذخیره این شرایط
              <select
                value={scope}
                onChange={(event) => setScope(event.target.value)}
              >
                <option value="trip">فقط همین خرید</option>
                <option value="memory">خریدهای بعدی هم ذخیره شود</option>
              </select>
            </label>
          </div>
        </details>
        {error ? (
          <p className="feature-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="filter-sticky-actions">
          <button className="btn btn-primary" disabled={saving || locating}>
            {saving ? <LoaderCircle className="spin" size={16} /> : null}اعمال
            شرایط
          </button>
          <button
            type="button"
            className="text-btn"
            disabled={saving}
            onClick={() =>
              setValues((current) => ({
                ...current,
                budget_min_toman: null,
                budget_max_toman: null,
                brand: null,
                neighborhood: null,
                lat: null,
                lon: null,
                radius_km: null,
                installment_only: false,
                payment_provider: null,
                open_now: false,
                visit_at: null,
                spec_filters: null,
                priority: "balanced",
              }))
            }
          >
            پاک کردن فیلترها
          </button>
        </div>
      </form>
    </Modal>
  );
}
