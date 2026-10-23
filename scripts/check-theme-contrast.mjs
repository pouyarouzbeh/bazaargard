import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

// Validate actual CSS tokens rather than maintaining a second palette in tests.
const source = readFileSync(
  new URL("../frontend/src/theme.css", import.meta.url),
  "utf8",
);
const blocks = [...source.matchAll(/:root([^{}]*)\{([^{}]*)\}/g)];
const tokens = (body) =>
  Object.fromEntries(
    [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [
      m[1],
      m[2].trim(),
    ]),
  );
const light = tokens(blocks.find((b) => !b[1].trim())[2]);
const dark = {
  ...light,
  ...tokens(blocks.find((b) => b[1].includes('data-theme="dark"'))[2]),
};
function value(theme, name, seen = new Set()) {
  assert(!seen.has(name), `Cyclic color token: ${name}`);
  seen.add(name);
  const raw = theme[name];
  assert(raw, `Missing color token: ${name}`);
  const alias = /^var\((--[\w-]+)\)$/.exec(raw);
  if (alias) return value(theme, alias[1], seen);
  assert(
    /^#[0-9a-f]{6}$/i.test(raw),
    `Expected opaque sRGB color for ${name}: ${raw}`,
  );
  return raw;
}
function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
const pairs = [];
for (const surface of [
  "--color-background",
  "--color-surface",
  "--surface-subtle",
]) {
  for (const foreground of [
    "--color-foreground",
    "--foreground-secondary",
    "--color-muted",
  ])
    pairs.push([foreground, surface, 4.5]);
  pairs.push(["--control-border", surface, 3], ["--focus", surface, 3]);
}
for (const [ink, soft] of [
  ["--color-primary", "--primary-soft"],
  ["--color-accent", "--accent-soft"],
  ["--color-success", "--success-soft"],
  ["--color-warning", "--warning-soft"],
  ["--color-danger", "--danger-soft"],
  ["--info", "--info-soft"],
]) {
  pairs.push([ink, soft, 4.5], [ink, "--color-surface", 4.5]);
}
pairs.push(
  ["--primary-foreground", "--color-primary", 4.5],
  ["--primary-foreground", "--primary-hover", 4.5],
  ["--success-foreground", "--color-success", 4.5],
  ["--info-foreground", "--info", 4.5],
  ["--inverse", "--inverse-surface", 4.5],
  ["--color-foreground", "--selection", 4.5],
  ["--map-marker-foreground", "--map-marker", 4.5],
  ["--map-marker-foreground", "--map-plan-marker", 4.5],
  ["--media-foreground", "--media-surface", 4.5],
);
for (const [mode, theme] of Object.entries({ light, dark })) {
  const results = pairs.map(([fg, bg, min]) => {
    const ratio = contrast(value(theme, fg), value(theme, bg));
    assert(
      ratio >= min,
      `${mode}: ${fg} / ${bg} = ${ratio.toFixed(2)}; minimum ${min}`,
    );
    return ratio;
  });
  console.log(
    `${mode}: ${results.length} semantic contrast pairs passed; lowest ${Math.min(...results).toFixed(2)}:1`,
  );
}
