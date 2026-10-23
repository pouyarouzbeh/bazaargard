import React from "react";
import {
  ArrowLeft,
  Search,
  MapPin,
  GitCompareArrows,
  ShoppingBag,
  SlidersHorizontal,
  LoaderCircle,
} from "lucide-react";

const STARTS = [
  ["product", Search, "پیدا کردن محصول"],
  ["nearby", MapPin, "فروشگاه‌های نزدیک"],
  ["compare", GitCompareArrows, "مقایسه محصولات"],
  ["basket", ShoppingBag, "سبد خرید"],
];

export default function ShoppingHome({
  input,
  setInput,
  inputRef,
  pending,
  onSubmit,
  onFilters,
  onShortcut,
  assistantAvailable,
  error,
  onRetry,
}) {
  return (
    <div className="shopping-home">
      <div className="home-intro">
        <h1>
          از «چی بخرم؟» <br />
          تا «از کجا بخرم؟»
        </h1>
      </div>
      <form
        className="home-request"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        aria-busy={pending}
      >
        <label className="sr-only" htmlFor="shopping-request">
          چه چیزی می‌خواهی بخری؟
        </label>
        <textarea
          id="shopping-request"
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            assistantAvailable
              ? "مثلاً لپ‌تاپ سبک تا ۴۰ میلیون…"
              : "نام محصول یا مدل…"
          }
          rows={2}
          maxLength={3000}
          enterKeyHint="search"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              onSubmit();
            }
          }}
        />
        <div className="home-request-foot">
          <button type="button" className="text-btn" onClick={onFilters}>
            <SlidersHorizontal size={17} />
            بودجه و محدوده
          </button>
          <button
            className="home-submit"
            type="submit"
            disabled={!input.trim() || pending}
          >
            <span>
              {pending
                ? "در حال بررسی"
                : assistantAvailable
                  ? "شروع گفت‌وگو"
                  : "پیدا کن"}
            </span>
            {pending ? (
              <LoaderCircle size={19} className="spin" />
            ) : (
              <ArrowLeft size={19} />
            )}
          </button>
        </div>
      </form>
      {error ? (
        <div className="request-error" role="alert">
          <p>{error}</p>
          <button className="btn btn-ghost" onClick={onRetry}>
            تلاش مجدد
          </button>
        </div>
      ) : null}
      <div className="home-examples">
        <span>مثلاً:</span>
        {["هدفون بی‌سیم", "لپ تاپ سبک", "گوشی سامسونگ"].map((text) => (
          <button
            key={text}
            onClick={() => {
              setInput(text);
              inputRef.current?.focus();
            }}
          >
            {text}
            <ArrowLeft size={12} />
          </button>
        ))}
      </div>
      <section className="start-options" aria-label="راه‌های شروع خرید">
        {STARTS.map(([key, Icon, title]) => (
          <button key={key} onClick={() => onShortcut(key)}>
            <Icon size={22} />
            <span>
              <b>{title}</b>
            </span>
            <ArrowLeft size={16} />
          </button>
        ))}
      </section>
    </div>
  );
}
