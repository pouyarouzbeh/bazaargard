import test from "node:test";
import assert from "node:assert/strict";
import {
  activeFilters,
  clearedFilter,
  groupProducts,
  recordedDate,
  parseBudget,
} from "./shopping-model.mjs";

test("Persian and Arabic budgets normalize without accepting invalid amounts", () => {
  assert.equal(parseBudget("۳٬۰۰۰٬۰۰۰"), 3000000);
  assert.equal(parseBudget("٤,٥٠٠,٠٠٠"), 4500000);
  assert.equal(parseBudget(""), null);
  assert.equal(parseBudget(0), 0);
  assert.equal(parseBudget("-10"), undefined);
  assert.equal(parseBudget("2.5"), undefined);
  assert.equal(parseBudget("Infinity"), undefined);
});

test("groups only actual offers, deduplicates and retains zero price semantics", () => {
  const groups = groupProducts([
    { product_id: "p", offer_id: "a", shop_id: "one", price_toman: 12 },
    { product_id: "p", offer_id: "b", shop_id: "one", price_toman: 10 },
    {
      product_id: "p",
      offer_id: "c",
      shop_id: "two",
      price_toman: 11,
      effective_price_toman: 0,
    },
    { product_id: "p", offer_id: "a", shop_id: "one", price_toman: 12 },
    { product_id: "other", offer_id: "d", shop_id: "two", price_toman: null },
    { product_id: "missing-offer" },
  ]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].offers.length, 3);
  assert.equal(groups[0].shopCount, 2);
  assert.equal(groups[0].best.offer_id, "c");
  assert.equal(groups[1].best.price_toman, null);
});

test("active criteria preserve missing/false/zero and hide raw coordinates", () => {
  const filters = activeFilters({
    budget_max_toman: 0,
    installment_only: false,
    lat: 0,
    lon: 0,
    brand: "سامسونگ",
    neighborhood: null,
  });
  assert.deepEqual(
    filters.map((f) => f.key),
    ["brand", "budget_max_toman", "location"],
  );
  assert.ok(filters[1].label.includes("۰"));
  assert.equal(filters[2].label, "مبدأ انتخاب‌شده");
});

test("clearing one criterion leaves unrelated criteria to the server merge", () => {
  assert.deepEqual(clearedFilter("budget_max_toman"), {
    budget_max_toman: null,
  });
  assert.deepEqual(clearedFilter("location"), {
    lat: null,
    lon: null,
    radius_km: null,
  });
  assert.deepEqual(clearedFilter("installment_only"), {
    installment_only: false,
    payment_provider: null,
  });
});

test("recorded dates safely handle absent and invalid source data", () => {
  assert.equal(recordedDate(null), "زمان ثبت نامشخص");
  assert.equal(recordedDate("broken"), "زمان ثبت نامشخص");
  assert.notEqual(recordedDate("2026-10-23T08:00:00+03:30"), "زمان ثبت نامشخص");
});
