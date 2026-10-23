import test from "node:test";
import assert from "node:assert/strict";
import {
  toast,
  getToastSnapshot,
  TOAST_EXIT_DURATION,
} from "./butterpop-store.mjs";

test("Peony toast deduplicates, updates a stable id and preserves its tone", async () => {
  const id = toast.success("ثبت شد", { preventDuplicates: true });
  assert.equal(toast.success("ثبت شد", { preventDuplicates: true }), id);
  toast.update(id, "به برنامه اضافه شد");
  const record = getToastSnapshot().find((item) => item.id === id);
  assert.equal(record.tone, "success");
  assert.equal(record.message, "به برنامه اضافه شد");
  toast.dismiss(id);
  assert.equal(
    getToastSnapshot().find((item) => item.id === id).phase,
    "closing",
  );
  await new Promise((resolve) => setTimeout(resolve, TOAST_EXIT_DURATION + 25));
  assert.equal(
    getToastSnapshot().some((item) => item.id === id),
    false,
  );
});
