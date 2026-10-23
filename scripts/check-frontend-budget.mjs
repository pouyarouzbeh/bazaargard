import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "frontend/dist");
const html = readFileSync(resolve(dist, "index.html"), "utf8");
const paths = [...html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))"/g)].map(
  (match) => match[1],
);
const totals = { js: 0, css: 0 };
for (const path of new Set(paths)) {
  if (/^(https?:)?\/\//.test(path))
    throw Error("Unexpected external runtime asset: " + path);
  const file = resolve(dist, path.replace(/^\.?\//, ""));
  if (!file.startsWith(dist + "/") && !file.startsWith(dist + "\\"))
    throw Error("Asset escapes dist");
  if (!existsSync(file) || !statSync(file).isFile())
    throw Error("Missing built asset: " + path);
  totals[path.endsWith(".css") ? "css" : "js"] += gzipSync(
    readFileSync(file),
  ).length;
}
const limits = { js: 220 * 1024, css: 40 * 1024 };
for (const type of ["js", "css"]) {
  console.log(
    `${type.toUpperCase()}: ${(totals[type] / 1024).toFixed(1)} KiB gzip / ${limits[type] / 1024} KiB`,
  );
  if (totals[type] > limits[type]) process.exitCode = 1;
}
if (!paths.length) throw Error("No referenced Vite assets found");
