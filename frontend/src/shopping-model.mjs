export const formatNumber = (value) =>
  value == null ? "نامشخص" : Number(value).toLocaleString("fa-IR");

export function recordedDate(value) {
  if (!value) return "زمان ثبت نامشخص";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "زمان ثبت نامشخص"
    : new Intl.DateTimeFormat("fa-IR", {
        timeZone: "Asia/Tehran",
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}

// Counts and minima describe retrieved offers, never the whole catalogue.
export function groupProducts(offers = []) {
  const groups = new Map();
  for (const offer of offers) {
    if (!offer.product_id || !offer.offer_id) continue;
    const group = groups.get(offer.product_id) || {
      productId: offer.product_id,
      offers: [],
      best: offer,
      shopIds: new Set(),
    };
    if (group.offers.some((item) => item.offer_id === offer.offer_id)) continue;
    group.offers.push(offer);
    if (offer.shop_id != null) group.shopIds.add(offer.shop_id);
    const price = offer.effective_price_toman ?? offer.price_toman;
    const bestPrice =
      group.best.effective_price_toman ?? group.best.price_toman;
    if (price != null && (bestPrice == null || price < bestPrice))
      group.best = offer;
    groups.set(offer.product_id, group);
  }
  return [...groups.values()].map((group) => ({
    ...group,
    shopCount: group.shopIds.size,
  }));
}

export function activeFilters(profile) {
  const definitions = [
    ["brand", "برند", profile.brand],
    [
      "budget_min_toman",
      "از",
      profile.budget_min_toman != null
        ? formatNumber(profile.budget_min_toman) + " تومان"
        : null,
    ],
    [
      "budget_max_toman",
      "تا",
      profile.budget_max_toman != null
        ? formatNumber(profile.budget_max_toman) + " تومان"
        : null,
    ],
    ["neighborhood", "محدوده", profile.neighborhood],
    [
      "location",
      "",
      profile.lat != null && profile.lon != null ? "مبدأ انتخاب‌شده" : null,
    ],
    [
      "radius_km",
      "شعاع",
      profile.radius_km != null
        ? formatNumber(profile.radius_km) + " کیلومتر"
        : null,
    ],
    ["installment_only", "", profile.installment_only ? "اقساط حضوری" : null],
    ["payment_provider", "", profile.payment_provider],
    ["open_now", "", profile.open_now ? "باز طبق ساعت ثبت‌شده" : null],
    [
      "visit_at",
      "مراجعه",
      profile.visit_at ? recordedDate(profile.visit_at) : null,
    ],
  ];
  return definitions
    .filter(([, , value]) => value != null && value !== "")
    .map(([key, label, value]) => ({
      key,
      label: [label, value].filter(Boolean).join(" "),
    }));
}

export function clearedFilter(key) {
  if (key === "location") return { lat: null, lon: null, radius_km: null };
  if (key === "installment_only")
    return { installment_only: false, payment_provider: null };
  if (key === "open_now") return { open_now: false };
  return { [key]: null };
}

export function parseBudget(value) {
  if (value == null || String(value).trim() === "") return null;
  const normalized = String(value)
    .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    .replace(/[٬,\s]/g, "");
  if (!/^\d+$/.test(normalized)) return undefined;
  const number = Number(normalized);
  return Number.isSafeInteger(number) && number <= 1e13 ? number : undefined;
}
