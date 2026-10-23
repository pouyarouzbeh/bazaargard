import React, { useEffect, useState } from "react";

const CHECKS = [
  ["price", "قیمت و موجودی را پرسیدم"],
  ["hours", "ساعت کاری را بررسی کردم"],
  ["address", "آدرس را بررسی کردم"],
];

export default function PurchaseChecklist({ sid, items }) {
  const signature = items
    .map((item) =>
      [
        item.offer_id,
        item.effective_price_toman ?? item.price_toman,
        item.quantity || 1,
      ].join(":"),
    )
    .join("|");
  const [checked, setChecked] = useState({});
  useEffect(() => {
    let saved;
    try {
      saved = JSON.parse(
        localStorage.getItem("hamrah-checklist-" + sid) || "null",
      );
    } catch {}
    setChecked(saved?.signature === signature ? saved.checked || {} : {});
  }, [sid, signature]);
  function toggle(key, value) {
    const next = { ...checked, [key]: value };
    setChecked(next);
    try {
      localStorage.setItem(
        "hamrah-checklist-" + sid,
        JSON.stringify({ signature, checked: next }),
      );
    } catch {}
  }
  return (
    <section className="purchase-checklist" aria-labelledby="checklist-title">
      <h2 id="checklist-title">چک‌لیست من</h2>
      {CHECKS.map(([key, label]) => (
        <label key={key}>
          <input
            type="checkbox"
            checked={!!checked[key]}
            onChange={(event) => toggle(key, event.target.checked)}
          />
          <span>{label}</span>
        </label>
      ))}
    </section>
  );
}
