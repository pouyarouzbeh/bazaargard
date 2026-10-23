import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const OPTIONS = ["system", "light", "dark"];
const LABELS = { system: "هماهنگ با دستگاه", light: "روشن", dark: "تیره" };
export default function ThemeToggle() {
  const [preference, setPreference] = useState(() => {
    try {
      return localStorage.getItem("bazargard-theme") || "system";
    } catch {
      return "system";
    }
  });
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const theme =
        preference === "system"
          ? media.matches
            ? "dark"
            : "light"
          : preference;
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    };
    apply();
    media.addEventListener("change", apply);
    try {
      localStorage.setItem("bazargard-theme", preference);
    } catch {}
    return () => media.removeEventListener("change", apply);
  }, [preference]);
  const Icon =
    preference === "dark" ? Moon : preference === "light" ? Sun : Monitor;
  return (
    <button
      className="icon-btn theme-toggle"
      aria-label={
        "ظاهر: " + (LABELS[preference] || LABELS.system) + "؛ تغییر ظاهر"
      }
      title={"ظاهر: " + LABELS[preference]}
      onClick={() =>
        setPreference(
          OPTIONS[(OPTIONS.indexOf(preference) + 1) % OPTIONS.length],
        )
      }
    >
      <Icon size={19} />
    </button>
  );
}
