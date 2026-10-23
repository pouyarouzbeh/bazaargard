import React, { useState } from "react";
import {
  ShoppingBag,
  ArrowLeft,
  GitCompareArrows,
  Check,
  Store,
  CalendarDays,
} from "lucide-react";
import { formatNumber, recordedDate } from "./shopping-model.mjs";

export default function ProductCard({
  group,
  selected,
  onSelect,
  onOpen,
  onSellers,
}) {
  const offer = group.best;
  const [badImage, setBadImage] = useState(false);
  const specs = (offer.specs || [])
    .filter(
      (spec) =>
        spec.key &&
        spec.value != null &&
        spec.value !== "" &&
        spec.value !== "null" &&
        spec.value !== "title",
    )
    .slice(0, 3);
  const price = offer.effective_price_toman ?? offer.price_toman;
  return (
    <article className={"product-choice" + (selected ? " is-selected" : "")}>
      <div className="product-choice-media">
        <button
          onClick={onOpen}
          className="product-image-action"
          aria-label={"جزئیات " + offer.persian_title}
        >
          {offer.image_urls?.[0] && !badImage ? (
            <img
              src={offer.image_urls[0]}
              alt={offer.persian_title}
              onError={() => setBadImage(true)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="image-unavailable">
              <ShoppingBag size={38} />
              <small>تصویر ثبت نشده</small>
            </span>
          )}
        </button>
        <button
          className="product-compare"
          aria-label={"انتخاب برای مقایسه " + offer.persian_title}
          aria-pressed={selected}
          onClick={onSelect}
        >
          {selected ? <Check size={18} /> : <GitCompareArrows size={18} />}
        </button>
      </div>
      <div className="product-choice-body">
        <span className="product-category">
          {offer.category_name}
          {offer.brand_name && offer.brand_name !== "null"
            ? " · " + offer.brand_name
            : ""}
        </span>
        <h3>
          <button onClick={onOpen}>{offer.persian_title}</button>
        </h3>
        {specs.length ? (
          <dl className="choice-specs">
            {specs.map((spec, index) => (
              <div key={spec.key + index}>
                <dt>{spec.key}</dt>
                <dd dir="auto">{String(spec.value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="specs-unavailable">مشخصات تکمیلی ثبت نشده</p>
        )}
        <div className="choice-price">
          <small>
            {offer.price_basis === "simulated"
              ? "قیمت شبیه‌سازی‌شده"
              : offer.price_basis && offer.price_basis !== "dataset"
                ? "کمترین قیمت گزارش‌شده"
                : "کمترین قیمت این فهرست"}
          </small>
          <div>
            <b>{formatNumber(price)}</b>
            {price != null ? <span>تومان</span> : null}
          </div>
        </div>
        <div className="choice-source">
          <span>
            <Store size={14} />
            {formatNumber(group.shopCount)} فروشگاه در این نتایج
          </span>
          <time dateTime={offer.last_price_changed_at || undefined}>
            <CalendarDays size={14} />
            آخرین تغییر: {recordedDate(offer.last_price_changed_at)}
          </time>
        </div>
        <button className="btn btn-primary btn-block" onClick={onSellers}>
          مشاهده فروشگاه‌ها
          <ArrowLeft size={17} />
        </button>
      </div>
    </article>
  );
}
