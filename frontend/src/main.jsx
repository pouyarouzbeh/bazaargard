import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Send,
  MapPin,
  SlidersHorizontal,
  Plus,
  MessageCircle,
  Map,
  LayoutGrid,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  X,
  Navigation,
  Clock,
  Store,
  GitCompareArrows,
  Bookmark,
  Trash2,
  Download,
  LocateFixed,
  LoaderCircle,
  Info,
  Phone,
  Wallet,
  Footprints,
  Menu,
  RotateCcw,
  Copy,
  FlaskConical,
  Route,
  ShoppingBag,
  MoreHorizontal,
  History,
  Brain,
  ChevronLeft,
  PanelRightClose,
  PanelRightOpen,
  Server,
  Camera,
  Globe,
  CalendarClock,
  ShieldCheck,
  ArrowUpDown,
  Users,
  Building2,
  Calculator,
} from "lucide-react";
import Markdown from "react-markdown";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "./theme.css";
import "./style.css";
import "./shopping-experience.css";
import ShoppingHome from "./shopping-home.jsx";
import ShoppingFilters from "./shopping-filters.jsx";
import ProductCard from "./product-card.jsx";
import ThemeToggle from "./theme-toggle.jsx";
import Toaster from "./toaster.jsx";
import { toast } from "./butterpop-store.mjs";
import {
  activeFilters,
  clearedFilter,
  groupProducts,
  recordedDate,
} from "./shopping-model.mjs";
import "./dialogs.css";
import { FollowUpChannels } from "./followup";
import { DataFacts } from "./datafacts";
import { DevConsole, DevMenuItem } from "./devconsole.jsx";
import { ShopRefresh, FreshnessBoard, RefreshLink } from "./freshness.jsx";
import { Modal } from "./ui.jsx";
import { LocationPanel } from "./locations.jsx";
import {
  Inspection,
  Indoor,
  Timing,
  Decision,
  MerchantRequest,
  SellerPortal,
  Quotes,
  Mission,
  Basket,
  Costs,
  PhotoSearch,
  ShopperProfiles,
  Street,
  call,
  copyText,
} from "./features.jsx";
const ExternalDiscovery = lazy(() => import("./external-discovery.jsx"));
const WebAlternatives = lazy(() => import("./web-alternatives.jsx"));
const ShoppingAreas = lazy(() => import("./areas.jsx"));
const BuyingReview = lazy(() => import("./buying-review.jsx"));
const Comparison = lazy(() => import("./comparison.jsx"));
const Ops = lazy(() => import("./ops.jsx"));
const MapView = lazy(() => import("./map.jsx"));
const PlanPage = lazy(() =>
  import("./pages.jsx").then((m) => ({ default: m.PlanPage })),
);
const ShopPage = lazy(() =>
  import("./pages.jsx").then((m) => ({ default: m.ShopPage })),
);
const ProductPage = lazy(() =>
  import("./pages.jsx").then((m) => ({ default: m.ProductPage })),
);
const WebAltPanel = lazy(() =>
  import("./web-alternatives.jsx").then((m) => ({ default: m.WebAltPanel })),
);
const compactLayout = () => window.matchMedia("(max-width:1023px)").matches;
const PAGES = ["home", "chat", "results", "map", "plan", "shop", "product"];
function parseHash() {
  const [p, arg] = (location.hash.replace(/^#\/?/, "") || "").split("/");
  return {
    page: PAGES.includes(p) ? p : "home",
    arg: arg ? decodeURIComponent(arg) : null,
  };
}
function go(page, arg) {
  const h = "#/" + page + (arg ? "/" + encodeURIComponent(arg) : "");
  if (location.hash !== h) location.hash = h;
}
function planEntry(o) {
  const keep = [
    "offer_id",
    "product_id",
    "shop_id",
    "persian_title",
    "category_name",
    "shop_name",
    "address",
    "location_label",
    "lat",
    "lon",
    "effective_price_toman",
    "price_toman",
    "in_person_credit",
    "opening",
    "distance_km",
    "last_price_changed_at",
    "price_basis",
  ];
  const e = Object.fromEntries(keep.map((k) => [k, o[k]]));
  e.image_urls = (o.image_urls || []).slice(0, 1);
  e.quantity = o.quantity || 1;
  return e;
}
const API = new URL("api/", document.baseURI).pathname;
const money = (n) => (n == null ? "نامشخص" : Number(n).toLocaleString("fa-IR"));
const num = (n) => Number(n).toLocaleString("fa-IR");
function warrantyText(value) {
  try {
    const w = JSON.parse(value);
    return typeof w === "object"
      ? Object.values(w || {})
          .filter((x) => x != null)
          .join(" · ")
      : String(w);
  } catch {
    return String(value || "نامشخص");
  }
}
const FACT_NAMES = {
  budget_max_toman: "سقف بودجه",
  budget_min_toman: "حداقل بودجه",
  installment_only: "فقط قسطی حضوری",
  payment_provider: "سرویس اعتباری",
  neighborhood: "محدوده",
  lat: "عرض جغرافیایی",
  lon: "طول جغرافیایی",
  radius_km: "شعاع جست‌وجو",
  needs: "نیاز شما",
  brand: "برند",
  priority: "اولویت",
  open_now: "طبق برنامه باز",
  travel_mode: "شیوه رفتن",
  visit_at: "زمان مراجعه",
  product_query: "محصول موردنظر",
  recipient: "خرید برای",
  spec_filters: "انتخاب مشخصات",
};
async function api(path, body, method) {
  const m = method || (body ? "POST" : "GET");
  let r;
  for (let i = 0; ; i++) {
    try {
      r = await fetch(API + path, {
        method: m,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (m === "GET" && r.status >= 502 && r.status <= 504 && i < 2)
        throw Error("gateway");
      break;
    } catch (e) {
      if (m !== "GET" || i >= 2)
        throw Error("اتصال برقرار نشد. دوباره تلاش کنید.");
      await new Promise((z) => setTimeout(z, 700 * (i + 1)));
    }
  }
  if (!r.ok) {
    let e;
    try {
      e = await r.json();
    } catch {}
    const x = Error(e?.detail || "ارتباط برقرار نشد");
    x.status = r.status;
    if (r.status === 423)
      window.dispatchEvent(
        new CustomEvent("hamrah-terminated", { detail: x.message }),
      );
    throw x;
  }
  return r.json();
}
function Logo({ size = 44 }) {
  return (
    <svg
      className="logo-svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="14" fill="var(--brand)" />
      <path
        d="M14.5 19.5h19l-1.7 16a3.2 3.2 0 0 1-3.2 2.9H19.4a3.2 3.2 0 0 1-3.2-2.9z"
        fill="var(--primary-foreground)"
      />
      <path
        d="M19 19.5v-2.6a5 5 0 0 1 10 0v2.6"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M24 24.3a4 4 0 0 0-4 4c0 3 4 6.3 4 6.3s4-3.3 4-6.3a4 4 0 0 0-4-4z"
        fill="var(--brand)"
      />
      <circle cx="24" cy="28.3" r="1.5" fill="var(--primary-foreground)" />
    </svg>
  );
}
function IconButton({ label, children, ...props }) {
  return (
    <button className="icon-btn" title={label} aria-label={label} {...props}>
      {children}
    </button>
  );
}
function App() {
  const [initialError, setInitialError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [assistantAvailable, setAssistantAvailable] = useState(false);
  const lastSearch = useRef(null);
  const followConversation = useRef(true);
  const homeInputRef = useRef(null);
  const filterDrafts = useRef({});
  const setToast = (message) =>
    message ? toast(message, { preventDuplicates: true }) : toast.dismiss();
  const [boot, setBoot] = useState(null),
    [sid, setSid] = useState(""),
    [sessions, setSessions] = useState([]),
    [facts, setFacts] = useState([]),
    [turns, setTurns] = useState([]),
    [results, setResults] = useState({ offers: [] }),
    [events, setEvents] = useState([]),
    [query, setQuery] = useState(""),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [searching, setSearching] = useState(false),
    [status, setStatus] = useState(""),
    [trace, setTrace] = useState([]),
    [modal, setModal] = useState(null),
    [selected, setSelected] = useState([]),
    [comparison, setComparison] = useState(null),
    [route, setRoute] = useState(null),
    [contact, setContact] = useState(null),
    [sidebar, setSidebar] = useState(false),
    [backQuery, setBackQuery] = useState(null);
  const [nav, setNav] = useState(parseHash),
    [chatHidden, setChatHidden] = useState(false),
    [planState, setPlanState] = useState({ sid: "", items: [] });
  useEffect(() => {
    const on = () => {
      setNav(parseHash());
      setToolsOpen(false);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const planItems = planState.sid === sid ? planState.items : [];
  const setPlanItems = (next) =>
    setPlanState((ps) => ({
      sid: ps.sid,
      items: typeof next === "function" ? next(ps.items) : next,
    }));
  // The shopping plan is kept per conversation in this browser.
  useEffect(() => {
    if (!sid) return;
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem("hamrah-plan-" + sid) || "[]");
    } catch {}
    setPlanState({ sid, items });
  }, [sid]);
  useEffect(() => {
    if (planState.sid)
      try {
        localStorage.setItem(
          "hamrah-plan-" + planState.sid,
          JSON.stringify(planState.items),
        );
      } catch {}
  }, [planState]);
  const [webAlt, setWebAltState] = useState(null);
  useEffect(() => {
    if (!sid) return;
    try {
      setWebAltState(
        JSON.parse(localStorage.getItem("hamrah-webalt-" + sid) || "null"),
      );
    } catch {
      setWebAltState(null);
    }
  }, [sid]);
  function setWebAlt(v) {
    setWebAltState(v);
    try {
      v
        ? localStorage.setItem("hamrah-webalt-" + sid, JSON.stringify(v))
        : localStorage.removeItem("hamrah-webalt-" + sid);
    } catch {}
  }
  function showWebAlt(v) {
    setWebAlt(v);
    setFeature(null);
    setModal(null);
    setListTab("web");
    go("results");
  }
  const planIds = useMemo(
    () => new Set(planItems.map((o) => o.offer_id)),
    [planItems],
  );
  const visit = [...new Set(planItems.map((o) => o.shop_id))];
  function setVisit(next) {
    const ids = typeof next === "function" ? next(visit) : next;
    setPlanItems((items) => items.filter((o) => ids.includes(o.shop_id)));
  }
  function togglePlan(o) {
    if (planIds.has(o.offer_id)) {
      setPlanItems((items) => items.filter((x) => x.offer_id !== o.offer_id));
      return;
    }
    const shops = new Set(planItems.map((x) => x.shop_id));
    shops.add(o.shop_id);
    if (shops.size > 4) {
      setToast("برنامه پر است؛ یک فروشگاه را حذف کنید");
      return;
    }
    setPlanItems((items) => [...items, planEntry(o)]);
    toast.success("به برنامه اضافه شد", { preventDuplicates: true });
  }
  const [mode, setMode] = useState("advanced"),
    [modeSaving, setModeSaving] = useState(false),
    [answering, setAnswering] = useState(false);
  // A chat closed by the abuse guard stays closed; the server answers it with one fixed message.
  const [ended, setEnded] = useState(null);
  const [priceRefresh, setPriceRefresh] = useState(null);
  useEffect(() => {
    const on = (e) => setEnded(e.detail);
    window.addEventListener("hamrah-terminated", on);
    return () => window.removeEventListener("hamrah-terminated", on);
  }, []);
  const [feature, setFeature] = useState(null),
    [basket, setBasket] = useState([]),
    [mission, setMission] = useState({}),
    [decision, setDecision] = useState(null),
    [reference, setReference] = useState(null);
  const activeSid = useRef(sid);
  activeSid.current = sid;
  const activeComparison = useRef(comparison);
  activeComparison.current = comparison;
  const end = useRef(null),
    inputRef = useRef(null),
    searchSeq = useRef(0),
    resuming = useRef(null);
  const profile = Object.fromEntries(facts.map((f) => [f.key, f.value]));
  const [listTab, setListTab] = useState("picks"),
    [allSort, setAllSort] = useState("relevance"),
    [allPage, setAllPage] = useState(1),
    [allData, setAllData] = useState(null),
    [allLoading, setAllLoading] = useState(false),
    [toolsOpen, setToolsOpen] = useState(false),
    [decisionOpen, setDecisionOpen] = useState(false);
  const allSeq = useRef(0),
    listTop = useRef(null);
  // Every retrieved offer for the current query, sorted and paged on the server.
  useEffect(() => {
    setAllPage(1);
    setListTab("picks");
  }, [results.query, sid]);
  useEffect(() => {
    setDecisionOpen(false);
  }, [decision]);
  useEffect(() => {
    if (!toolsOpen) return;
    const close = (e) => {
      if (!e.target.closest?.(".tools-menu")) setToolsOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [toolsOpen]);
  useEffect(() => {
    const q = results.query;
    if (!sid || !q || results.product_ids?.length) {
      setAllData(null);
      return;
    }
    const seq = ++allSeq.current;
    setAllLoading(true);
    api("search/all", {
      session_id: sid,
      query: q,
      sort: allSort,
      page: allPage,
      page_size: 24,
    })
      .then((d) => {
        if (seq === allSeq.current) setAllData(d);
      })
      .catch(() => {
        if (seq === allSeq.current) setAllData(null);
      })
      .finally(() => {
        if (seq === allSeq.current) setAllLoading(false);
      });
  }, [results, allSort, allPage, sid]);
  const showError = (e) =>
    toast.error(e.message || String(e), { preventDuplicates: true });
  async function loadBootstrap() {
    setInitialError("");
    try {
      const b = await api("bootstrap");
      setSessions(b.sessions);
      setFacts(b.facts);
      let saved;
      try {
        saved = localStorage.getItem("hamrah-session-v1");
      } catch {}
      const active = b.sessions.find((x) => x.id === saved) || b.sessions[0];
      if (!(await openSession(active.id)))
        throw Error("گفت‌وگوی شما باز نشد. دوباره تلاش کنید.");
      setBoot(b);
      api("ready")
        .then((health) => setAssistantAvailable(!!health.provider_configured))
        .catch(() => {});
    } catch (e) {
      setInitialError(e.message);
    }
  }
  useEffect(() => {
    loadBootstrap();
  }, []);
  useEffect(() => {
    const container = end.current?.parentElement;
    if (container && followConversation.current)
      container.scrollTo({
        top: container.scrollHeight,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  }, [turns, status]);
  async function openSession(id) {
    try {
      const d = await api("sessions/" + id);
      setSid(id);
      setEnded(d.guard?.terminated ? d.guard.message : null);
      setMode("advanced");
      localStorage.setItem("hamrah-session-v1", id);
      setTurns(d.turns);
      setResults(d.results?.offers ? d.results : { offers: [] });
      setQuery(d.results?.query || "");
      setEvents(d.events);
      setFacts(d.facts);
      setBasket(d.basket || []);
      setMission(d.mission || {});
      setSelected([]);
      setTrace([]);
      setRoute(null);
      setSidebar(false);
      setDecision(null);
      setModal(null);
      setComparison(null);
      const specResume = localStorage.getItem("hamrah-spec-resume-" + id);
      if (specResume) {
        try {
          const saved = JSON.parse(specResume);
          const base = await api(
            "compare/snapshot/" +
              saved.snapshotId +
              "?session_id=" +
              encodeURIComponent(id),
          );
          const job = await api(
            "compare/spec-fetch/" +
              saved.jobId +
              "?session_id=" +
              encodeURIComponent(id),
          );
          setComparison({ ...base, auto_completion: true, spec_job: job });
          setModal("compare");
        } catch {
          localStorage.removeItem("hamrah-spec-resume-" + id);
        }
      }
      const pending = localStorage.getItem("hamrah-active-run-" + id);
      if (pending) {
        setBusy(true);
        resumeRun(pending, id);
      }
      setSearchError("");
      return true;
    } catch (e) {
      showError(e);
      return false;
    }
  }
  async function resumeRun(runId, sessionId) {
    if (resuming.current === runId) return;
    resuming.current = runId;
    let after = 0;
    try {
      for (let n = 0; n < 450; n++) {
        const d = await api("chat-runs/" + runId + "?after=" + after);
        for (const { seq, event: e } of d.events) {
          after = seq;
          if (e.type === "status" || e.type === "retry_queued")
            setStatus(e.message);
          if (e.type === "tool") {
            setStatus(e.label + "…");
            setTrace((t) => [...t, e.label]);
          }
          if (e.type === "price_refresh") setPriceRefresh(e.data);
          if (e.type === "visit_update") {
            setVisit((ids) =>
              ids.filter((id) => !e.data.invalidated_shop_ids.includes(id)),
            );
            setRoute(null);
          }
          if (e.type === "results") setResults(e.data);
          if (e.type === "profile") setFacts(e.data);
          if (e.type === "shopping_areas") {
            setModal(null);
            setFeature({ type: "areas", data: e.data });
          }
          if (e.type === "external_discovery") {
            setModal(null);
            setFeature({ type: "external", snapshot: e.data });
          }
          if (e.type === "web_alternatives") {
            showWebAlt({ jobId: e.data.job_id, query: e.data.query });
          }
          if (e.type === "buying_review") {
            setModal(null);
            setFeature({ type: "review", snapshot: e.data });
          }
          if (e.type === "comparison") {
            setFeature(null);
            setComparison(e.data);
            setModal("compare");
          }
        }
        if (
          ["completed", "failed", "cancelled", "interrupted"].includes(d.status)
        ) {
          const state = await api("sessions/" + sessionId);
          setTurns(state.turns);
          setResults(state.results?.offers ? state.results : { offers: [] });
          setFacts(state.facts);
          setMission(state.mission || {});
          localStorage.removeItem("hamrah-active-run-" + sessionId);
          return;
        }
        await new Promise((r) => setTimeout(r, 900));
      }
      throw Error("پاسخ طولانی شد. گفت‌وگو را دوباره باز کنید.");
    } catch (e) {
      showError(e);
    } finally {
      resuming.current = null;
      setBusy(false);
      setStatus("");
    }
  }
  async function newSession() {
    try {
      const s = await api("sessions", {});
      setSessions((v) => [s, ...v]);
      await openSession(s.id);
      go("chat");
    } catch (e) {
      showError(e);
    }
  }
  async function saveProfile(values, scope = "trip") {
    if (busy) throw Error("پس از پایان پاسخ، شرایط را تغییر دهید");
    const d = await api("profile", { values, session_id: sid, scope }, "PATCH");
    setFacts(d.facts);
    return d;
  }
  async function search(q = query, updates, ids, imageModel) {
    if (!sid || busy || answering) return;
    const seq = ++searchSeq.current;
    setSearching(true);
    setSearchError("");
    lastSearch.current = { q, updates, ids, imageModel };
    try {
      if (updates) await saveProfile(updates);
      const r = await api("search", {
        session_id: sid,
        query: q,
        product_ids:
          ids ?? (q === results.query ? results.product_ids || [] : []),
        recognized_model: imageModel,
      });
      if (seq !== searchSeq.current) return;
      setResults({ ...r, from_search: true });
      setQuery(q);
      if (!["map", "plan", "shop"].includes(parseHash().page)) go("results");
      setSelected([]);
      return r;
    } catch (e) {
      if (seq === searchSeq.current) setSearchError(e.message);
      return null;
    } finally {
      if (seq === searchSeq.current) setSearching(false);
    }
  }
  function retrySearch() {
    const attempt = lastSearch.current;
    if (attempt)
      search(attempt.q, attempt.updates, attempt.ids, attempt.imageModel);
  }
  async function removeFilter(key) {
    const updates = clearedFilter(key);
    if (results.query || query) await search(results.query || query, updates);
    else await saveProfile(updates).catch(showError);
  }
  function shoppingShortcut(key) {
    if (key === "basket") {
      setFeature({ type: "basket" });
      return;
    }
    if (key === "nearby") {
      go("map");
      if (profile.lat == null && !profile.neighborhood) setModal("filters");
      return;
    }
    if (key === "compare") {
      if (selected.length >= 2) compare();
      else {
        go("results");
        setToast("دو محصول انتخاب کن");
      }
      return;
    }
    (parseHash().page === "home" ? homeInputRef : inputRef).current?.focus();
  }
  async function refreshOffers() {
    const d = await api("sessions/" + sid);
    setResults(d.results?.offers ? d.results : { offers: [] });
    setEvents(d.events);
    setFacts(d.facts);
    setBasket(d.basket || []);
    setMission(d.mission || {});
    return d;
  }
  useEffect(() => {
    if (
      !sid ||
      busy ||
      modeSaving ||
      mode === "simple" ||
      !results.offers?.length
    ) {
      setDecision(null);
      return;
    }
    let stale = false;
    api("decision/" + sid)
      .then((d) => {
        if (!stale) setDecision(d);
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [sid, results, busy, mode, modeSaving]);
  async function addBasket(o) {
    try {
      const d = await api("basket", {
        session_id: sid,
        query: o.persian_title,
        product_id: o.product_id,
        quantity: 1,
      });
      setBasket(d.items);
      toast.success("به سبد اضافه شد", { preventDuplicates: true });
    } catch (e) {
      showError(e);
    }
  }
  async function send(text = input, fromClarification = false) {
    if (!text.trim() || busy || (!fromClarification && answering) || !sid)
      return;
    if (searching) return;
    if (!assistantAvailable) {
      const result = await search(text.trim());
      if (result) setInput("");
      return;
    }
    followConversation.current = true;
    go("chat");
    setInput("");
    setBusy(true);
    setTrace([]);
    setTurns((t) => [...t, { role: "user", content: text }]);
    setStatus("در حال بررسی نیاز شما…");
    if (compactLayout()) go("chat");
    let complete = false;
    let runAccepted = false;
    try {
      const run = await api("chat-runs", {
        session_id: sid,
        message: text,
        mode,
      });
      runAccepted = true;
      let after = 0;
      localStorage.setItem("hamrah-active-run-" + sid, run.run_id);
      const handle = (ev) => {
        if (ev.type === "status" || ev.type === "retry_queued")
          setStatus(ev.message);
        if (ev.type === "tool") {
          setTrace((t) => [...t, ev.label]);
          setStatus(ev.label + "…");
        }
        if (ev.type === "price_refresh") setPriceRefresh(ev.data);
        if (ev.type === "research_plan")
          setTrace((t) => [...t, ...ev.tasks.map((x) => x.question)]);
        if (ev.type === "research_evidence")
          setStatus("شواهد " + num(ev.queries_used) + " جست‌وجو جمع شد…");
        if (ev.type === "profile") setFacts(ev.data);
        if (ev.type === "visit_update") {
          setVisit((ids) =>
            ids.filter((id) => !ev.data.invalidated_shop_ids.includes(id)),
          );
          setRoute(null);
        }
        if (ev.type === "results") {
          setResults(ev.data);
          setQuery(ev.data.query || "");
        }
        if (ev.type === "shopping_areas") {
          setModal(null);
          setFeature({ type: "areas", data: ev.data });
        }
        if (ev.type === "external_discovery") {
          setModal(null);
          setFeature({ type: "external", snapshot: ev.data });
        }
        if (ev.type === "web_alternatives") {
          showWebAlt({ jobId: ev.data.job_id, query: ev.data.query });
        }
        if (ev.type === "buying_review") {
          setModal(null);
          setFeature({ type: "review", snapshot: ev.data });
        }
        if (ev.type === "comparison") {
          setFeature(null);
          setComparison(ev.data);
          setModal("compare");
        }
        if (ev.type === "contact") {
          setFeature(null);
          setContact(ev.data);
          setModal("contact");
        }
        if (ev.type === "route") {
          setFeature(null);
          setRoute(ev.data);
          go("plan");
        }
        if (ev.type === "done") {
          setTurns((t) => [
            ...t,
            { role: "assistant", content: ev.reply, references: ev.references },
          ]);
          if (ev.terminated) setEnded(ev.reply);
          setFacts(ev.facts);
          if (ev.mission) setMission(ev.mission);
          if (ev.results?.offers) setResults(ev.results);
          complete = true;
        }
        if (ev.type === "merchant_request") {
          setToast("لینک فروشنده ساخته شد");
        }
        if (ev.type === "decision") setDecision(ev.data);
        if (ev.type === "basket") {
          setModal(null);
          setBasket(ev.data.items);
          setFeature({ type: "basket" });
        }
        if (ev.type === "error") {
          setTurns((t) => [
            ...t,
            { role: "assistant", content: ev.message, error: true },
          ]);
          complete = true;
        }
      };
      for (let poll = 0; poll < 450 && !complete; poll++) {
        let d;
        try {
          d = await api("chat-runs/" + run.run_id + "?after=" + after);
        } catch (e) {
          if (poll === 449) throw e;
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        for (const item of d.events) {
          handle(item.event);
          after = item.seq;
        }
        if (
          ["failed", "cancelled", "interrupted"].includes(d.status) &&
          !complete
        )
          throw Error("پاسخ متوقف شد. دوباره تلاش کنید.");
        if (!complete)
          await new Promise((r) =>
            setTimeout(r, d.status === "retry_queued" ? 3000 : 900),
          );
      }
      localStorage.removeItem("hamrah-active-run-" + sid);
      if (!complete) throw Error("اتصال قطع شد. دوباره تلاش کنید.");
      const b = await api("bootstrap");
      setSessions(b.sessions);
    } catch (e) {
      if (!runAccepted) setInput(text);
      showError(e);
    } finally {
      setBusy(false);
      setStatus("");
    }
  }
  async function changeMode(next) {
    if (busy || answering || modeSaving) return;
    const before = mode;
    setMode(next);
    setModeSaving(true);
    setDecision(null);
    try {
      const d = await api("sessions/" + sid + "/mode", { mode: next }, "PATCH");
      setMode(d.mode);
      setDecision(d.question);
    } catch (e) {
      setMode(before);
      showError(e);
    } finally {
      setModeSaving(false);
    }
  }
  async function answerDecision(value, strict = true, skip = false) {
    if (!decision?.key || busy || answering) return;
    setAnswering(true);
    try {
      const d = await api("clarification", {
        session_id: sid,
        key: decision.key,
        value,
        strict,
        skip,
      });
      setFacts(d.facts);
      setDecision(skip ? d.question : null);
      if (d.followup) await send(d.followup, true);
      else if (!skip) await search(query);
    } catch (e) {
      showError(e);
    } finally {
      setAnswering(false);
    }
  }
  async function sellers(o) {
    setBackQuery(query);
    await search(o.persian_title, undefined, [o.product_id]);
  }
  async function compare(ids) {
    try {
      const d = await api("compare", {
        session_id: sid,
        product_ids: Array.isArray(ids) ? ids : selected,
      });
      setComparison(d);
      setFeature(null);
      setModal("compare");
    } catch (e) {
      showError(e);
    }
  }
  async function researchComparison(productIds, viewIds) {
    const requested = sid;
    const d = await api("compare/research", {
      session_id: requested,
      snapshot_id: comparison.snapshot_id,
      product_ids: productIds,
      view_product_ids: viewIds,
    });
    if (activeSid.current === requested) {
      setComparison(d);
      const state = await api("sessions/" + requested);
      if (activeSid.current === requested) setTurns(state.turns);
    }
    return d;
  }
  async function rebuildComparison(viewIds) {
    const requested = sid;
    const d = await api("compare/rebuild", {
      session_id: requested,
      snapshot_id: comparison.snapshot_id,
      view_product_ids: viewIds,
    });
    if (activeSid.current === requested) {
      setComparison(d);
      const state = await api("sessions/" + requested);
      if (activeSid.current === requested) setTurns(state.turns);
    }
    return d;
  }
  async function completeSpecs(viewIds, progress, retry = false) {
    const requested = sid,
      base = comparison,
      root = base.origin_snapshot_id || base.snapshot_id,
      key = "hamrah-spec-job-" + requested + "-" + root;
    const j0 = await api("compare/spec-fetch", {
      session_id: requested,
      snapshot_id: base.snapshot_id,
      view_product_ids: viewIds,
      retry,
    });
    const jobId = j0.id;
    localStorage.setItem(key, jobId);
    localStorage.setItem(
      "hamrah-spec-resume-" + requested,
      JSON.stringify({ jobId, snapshotId: base.snapshot_id }),
    );
    let lastPreview = 0;
    for (let n = 0; n < 900; n++) {
      const j = await api(
        "compare/spec-fetch/" +
          jobId +
          "?session_id=" +
          encodeURIComponent(requested),
      );
      progress(j);
      if (
        j.status !== "completed" &&
        j.preview &&
        j.preview_version !== lastPreview &&
        activeSid.current === requested &&
        activeComparison.current?.snapshot_id === base.snapshot_id
      ) {
        lastPreview = j.preview_version;
        setComparison({
          ...j.preview,
          snapshot_id: base.snapshot_id,
          origin_snapshot_id: base.origin_snapshot_id,
          base_snapshot_id: base.base_snapshot_id,
          view_product_ids: base.view_product_ids,
          auto_completion: base.auto_completion,
          spec_job: base.spec_job,
          created: base.created,
        });
      }
      if (j.status === "completed") {
        localStorage.removeItem(key);
        localStorage.removeItem("hamrah-spec-resume-" + requested);
        const current = activeComparison.current;
        if (
          activeSid.current === requested &&
          current?.snapshot_id === base.snapshot_id &&
          JSON.stringify(viewIds) === JSON.stringify(j.view_product_ids)
        ) {
          setComparison(j.result);
          const state = await api("sessions/" + requested);
          if (activeSid.current === requested) setTurns(state.turns);
        }
        return j.result;
      }
      if (["failed", "interrupted", "cancelled"].includes(j.status)) {
        localStorage.removeItem(key);
        localStorage.removeItem("hamrah-spec-resume-" + requested);
        throw Error(j.error || "فرایند متوقف شد؛ برای ادامه دوباره تلاش کنید.");
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw Error("بررسی ادامه دارد…");
  }
  async function cancelSpecs(job) {
    await api("compare/spec-fetch/" + job.id + "/cancel", {
      session_id: sid,
      snapshot_id: comparison.snapshot_id,
    });
  }
  async function showOriginal() {
    const d = await api(
      "compare/snapshot/" +
        (comparison.origin_snapshot_id || comparison.base_snapshot_id) +
        "?session_id=" +
        encodeURIComponent(sid),
    );
    setComparison({ ...d, suppress_auto: true });
  }

  function plan(ids = visit, planOffers) {
    // Adds the chosen stores (or a basket plan's exact offers) to the shopping plan page.
    const pool = planOffers || offers.filter((o) => ids.includes(o.shop_id));
    setPlanItems((items) => {
      const have = new Set(items.map((x) => x.offer_id)),
        shops = new Set(items.map((x) => x.shop_id)),
        add = [];
      for (const o of pool) {
        if (have.has(o.offer_id)) continue;
        if (!planOffers && add.some((a) => a.shop_id === o.shop_id)) continue;
        if (!shops.has(o.shop_id) && shops.size >= 4) continue;
        shops.add(o.shop_id);
        add.push(planEntry(o));
      }
      return [...items, ...add];
    });
    setFeature(null);
    setModal(null);
    go("plan");
  }
  async function openContact(o) {
    try {
      setContact({
        ...(await api("contact", {
          shop_id: o.shop_id,
          product_id: o.product_id,
          session_id: sid,
        })),
        offer: o,
      });
      setModal("contact");
    } catch (e) {
      showError(e);
    }
  }
  function toggle(id, array, set, max) {
    if (array.includes(id)) set(array.filter((x) => x !== id));
    else if (array.length < max) set([...array, id]);
    else setToast("حداکثر " + num(max) + " گزینه انتخاب کنید");
  }
  async function locate() {
    if (!navigator.geolocation) {
      setToast("مکان‌یابی در دسترس نیست");
      return;
    }
    setToast("در حال مکان‌یابی…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await saveProfile({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            neighborhood: null,
          });
          setToast("موقعیت ثبت شد");
          if (query) await search(query);
        } catch (e) {
          showError(e);
        }
      },
      () => setToast("محدوده را دستی انتخاب کنید"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }
  async function exportData() {
    try {
      const d = await api("export/" + sid);
      const u = URL.createObjectURL(
        new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = u;
      a.download = "hamrah-shopping-plan.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(u), 1000);
    } catch (e) {
      showError(e);
    }
  }
  if (!boot)
    return (
      <div className="splash" role="status">
        <div className="splash-mark">
          <Logo size={84} />
        </div>
        <h1>بازارگرد</h1>
        <p>{initialError || "آماده کردن همراه خرید…"}</p>
        {initialError ? (
          <button className="btn btn-primary" onClick={loadBootstrap}>
            تلاش مجدد
          </button>
        ) : null}
        <div className="splash-bar" hidden={!!initialError}>
          <span />
        </div>
      </div>
    );
  const offers = results.offers || [];
  const distinctProducts = [...new Set(offers.map((o) => o.product_id))];
  const showAll =
    listTab === "all" && allData && !(allLoading && !allData.offers?.length);
  const visibleOffers = showAll ? allData.offers : offers;
  const productGroups = groupProducts(visibleOffers);
  const displayedGroups =
    listTab === "picks" ? productGroups.slice(0, 3) : productGroups;
  const sellerView = !!results.product_ids?.length;
  const filters = activeFilters(profile);
  const visibleProducts = [
    ...new Set(
      (sellerView
        ? visibleOffers
        : displayedGroups.map((group) => group.best)
      ).map((o) => o.product_id),
    ),
  ];
  const firstIndex = showAll ? (allData.page - 1) * allData.page_size : 0;
  const page = nav.page;
  const navItems = [
    ["home", "شروع خرید", ShoppingBag],
    ["chat", "گفت‌وگو", MessageCircle],
    ["results", "نتایج", LayoutGrid],
    ["map", "نقشه", Map],
    ["plan", "برنامه خرید", Route],
  ];
  const contextChips = (
    <>
      {filters.map((filter) => (
        <button
          key={filter.key}
          className="chip chosen"
          disabled={busy || searching}
          onClick={() => removeFilter(filter.key)}
          aria-label={"حذف فیلتر " + filter.label}
        >
          {filter.label}
          <X size={13} />
        </button>
      ))}
      <button className="chip" onClick={() => setModal("filters")}>
        <SlidersHorizontal size={14} />
        {filters.length ? "ویرایش شرایط" : "بودجه و محدوده"}
      </button>
    </>
  );
  const chatPane = (
    <section className="chat-pane" aria-label="گفت‌وگو با دستیار">
      <div
        className="conversation"
        onScroll={(event) => {
          const el = event.currentTarget;
          followConversation.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 90;
        }}
      >
        {turns.length === 0 && results.query ? (
          <div className="search-context">
            <span className="eyebrow">خرید در حال بررسی</span>
            <h2>{results.query}</h2>
            <p>{num(distinctProducts.length)} محصول در گزینه‌های بازیابی‌شده</p>
            <button className="text-btn" onClick={() => setModal("filters")}>
              <SlidersHorizontal size={16} />
              اصلاح شرایط خرید
            </button>
          </div>
        ) : turns.length === 0 ? (
          <div className="welcome">
            <h1>چی می‌خوای بخری؟</h1>
            <div className="suggestions">
              {[
                ["یه هدفون بی‌سیم تا ۳ میلیون می‌خوام", Search],
                ["برای دانشگاه چه لپ‌تاپی بخرم؟", LayoutGrid],
                ["گوشی سامسونگ با خرید قسطی حضوری", Wallet],
                ["تلویزیون ۵۵ اینچ نزدیک جمهوری", MapPin],
              ].map(([t, Icon]) => (
                <button key={t} disabled={busy} onClick={() => send(t)}>
                  <Icon size={17} />
                  <span>{t}</span>
                  <ArrowLeft size={15} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((t, i) => (
            <article
              key={i}
              className={"msg " + t.role + (t.error ? " error" : "")}
            >
              {t.role === "assistant" ? (
                <span className="ai-avatar sm">
                  <MessageCircle size={13} />
                </span>
              ) : null}
              <div className="bubble markdown">
                <ReplyContent
                  turn={t}
                  onReference={(o) => {
                    setReference(o);
                    setModal("reference");
                  }}
                  onAreas={(data) => {
                    setModal(null);
                    setFeature({ type: "areas", data });
                  }}
                  onExternal={(data) => {
                    setModal(null);
                    setFeature({ type: "external", snapshot: data });
                  }}
                  onReview={(data) => {
                    setModal(null);
                    setFeature({ type: "review", snapshot: data });
                  }}
                  onComparison={(data) => {
                    setComparison(data);
                    setModal("compare");
                  }}
                />
              </div>
            </article>
          ))
        )}
        {busy ? (
          <div className="typing" role="status">
            <span className="ai-avatar sm">
              <MessageCircle size={13} />
            </span>
            <div className="typing-body">
              <span className="dots">
                <i />
                <i />
                <i />
              </span>
              <small>{status || "در حال فکر کردن…"}</small>
            </div>
          </div>
        ) : null}
        {!busy && trace.length ? (
          <details className="trace">
            <summary>{num(trace.length)} گام برای این پاسخ</summary>
            {trace.map((t, i) => (
              <div key={i}>
                <Check size={13} />
                {t}
              </div>
            ))}
          </details>
        ) : null}
        <div ref={end} />
      </div>
      <div className="composer-wrap">
        <div className="context-chips">{contextChips}</div>
        {ended ? (
          <div className="chat-ended" role="alert">
            <ShieldCheck size={20} />
            <div>
              <b>این گفت‌وگو بسته شد</b>
              <p>{ended}</p>
            </div>
            <button className="btn btn-primary" onClick={newSession}>
              شروع گفت‌وگوی تازه
            </button>
          </div>
        ) : (
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={3000}
              aria-label="پیام به بازارگرد"
              placeholder="مثلاً: یه گوشی تا ۲۰ میلیون با دوربین خوب، نزدیک ونک"
              rows={1}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              type="submit"
              className="send"
              disabled={busy || searching || !input.trim()}
              aria-label={assistantAvailable ? "ارسال پیام" : "جست‌وجوی محصول"}
            >
              {busy ? (
                <LoaderCircle size={19} className="spin" />
              ) : assistantAvailable ? (
                <ArrowUp size={20} />
              ) : (
                <Search size={19} />
              )}
            </button>
          </form>
        )}
        {searchError ? (
          <div className="request-error" role="alert">
            <p>{searchError}</p>
            <button onClick={retrySearch} className="text-btn">
              تلاش مجدد
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
  async function askPrice(o) {
    try {
      setPriceRefresh(
        await api("freshness/ask", { session_id: sid, shop_id: o.shop_id }),
      );
    } catch (e) {
      showError(e);
    }
  }
  const card = (o, i) => (
    <OfferCard
      key={o.offer_id}
      onAskPrice={() => askPrice(o)}
      o={o}
      index={i}
      style={{ "--i": Math.min(i, 8) }}
      compare={selected.includes(o.product_id)}
      inPlan={planIds.has(o.offer_id)}
      onCompare={() => toggle(o.product_id, selected, setSelected, 12)}
      onPlan={() => togglePlan(o)}
      onShop={() => go("shop", o.shop_id)}
      onOpen={() => go("product", o.product_id)}
      onContact={() => openContact(o)}
      onSellers={() => sellers(o)}
      onQuote={() => setFeature({ type: "request", offer: o })}
      onBasket={() => addBasket(o)}
      onCosts={() => setFeature({ type: "costs", offers: [o] })}
      onLocation={() => setFeature({ type: "location", offer: o })}
      onExternal={() =>
        setFeature({
          type: "external",
          query: o.persian_title,
          productId: o.product_id,
        })
      }
      onReview={() => setFeature({ type: "review", productId: o.product_id })}
    />
  );
  const resultsPage = (
    <div className="page results-page" aria-busy={searching}>
      <header className="results-heading">
        <div>
          <span className="eyebrow">
            {sellerView ? "انتخاب فروشگاه" : "کاوش و انتخاب"}
          </span>
          <h1>
            {sellerView
              ? "از کجا بخریم؟"
              : results.query
                ? "گزینه‌های «" + results.query + "»"
                : "گزینه‌های خرید تو"}
          </h1>
        </div>
        <div className="view-switch" role="group" aria-label="نمای نتایج">
          <button aria-pressed="true">
            <LayoutGrid size={16} />
            لیست
          </button>
          <button onClick={() => go("map")}>
            <Map size={16} />
            نقشه
          </button>
        </div>
      </header>
      <div className="results-top">
        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
        >
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجوی مستقیم محصول، برند یا مدل"
            aria-label="جست‌وجوی محصول"
            enterKeyHint="search"
          />
          {query ? (
            <button
              type="button"
              className="icon-btn"
              aria-label="پاک کردن"
              onClick={() => setQuery("")}
            >
              <X size={16} />
            </button>
          ) : null}
          <button
            className="btn btn-primary"
            disabled={busy || searching || !query.trim()}
          >
            {searching ? <LoaderCircle size={17} className="spin" /> : null}
            جست‌وجو
          </button>
        </form>
        <div className="results-bar">
          <div className="chip-scroll">{contextChips}</div>
          <div className="tools-menu">
            <button
              className={"chip" + (toolsOpen ? " chosen" : "")}
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen(!toolsOpen)}
            >
              <SlidersHorizontal size={14} />
              ابزارها
              {basket.length ? (
                <span className="count-dot">{num(basket.length)}</span>
              ) : null}
              <ChevronDown size={12} />
            </button>
            {toolsOpen ? (
              <div className="popover" onClick={() => setToolsOpen(false)}>
                <button
                  onClick={() =>
                    setFeature({
                      type: "webalt",
                      query: query || results.query || "",
                      autoStart: false,
                    })
                  }
                >
                  <Globe size={16} />
                  جایگزین از وب و فروشگاه‌های شهر
                </button>
                <button onClick={() => setFeature({ type: "photo" })}>
                  <Camera size={16} />
                  جست‌وجو با عکس محصول
                </button>
                <button onClick={() => setFeature({ type: "basket" })}>
                  <ShoppingBag size={16} />
                  سبد چندقلمی ({num(basket.length)})
                </button>
                <button onClick={() => setFeature({ type: "mission" })}>
                  <CalendarClock size={16} />
                  مهلت و زمان سفر
                </button>
                <button onClick={() => setFeature({ type: "quotes" })}>
                  <ShieldCheck size={16} />
                  تأییدها و نگهداری فروشنده
                </button>
                <button onClick={() => setFeature({ type: "street" })}>
                  <Footprints size={16} />
                  حالت سفر و نسخه آفلاین
                </button>
                <button onClick={() => setFeature({ type: "external", query })}>
                  <Store size={16} />
                  سرنخ حضوری بیرون دیتاست
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {decision?.question ? (
        <div className={"decision-strip" + (decisionOpen ? " open" : "")}>
          <button
            className="decision-summary"
            aria-expanded={decisionOpen}
            onClick={() => setDecisionOpen(!decisionOpen)}
          >
            <Brain size={15} />
            <span>پرسش اختیاری</span>
            <b>{decision.question}</b>
            <ChevronDown size={14} />
          </button>
          {decisionOpen ? (
            <Decision
              compact
              question={decision}
              pending={busy || answering}
              onSkip={() => answerDecision(null, true, true)}
              onChoose={answerDecision}
            />
          ) : null}
        </div>
      ) : null}
      {Object.keys(profile.spec_filters || {}).length ? (
        <button
          className="notice-chip"
          onClick={() => search(query, { spec_filters: null })}
        >
          حذف انتخاب مشخصات: {Object.values(profile.spec_filters).join("، ")}
          <X size={13} />
        </button>
      ) : null}
      {results.relaxed_terms?.length && offers.length ? (
        <div className="notice relaxed">
          <div>
            <b>نتیجهٔ دقیق برای «{results.query}» در دیتاست ترب نبود.</b> این
            نتایج بدون الزام «{results.relaxed_terms.join("، ")}» پیدا شده‌اند و
            ممکن است دقیقاً همان کالا نباشند.
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => showWebAlt({ query: results.query })}
          >
            <Globe size={15} />
            جست‌وجو در وب
          </button>
        </div>
      ) : null}
      {results.preference_notice && offers.length ? (
        <div className="notice">{results.preference_notice}</div>
      ) : null}
      {results.simulation_notice ? (
        <div className="notice">{results.simulation_notice}</div>
      ) : null}
      {results.notice ? <div className="notice">{results.notice}</div> : null}
      {results.product_ids?.length ? (
        <button
          className="notice-chip"
          onClick={() => {
            search(backQuery || profile.product_query || query, undefined, []);
            setBackQuery(null);
          }}
        >
          <ChevronLeft size={14} />
          بازگشت به مدل‌های دیگر
        </button>
      ) : null}
      {searchError ? (
        <div className="request-error" role="alert">
          <p>{searchError}</p>
          <button className="btn btn-ghost" onClick={retrySearch}>
            تلاش مجدد
          </button>
        </div>
      ) : null}
      {searching || allLoading ? (
        <p className="refresh-status" role="status">
          <LoaderCircle size={14} className="spin" />
          {offers.length ? "در حال به‌روزرسانی…" : "در حال جست‌وجو…"}
        </p>
      ) : null}
      <div className="results-scroll" aria-live="polite">
        {listTab === "web" && webAlt ? (
          <>
            {offers.length ? null : (
              <div className="list-bar">
                <div className="seg" role="tablist">
                  <button
                    role="tab"
                    aria-selected={false}
                    onClick={() => setListTab("picks")}
                  >
                    نتایج ترب<span>۰</span>
                  </button>
                  <button role="tab" aria-selected={true}>
                    <Globe size={13} />
                    از وب
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
        {listTab === "web" && webAlt && !offers.length ? (
          <Suspense fallback={<SkeletonGrid />}>
            <WebAltPanel
              key={(webAlt.jobId || "") + webAlt.query}
              sid={sid}
              query={webAlt.query}
              jobId={webAlt.jobId}
              autoStart={!webAlt.jobId}
              onJob={(j) => setWebAlt({ jobId: j.id, query: j.query })}
            />
          </Suspense>
        ) : searching && !offers.length ? (
          <SkeletonGrid />
        ) : !offers.length ? (
          <div className="empty big">
            <h3>
              {results.query ? "نتیجه‌ای پیدا نشد" : "چه محصولی می‌خواهید؟"}
            </h3>
            <p>
              {results.query
                ? "فیلترها یا عبارت جست‌وجو را تغییر دهید."
                : "نام محصول یا مدل را جست‌وجو کنید."}
            </p>
            {results.query ? (
              <div className="row-gap center">
                <button
                  className="btn btn-primary"
                  onClick={() => showWebAlt({ query: results.query })}
                >
                  <Globe size={17} />
                  جست‌وجو در وب
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setModal("filters")}
                >
                  <SlidersHorizontal size={16} />
                  تغییر فیلترها
                </button>
              </div>
            ) : (
              <div className="quick-searches">
                {["هدفون بی‌سیم", "گوشی سامسونگ", "لپ تاپ", "کفش ورزشی"].map(
                  (t) => (
                    <button key={t} className="chip" onClick={() => search(t)}>
                      {t}
                    </button>
                  ),
                )}
              </div>
            )}
            {results.query ? (
              <Suspense fallback={<SkeletonLines />}>
                <ShoppingAreas
                  key={results.query}
                  sid={sid}
                  query={results.query}
                  initial={results.shopping_areas}
                />
              </Suspense>
            ) : null}
            <p className="coverage">
              <b>{money(boot.stats.products)}</b> محصول ·{" "}
              <b>{money(boot.stats.shops)}</b> فروشگاه تهران در دیتاست ترب
            </p>
          </div>
        ) : (
          <>
            <div className="list-bar" ref={listTop}>
              <div className="seg" role="tablist">
                <button
                  role="tab"
                  aria-selected={listTab === "picks"}
                  onClick={() => setListTab("picks")}
                >
                  گزینه‌های منتخب
                  <span>
                    {num(
                      sellerView
                        ? offers.length
                        : Math.min(3, productGroups.length),
                    )}
                  </span>
                </button>
                {!sellerView ? (
                  <>
                    <button
                      role="tab"
                      aria-selected={listTab === "all"}
                      onClick={() => setListTab("all")}
                    >
                      همه نتایج
                      <span>
                        {allData ? num(allData.total) : allLoading ? "…" : "—"}
                      </span>
                    </button>
                  </>
                ) : null}
                {webAlt ? (
                  <button
                    role="tab"
                    aria-selected={listTab === "web"}
                    onClick={() => setListTab("web")}
                  >
                    <Globe size={13} />
                    از وب
                  </button>
                ) : null}
              </div>
              <label className="select-chip">
                <ArrowUpDown size={14} />
                {listTab === "all" ? (
                  <select
                    aria-label="ترتیب همه نتایج"
                    value={allSort}
                    onChange={(e) => {
                      setAllSort(e.target.value);
                      setAllPage(1);
                    }}
                  >
                    <option value="relevance">مرتبط‌ترین</option>
                    <option value="price_asc">ارزان‌ترین</option>
                    <option value="price_desc">گران‌ترین</option>
                    <option value="distance">
                      {"نزدیک‌ترین" +
                        (allData && !allData.distance_available
                          ? " (تعیین موقعیت)"
                          : "")}
                    </option>
                    <option value="sellers">بیشترین فروشنده</option>
                    <option value="newest">تازه‌ترین قیمت</option>
                    <option value="credit">اول قسطی حضوری</option>
                  </select>
                ) : (
                  <select
                    aria-label="ترتیب پیشنهادها"
                    value={profile.priority || "balanced"}
                    onChange={(e) =>
                      search(query, { priority: e.target.value })
                    }
                  >
                    <option value="balanced">تعادل قیمت و فاصله</option>
                    <option value="price">کمترین قیمت</option>
                    <option value="distance">نزدیک‌ترین</option>
                  </select>
                )}
              </label>
              {visibleProducts.length >= 2 ? (
                <button
                  className="chip"
                  disabled={busy || searching}
                  onClick={() => compare(visibleProducts.slice(0, 12))}
                >
                  <GitCompareArrows size={14} />
                  {visibleProducts.length > 12
                    ? "مقایسه ۱۲ محصول اول"
                    : "مقایسه " + num(visibleProducts.length) + " محصول"}
                </button>
              ) : null}
              <button className="chip desktop-only" onClick={() => go("map")}>
                <Map size={14} />
                روی نقشه
              </button>
            </div>
            {sellerView || listTab === "all" || listTab === "web" ? (
              <p className="list-summary">
                {listTab === "web"
                  ? "نتایج وب"
                  : listTab === "all" && allLoading && !allData
                    ? "در حال دریافت نتایج…"
                    : listTab === "all" && allData
                      ? num(allData.total) +
                        " پیشنهاد از " +
                        num(allData.products) +
                        " محصول" +
                        (allData.pages > 1
                          ? " · صفحه " +
                            num(allData.page) +
                            " از " +
                            num(allData.pages)
                          : "") +
                        (allData.relaxed_terms?.length
                          ? " · بدون الزام: " + allData.relaxed_terms.join("، ")
                          : "")
                      : sellerView
                        ? num(visibleOffers.length) + " پیشنهاد فروش"
                        : "گزینه‌های منتخب"}{" "}
              </p>
            ) : null}
            {listTab === "web" && webAlt ? (
              <Suspense fallback={<SkeletonGrid />}>
                <WebAltPanel
                  key={(webAlt.jobId || "") + webAlt.query}
                  sid={sid}
                  query={webAlt.query}
                  jobId={webAlt.jobId}
                  autoStart={!webAlt.jobId}
                  onJob={(j) => setWebAlt({ jobId: j.id, query: j.query })}
                />
              </Suspense>
            ) : listTab === "all" &&
              allLoading &&
              !allData &&
              !offers.length ? (
              <SkeletonGrid />
            ) : (
              <div
                className={
                  "offer-grid" +
                  (sellerView ? " seller-offer-grid" : "") +
                  ((showAll && allLoading) || searching ? " is-loading" : "")
                }
              >
                {sellerView
                  ? visibleOffers.map((o, i) => card(o, firstIndex + i))
                  : displayedGroups.map((group) => (
                      <ProductCard
                        key={group.productId}
                        group={group}
                        selected={selected.includes(group.productId)}
                        onSelect={() =>
                          toggle(group.productId, selected, setSelected, 12)
                        }
                        onOpen={() => go("product", group.productId)}
                        onSellers={() => sellers(group.best)}
                      />
                    ))}
              </div>
            )}
            {listTab === "picks" &&
            !sellerView &&
            (allData?.total > displayedGroups.length ||
              productGroups.length > 3) ? (
              <button
                className="see-all btn btn-ghost"
                onClick={() => setListTab("all")}
              >
                مشاهده همه نتایج
                <ArrowLeft size={16} />
              </button>
            ) : null}
            {listTab === "all" && allData?.pages > 1 && listTab !== "web" ? (
              <Pager
                page={allData.page}
                pages={allData.pages}
                onPage={(n) => {
                  setAllPage(n);
                  listTop.current?.scrollIntoView({
                    block: "start",
                    behavior: "smooth",
                  });
                }}
              />
            ) : null}
          </>
        )}
      </div>
      {selected.length ? (
        <div className="selection-bar">
          <span>{num(selected.length)} محصول برای مقایسه</span>
          <button className="btn btn-primary" onClick={() => compare()}>
            <GitCompareArrows size={17} />
            مقایسه
          </button>
          <button
            className="icon-btn"
            aria-label="پاک کردن انتخاب"
            onClick={() => setSelected([])}
          >
            <X size={17} />
          </button>
        </div>
      ) : null}
    </div>
  );
  const pageFallback = (
    <div className="page">
      <SkeletonGrid />
    </div>
  );
  const content =
    page === "map" ? (
      <Suspense fallback={pageFallback}>
        <MapView
          offers={visibleOffers}
          profile={profile}
          neighborhoods={(boot.neighborhoods || []).filter(Boolean)}
          planIds={planIds}
          onLocation={async (point) => {
            try {
              await saveProfile({ ...point, neighborhood: null });
              setToast("مبدأ ثبت شد");
              if (query) await search(query);
            } catch (e) {
              showError(e);
            }
          }}
          onNeighborhood={async (n) => {
            try {
              await saveProfile({
                neighborhood: n,
                lat: null,
                lon: null,
                radius_km: null,
              });
              if (query) await search(query);
            } catch (e) {
              showError(e);
            }
          }}
          onRadius={async (r) => {
            try {
              await saveProfile({ radius_km: r });
              if (query) await search(query);
            } catch (e) {
              showError(e);
            }
          }}
          onLocate={locate}
          onShop={(id) => go("shop", id)}
          onAddPlan={(o) => togglePlan(o)}
        />
      </Suspense>
    ) : page === "plan" ? (
      <Suspense fallback={pageFallback}>
        <PlanPage
          sid={sid}
          items={planItems}
          setItems={setPlanItems}
          profile={profile}
          route={route}
          setRoute={setRoute}
          onShop={(id) => go("shop", id)}
          onContact={openContact}
          onMap={() => go("map")}
          onOffline={() => setFeature({ type: "street" })}
          onBasket={() => setFeature({ type: "basket" })}
          onTiming={() => setFeature({ type: "mission" })}
          onClear={() => {
            setPlanItems([]);
            setRoute(null);
          }}
          showError={showError}
        />
      </Suspense>
    ) : page === "product" && nav.arg ? (
      <Suspense fallback={pageFallback}>
        <ProductPage
          sid={sid}
          productId={nav.arg}
          planIds={planIds}
          onPlan={togglePlan}
          onContact={openContact}
          onShop={(id) => go("shop", id)}
          onBack={() => (history.length > 1 ? history.back() : go("results"))}
          onReview={() => setFeature({ type: "review", productId: nav.arg })}
          onCompare={() => {
            toggle(nav.arg, selected, setSelected, 12);
            setToast("برای مقایسه انتخاب شد");
          }}
        />
      </Suspense>
    ) : page === "shop" && nav.arg ? (
      <Suspense fallback={pageFallback}>
        <ShopPage
          sid={sid}
          shopId={nav.arg}
          query={results.query || query}
          planIds={planIds}
          onPlan={togglePlan}
          onContact={openContact}
          onBack={() => (history.length > 1 ? history.back() : go("results"))}
          onRoute={(id) => {
            plan([id]);
          }}
        />
      </Suspense>
    ) : page === "home" ? (
      <ShoppingHome
        input={input}
        setInput={setInput}
        inputRef={homeInputRef}
        pending={searching || busy}
        onSubmit={() => send()}
        onFilters={() => setModal("filters")}
        onShortcut={shoppingShortcut}
        assistantAvailable={assistantAvailable}
        error={searchError}
        onRetry={retrySearch}
      />
    ) : (
      resultsPage
    );
  return (
    <div className={"app page-" + page + (chatHidden ? " chat-hidden" : "")}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        رفتن به محتوای اصلی
      </a>
      <header className="workspace-header">
        <button
          className="workspace-brand"
          onClick={() => go("home")}
          aria-label="بازارگرد؛ صفحه شروع"
        >
          <Logo size={36} />
          <span>
            <b>بازارگرد</b>
            <small>همراه خرید حضوری</small>
          </span>
        </button>
        <div className="workspace-header-actions">
          <button
            className="header-location"
            onClick={() => setModal("filters")}
          >
            <MapPin size={17} />
            <span>
              {profile.neighborhood ||
                (profile.lat != null
                  ? "مبدأ انتخاب‌شده"
                  : "تهران؛ انتخاب محدوده")}
            </span>
            <ChevronDown size={13} />
          </button>
          <ThemeToggle />
          <button
            className="icon-btn"
            aria-label="گفت‌وگوها و تنظیمات"
            onClick={() => setSidebar(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>
      <nav className="rail" aria-label="بخش‌های اصلی">
        <button
          className="new-shopping"
          onClick={() => {
            setInput("");
            newSession().then(() => go("home"));
          }}
          disabled={busy}
        >
          <Plus size={19} />
          خرید تازه
        </button>
        <p className="nav-group-label">مسیر خرید</p>
        {navItems.map(([key, label, Icon]) => (
          <button
            key={key}
            className={
              "rail-item" +
              (page === key ||
              (key === "chat" && !chatHidden && !compactLayout() && false)
                ? " active"
                : "")
            }
            aria-current={page === key ? "page" : undefined}
            onClick={() => {
              if (key === "chat") {
                setChatHidden(false);
                setTimeout(() => inputRef.current?.focus(), 80);
              }
              go(key);
            }}
          >
            <Icon size={21} />
            <span>{label}</span>
            {key === "plan" && planItems.length ? (
              <i className="badge-dot">{num(planItems.length)}</i>
            ) : null}
            {key === "results" && offers.length ? (
              <i className="badge-dot soft">{num(offers.length)}</i>
            ) : null}
          </button>
        ))}
        <div className="rail-spacer" />
        <DevMenuItem variant="rail" />
        <button className="rail-item" onClick={() => setSidebar(true)}>
          <History size={20} />
          <span>گفت‌وگوها</span>
        </button>
        <button className="rail-item" onClick={() => setModal("memory")}>
          <Bookmark size={20} />
          <span>حافظه</span>
        </button>
        <button className="rail-item" onClick={() => setModal("about")}>
          <Info size={20} />
          <span>داده‌ها</span>
        </button>
      </nav>
      {chatPane}
      <main
        id="main-content"
        tabIndex={-1}
        className="content"
        key={page + (nav.arg || "")}
      >
        {page !== "home" ? (
          <nav className="journey-nav" aria-label="مراحل پیشنهادی خرید">
            {[
              ["home", "کشف نیاز"],
              ["results", "کاوش"],
              ["compare", "مقایسه"],
              ["plan", "آماده حرکت"],
            ].map(([key, label], index) => (
              <button
                key={key}
                className={
                  page === key ||
                  (key === "results" &&
                    ["map", "shop", "product"].includes(page))
                    ? "current"
                    : ""
                }
                onClick={() =>
                  key === "compare" ? shoppingShortcut("compare") : go(key)
                }
              >
                <span>{num(index + 1)}</span>
                {label}
              </button>
            ))}
          </nav>
        ) : null}
        {!compactLayout() && page !== "home" ? (
          <button
            className="chat-toggle"
            onClick={() => setChatHidden(!chatHidden)}
            aria-label={chatHidden ? "نمایش گفت‌وگو" : "پنهان کردن گفت‌وگو"}
            title={chatHidden ? "نمایش گفت‌وگو" : "پنهان کردن گفت‌وگو"}
          >
            {chatHidden ? (
              <PanelRightOpen size={18} />
            ) : (
              <PanelRightClose size={18} />
            )}
          </button>
        ) : null}
        {content}
      </main>
      <nav className="bottom-nav" aria-label="بخش‌ها">
        {navItems.map(([key, label, Icon]) => (
          <button
            key={key}
            className={page === key ? "active" : ""}
            aria-current={page === key ? "page" : undefined}
            onClick={() => go(key)}
          >
            <span className="bn-icon">
              <Icon size={18} />
              {key === "plan" && planItems.length ? (
                <i className="badge-dot">{num(planItems.length)}</i>
              ) : null}
              {key === "results" && offers.length ? (
                <i className="badge-dot soft">{num(offers.length)}</i>
              ) : null}
            </span>
            <span className="bottom-nav-label">
              {key === "home" ? "شروع" : key === "plan" ? "برنامه" : label}
            </span>
          </button>
        ))}
      </nav>
      {sidebar ? (
        <Modal title="گفت‌وگوها و تنظیمات" onClose={() => setSidebar(false)}>
          <div className="history-panel">
            {" "}
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                setSidebar(false);
                newSession();
              }}
              disabled={busy}
            >
              <Plus size={18} />
              خرید تازه
            </button>
            <p className="drawer-label">گفت‌وگوهای شما</p>
            <div className="session-list">
              {sessions.map((s) => (
                <button
                  disabled={busy}
                  className={s.id === sid ? "active" : ""}
                  key={s.id}
                  onClick={() => {
                    setSidebar(false);
                    openSession(s.id);
                  }}
                >
                  <MessageCircle size={16} />
                  <span>{s.title || "خرید تازه"}</span>
                </button>
              ))}
            </div>
            <div className="drawer-foot">
              <button
                onClick={() => {
                  setSidebar(false);
                  setModal("memory");
                }}
              >
                <Bookmark size={17} />
                حافظه و ترجیحات
              </button>
              <button
                onClick={() => {
                  setSidebar(false);
                  exportData();
                }}
              >
                <Download size={17} />
                دریافت برنامه خرید
              </button>
              <button
                onClick={() => {
                  setSidebar(false);
                  setModal("about");
                }}
              >
                <Info size={17} />
                درباره داده‌ها
              </button>
              <a href="?workspace=freshness">
                <RotateCcw size={17} />
                وضعیت تازگی قیمت‌ها
              </a>
              <DevMenuItem onOpen={() => setSidebar(false)} />
              <a href="?workspace=ops">
                <Server size={17} />
                مدیریت و سلامت وب‌سایت
              </a>
            </div>
          </div>
        </Modal>
      ) : null}
      <DevConsole sid={sid} live={busy} />
      {priceRefresh ? (
        <RefreshLink
          data={priceRefresh}
          onClose={() => setPriceRefresh(null)}
        />
      ) : null}
      {modal === "filters" ? (
        <ShoppingFilters
          draft={filterDrafts.current[sid]}
          onDraft={(draft) => {
            filterDrafts.current[sid] = draft;
          }}
          profile={profile}
          neighborhoods={boot.neighborhoods}
          onClose={() => setModal(null)}
          locate={locate}
          onSave={async (values, scope) => {
            try {
              await saveProfile(values, scope);
              filterDrafts.current[sid] = null;
              setModal(null);
              if (query) await search(query);
            } catch (e) {
              throw e;
            }
          }}
        />
      ) : null}
      {modal === "memory" ? (
        <Modal title="حافظه و ترجیحات شما" onClose={() => setModal(null)}>
          <p className="modal-intro">ترجیحات ذخیره‌شده برای خریدهای بعدی</p>
          <div className="memory-list">
            {facts.length ? (
              facts.map((f) => (
                <div key={f.key}>
                  <div>
                    <b>{FACT_NAMES[f.key] || f.key}</b>
                    <p>
                      {typeof f.value === "boolean"
                        ? f.value
                          ? "بله"
                          : "خیر"
                        : ["budget_max_toman", "budget_min_toman"].includes(
                              f.key,
                            )
                          ? money(f.value) + " تومان"
                          : typeof f.value === "object"
                            ? Object.entries(f.value)
                                .map(([k, v]) => k + ": " + v)
                                .join("، ")
                            : String(f.value)}
                    </p>
                    <small>
                      {f.scope === "trip" ? "فقط این سفر" : "حافظه دائمی"} ·{" "}
                      {f.source === "chat"
                        ? "از گفت‌وگو: «" + f.quote + "»"
                        : "تنظیم‌شده توسط شما"}
                    </small>
                    {f.scope === "trip" ? (
                      <button
                        className="text-btn"
                        disabled={busy}
                        onClick={() =>
                          saveProfile({ [f.key]: f.value }, "memory")
                            .then(() => setToast("ذخیره شد"))
                            .catch(showError)
                        }
                      >
                        برای خودم به خاطر بسپار
                      </button>
                    ) : null}
                  </div>
                  <IconButton
                    label={"حذف " + (FACT_NAMES[f.key] || f.key)}
                    onClick={() =>
                      saveProfile({ [f.key]: null }).catch(showError)
                    }
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              ))
            ) : (
              <p>هنوز ترجیحی ذخیره نشده است.</p>
            )}
          </div>
          <ShopperProfiles
            sid={sid}
            onApplied={(v) => {
              setFacts(v);
              setToast("شرایط اعمال شد");
            }}
          />
          <button
            className="danger-btn"
            disabled={busy}
            onClick={async () => {
              try {
                await api("memory", undefined, "DELETE");
                setFacts([]);
                setToast("حافظه پاک شد");
              } catch (e) {
                showError(e);
              }
            }}
          >
            پاک کردن همه ترجیحات
          </button>
        </Modal>
      ) : null}
      {modal === "about" ? (
        <Modal title="درباره داده‌ها" onClose={() => setModal(null)} wide>
          <DataFacts />
          <div className="about-copy">
            <p>
              این نسخه برای چالش ترب ساخته شده و به دیتاست واقعی رقابت متصل است:{" "}
              {num(boot.stats.products)} محصول، {num(boot.stats.offers)} آفر و{" "}
              {num(boot.stats.shops)} فروشگاه.
            </p>
            <p>
              <b>هویت و تماس:</b> همه شماره‌ها و نام ۶٬۳۶۴ فروشگاه ساختگی است.
              فقط فروشگاه‌های دارای وب‌سایت یا اینستاگرام در منبع، نام واقعی
              دارند. تماس خودکار با شماره‌های دیتاست انجام نمی‌شود.
            </p>
            <p>
              <b>قیمت و موجودی:</b> زمان تغییر قیمت نمایش داده می‌شود. آفر به
              معنی موجودی تأییدشده امروز نیست. گزارش پاسخ فروشنده با منبع و زمان
              ثبت می‌شود؛ نتیجه شبیه‌سازی همیشه جدا برچسب دارد.
            </p>
            <p>
              <b>نقشه و ساعت:</b> فاصله‌ها مستقیم‌اند. باز بودن بر اساس برنامه
              یا گزارش برچسب‌دار است. زمان جاده در صورت دسترسی از OSRM، بدون
              ترافیک زنده، محاسبه می‌شود. لینک گوگل مپ هم در دسترس است؛ داده
              زنده گوگل دریافت نمی‌شود.
            </p>
            <p>
              <b>پوشش:</b> حدود ۱۰٪ فروشگاه‌های تهران با انتخاب منطقه‌ای و
              حداکثر ۳۰۰ محصول از هر فروشگاه. نبود نتیجه نشانه نبود محصول در
              بازار نیست.
            </p>
            <p>
              <b>حریم خصوصی:</b> گفت‌وگو و ترجیحات این مرورگر جدا ذخیره می‌شوند.
              پیام‌ها و عکس انتخابی برای پاسخ‌گویی به سرویس مدل زبانی (Claude از
              طریق درگاه، یا BoxAPI) ارسال می‌شوند؛ برای تخمین مسیر، مختصات به
              OSRM می‌رود. برای تحقیق اختیاری، نام مدل عمومی به جست‌وجوی رایگان
              و منابع وب می‌رود؛ نیاز خصوصی شما در کش عمومی ذخیره نمی‌شود.
              ترجیحات هر سفر و حافظه دائمی جدا و قابل حذف‌اند.
            </p>
          </div>
        </Modal>
      ) : null}
      {modal === "compare" && comparison ? (
        <Suspense
          fallback={
            <div className="toast" role="status">
              آماده‌سازی مقایسه…
            </div>
          }
        >
          <Comparison
            key={
              comparison.origin_snapshot_id ||
              comparison.snapshot_id ||
              comparison.created
            }
            data={comparison}
            sid={sid}
            onRebuild={rebuildComparison}
            onSpecFetch={completeSpecs}
            onSpecCancel={cancelSpecs}
            onOriginal={showOriginal}
            onResearch={researchComparison}
            onReview={(productId) => {
              setModal(null);
              setFeature({ type: "review", productId, returnToCompare: true });
            }}
            onClose={() => setModal(null)}
          />
        </Suspense>
      ) : null}
      {modal === "contact" && contact ? (
        <ContactModal
          contact={contact}
          sid={sid}
          onClose={() => setModal(null)}
          onUpdate={(d) => {
            setResults(d.results);
            setEvents(d.events);
            if (d.visit_update?.invalidated_shop_ids?.length) {
              setVisit((ids) =>
                ids.filter(
                  (id) => !d.visit_update.invalidated_shop_ids.includes(id),
                ),
              );
              setRoute(null);
            }
            setToast("گزارش ثبت شد");
            go("results");
          }}
          showError={showError}
        />
      ) : null}
      {modal === "reference" && reference ? (
        <Modal
          title="گزینه ارجاع‌شده در این پاسخ"
          onClose={() => setModal(null)}
        >
          <div className="reference-snapshot">
            <h3>{reference.persian_title}</h3>
            <p>{reference.shop_name}</p>
            <p>{reference.address}</p>
            <p>
              قیمت مبنای همان پاسخ:{" "}
              {money(reference.effective_price_toman ?? reference.price_toman)}{" "}
              تومان
            </p>
            <p className="reference-notice">نسخه ذخیره‌شده پاسخ</p>
            <button
              className="outline"
              onClick={() => {
                setModal(null);
                setFeature({ type: "review", productId: reference.product_id });
              }}
            >
              بررسی شواهد و نقد محصول
            </button>
            <button
              className="primary"
              onClick={() => {
                setModal(null);
                search(reference.persian_title, undefined, [
                  reference.product_id,
                ]);
              }}
            >
              بررسی آفرهای فعلی همین مدل
            </button>
          </div>
        </Modal>
      ) : null}
      {feature?.type === "review" ? (
        <Suspense fallback={<div className="toast">آماده‌سازی بررسی…</div>}>
          <BuyingReview
            sid={sid}
            productId={feature.productId}
            snapshot={feature.snapshot}
            onSaved={async () => {
              const requested = sid;
              const d = await api("sessions/" + requested);
              if (activeSid.current === requested) setTurns(d.turns);
            }}
            onClose={() => {
              if (feature.returnToCompare) setModal("compare");
              setFeature(null);
            }}
          />
        </Suspense>
      ) : null}
      {feature?.type === "webalt" ? (
        <Suspense
          fallback={<div className="toast">آماده‌سازی جست‌وجوی وب…</div>}
        >
          <WebAlternatives
            key={feature.jobId || feature.query || "new"}
            sid={sid}
            query={feature.query || ""}
            jobId={feature.jobId}
            autoStart={feature.autoStart}
            onJob={(j) => showWebAlt({ jobId: j.id, query: j.query })}
            onClose={() => setFeature(null)}
          />
        </Suspense>
      ) : null}
      {feature?.type === "external" ? (
        <Suspense
          fallback={<div className="toast">آماده‌سازی سرنخ حضوری…</div>}
        >
          <ExternalDiscovery
            key={feature.productId || feature.snapshot?.created || "search"}
            sid={sid}
            query={feature.query || query}
            productId={feature.productId}
            snapshot={feature.snapshot}
            onSaved={async () => {
              const requested = sid;
              const d = await api("sessions/" + requested);
              if (activeSid.current === requested) setTurns(d.turns);
            }}
            onClose={() => setFeature(null)}
          />
        </Suspense>
      ) : null}
      {feature?.type === "areas" ? (
        <Suspense
          fallback={<div className="toast">آماده‌سازی نقشه نواحی…</div>}
        >
          <ShoppingAreas
            sid={sid}
            initial={feature.data}
            query={feature.data?.topic || ""}
            onClose={() => setFeature(null)}
          />
        </Suspense>
      ) : null}
      {feature?.type === "request" ? (
        <MerchantRequest
          sid={sid}
          offer={feature.offer}
          onClose={() => setFeature(null)}
          onCreated={() => setToast("درخواست ثبت شد")}
        />
      ) : null}
      {feature?.type === "quotes" ? (
        <Quotes
          sid={sid}
          onClose={() => setFeature(null)}
          onRefresh={refreshOffers}
        />
      ) : null}
      {feature?.type === "mission" ? (
        <Mission
          sid={sid}
          mission={mission}
          profile={profile}
          onClose={() => setFeature(null)}
          onPickOrigin={() => {
            setFeature(null);
            go("map");
            if (!offers.length) setToast("ابتدا یک محصول جست‌وجو کنید");
          }}
          onSaved={async (d) => {
            setMission(d);
            setFeature(null);
            const ids = visit.length
              ? visit
              : route?.stops?.map((s) => s.shop_id) ||
                offers.slice(0, 1).map((o) => o.shop_id);
            if (ids.length) plan(ids);
            else setToast("ذخیره شد؛ یک فروشگاه انتخاب کنید");
          }}
        />
      ) : null}
      {feature?.type === "basket" ? (
        <Basket
          sid={sid}
          items={basket}
          onItems={setBasket}
          onClose={() => setFeature(null)}
          onPlan={plan}
        />
      ) : null}
      {feature?.type === "location" ? (
        <LocationPanel
          sid={sid}
          offer={feature.offer}
          onClose={() => setFeature(null)}
        />
      ) : null}
      {feature?.type === "costs" ? (
        <Costs
          sid={sid}
          offers={feature.offers}
          route={
            route?.stops?.some((s) =>
              feature.offers.some((o) => o.shop_id === s.shop_id),
            )
              ? route
              : null
          }
          onClose={() => setFeature(null)}
        />
      ) : null}
      {feature?.type === "photo" ? (
        <PhotoSearch
          sid={sid}
          onClose={() => setFeature(null)}
          onSearch={(q, model) => {
            setFeature(null);
            search(q, undefined, [], model);
          }}
        />
      ) : null}
      {feature?.type === "street" ? (
        <Street
          sid={sid}
          offers={planItems.length ? planItems : offers}
          route={route}
          onClose={() => setFeature(null)}
          onResults={(d) => {
            setResults(d.results);
            setEvents(d.events);
          }}
          onPlan={plan}
        />
      ) : null}
    </div>
  );
}
function Pager({ page, pages, onPage }) {
  const items = [];
  for (let n = 1; n <= pages; n++) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 1) items.push(n);
    else if (items[items.length - 1] !== "…") items.push("…");
  }
  return (
    <nav className="pager" aria-label="صفحه‌های نتایج">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>
        قبلی
      </button>
      {items.map((n, i) =>
        n === "…" ? (
          <span key={"e" + i}>…</span>
        ) : (
          <button
            key={n}
            aria-current={n === page ? "page" : undefined}
            className={n === page ? "current" : ""}
            onClick={() => onPage(n)}
          >
            {num(n)}
          </button>
        ),
      )}
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>
        بعدی
      </button>
    </nav>
  );
}
function SkeletonLines({ rows = 3 }) {
  return (
    <div className="skeleton-block">
      {Array.from({ length: rows }, (_, i) => (
        <span
          key={i}
          className="skeleton"
          style={{ width: 92 - i * 17 + "%" }}
        />
      ))}
    </div>
  );
}
function SkeletonGrid({ count = 6 }) {
  return (
    <div className="offer-grid" aria-busy="true" aria-label="در حال بارگذاری">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="offer skeleton-card">
          <div className="offer-main">
            <span className="skeleton thumb-sk" />
            <SkeletonLines rows={3} />
          </div>
          <span className="skeleton" style={{ width: "45%", height: 22 }} />
          <span className="skeleton" style={{ width: "70%" }} />
          <div className="row-gap">
            <span className="skeleton btn-sk" />
            <span className="skeleton btn-sk" />
          </div>
        </div>
      ))}
    </div>
  );
}
function MoreMenu({ items }) {
  const [open, setOpen] = useState(false),
    box = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!box.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div className="more" ref={box}>
      <button
        className="btn btn-ghost btn-icon"
        aria-label="کارهای بیشتر"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <MoreHorizontal size={18} />
      </button>
      {open ? (
        <div className="popover up" role="menu" onClick={() => setOpen(false)}>
          {items.map(([label, Icon, fn]) => (
            <button key={label} role="menuitem" onClick={fn}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
const AVAILABILITY = {
  merchant_link_unavailable: "ناموجود · پاسخ فروشنده",
  web_verified_available: "موجود · سایت فروشگاه",
  web_verified_unavailable: "ناموجود · سایت فروشگاه",
  crowd_available: "موجود · گزارش خریداران",
  simulated_available: "موجودی ساختگی (سناریوی آزمایشی)",
  merchant_link_available: "موجود · پاسخ فروشنده",
  user_reported_available: "موجود · گزارش کاربر",
  user_reported_unavailable: "ناموجود · گزارش کاربر",
};
function OfferCard({
  o,
  index,
  style,
  compare,
  inPlan,
  onCompare,
  onPlan,
  onShop,
  onOpen,
  onContact,
  onSellers,
  onQuote,
  onBasket,
  onCosts,
  onLocation,
  onExternal,
  onReview,
  onAskPrice,
}) {
  const [badImage, setBadImage] = useState(false);
  const age = o.price_age_days;
  const credit = o.in_person_credit || [];
  const basis =
    o.price_basis === "simulated"
      ? "قیمت ساختگی (آزمایشی)"
      : o.price_basis === "merchant_link"
        ? "قیمت تأییدشدهٔ فروشنده"
        : o.price_basis === "web_verified"
          ? "قیمت سایت فروشگاه"
          : o.price_basis === "crowd"
            ? "قیمت گزارش چند خریدار"
            : o.price_basis === "user_reported"
              ? "قیمت گزارش کاربر"
              : "قیمت ثبت‌شده";
  return (
    <article
      className={
        "offer" + (compare ? " selected" : "") + (inPlan ? " in-plan" : "")
      }
      style={style}
    >
      <div className="offer-main">
        <button
          className="offer-thumb"
          onClick={onOpen}
          aria-label={"جزئیات " + o.persian_title}
        >
          {o.image_urls?.[0] && !badImage ? (
            <img
              src={o.image_urls[0]}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setBadImage(true)}
            />
          ) : (
            <ShoppingBag size={26} />
          )}
          <span className="offer-index">{num(index + 1)}</span>
        </button>
        <div className="offer-head">
          <span className="offer-cat">{o.category_name}</span>
          <h3 title={o.persian_title}>
            <button className="title-link" onClick={onOpen}>
              {o.persian_title}
            </button>
          </h3>
          <div className="offer-price">
            <b>{money(o.effective_price_toman ?? o.price_toman)}</b>
            <small>تومان</small>
            {o.price_band ? (
              <span className="band">{o.price_band.label}</span>
            ) : null}
          </div>
          <small className="offer-basis">
            {basis} ·{" "}
            {o.freshness_label ||
              (age != null ? num(Math.floor(age)) + " روز پیش" : "زمان نامشخص")}
          </small>
          {o.price_estimate ? (
            <small className="offer-estimate">
              برآورد: {money(o.price_estimate.low)} تا{" "}
              {money(o.price_estimate.high)} تومان
              {o.price_estimate.confidence_label
                ? " · " + o.price_estimate.confidence_label
                : ""}
            </small>
          ) : null}
          {o.price_stale && !o.price_confirmed_at && onAskPrice ? (
            <button className="ask-price" onClick={onAskPrice}>
              استعلام قیمت
            </button>
          ) : null}
        </div>
        <button
          className={"compare-toggle" + (compare ? " on" : "")}
          onClick={onCompare}
          aria-pressed={compare}
          aria-label={"انتخاب برای مقایسه " + o.persian_title}
          title="مقایسه"
        >
          <GitCompareArrows size={16} />
        </button>
      </div>
      {o.reported_price_toman != null ? (
        <p className="offer-note">قیمت قبلی: {money(o.price_toman)} تومان</p>
      ) : null}
      <p className="offer-recorded-date">
        <CalendarClock size={14} />
        به‌روزرسانی:{" "}
        <time dateTime={o.last_price_changed_at || undefined}>
          {recordedDate(o.last_price_changed_at)}
        </time>
      </p>
      <button className="offer-shop" onClick={onShop}>
        <span className="shop-ico">
          <Store size={16} />
        </span>
        <span className="shop-text">
          <b>
            {o.shop_name}
            {o.identity_status ? (
              <em
                className={"identity " + o.identity_status}
                title={
                  o.identity_status === "source_identity"
                    ? "این فروشگاه وب‌سایت یا اینستاگرام واقعی در منبع دارد"
                    : "نام این فروشگاه در دیتاست مسابقه ساختگی است"
                }
              >
                {o.identity_status === "source_identity"
                  ? "نام واقعی"
                  : "نام ساختگی"}
              </em>
            ) : null}
          </b>
          <small>
            {o.distance_km != null ? money(o.distance_km) + " کیلومتر · " : ""}
            {o.location_label || o.address}
          </small>
        </span>
        <ChevronLeft size={16} />
      </button>
      <div className="badges">
        <span
          className={
            "badge " +
            (o.opening?.state === "open"
              ? "badge-green"
              : o.opening?.state === "closed"
                ? "badge-red"
                : "")
          }
        >
          <Clock size={12} />
          {o.opening?.label || "ساعت نامشخص"}
        </span>
        {credit.length ? (
          <span className="badge badge-blue">
            <Wallet size={12} />
            {credit.map((p) => p.provider_name).join("، ")}
          </span>
        ) : null}
        {o.price_confirmed_today ? (
          <span className="badge badge-fresh">
            <Check size={12} />
            قیمت تأییدشده امروز
          </span>
        ) : null}
        <span className="badge badge-amber">
          {AVAILABILITY[o.availability] || "موجودی نامشخص"}
        </span>
        {o.seller_report?.source === "simulated" ? (
          <span className="badge badge-violet">شبیه‌سازی</span>
        ) : null}
        {o.image_match ? (
          <span className="badge">
            {o.image_match === "exact_model" ? "مطابق عکس" : "تطبیق تقریبی عکس"}
          </span>
        ) : null}
      </div>
      <details className="offer-why">
        <summary>چرا این گزینه؟</summary>
        {o.price_band ? <p>{o.price_band.notice}</p> : null}
        <ul>
          {o.why?.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p>
          آخرین تغییر قیمت:{" "}
          <time dir="ltr">
            {o.last_price_changed_at
              ? new Date(o.last_price_changed_at).toLocaleString("fa-IR", {
                  timeZone: "Asia/Tehran",
                })
              : "نامشخص"}
          </time>
        </p>
        {o.warranty ? <p>گارانتی: {warrantyText(o.warranty)}</p> : null}
        {o.seller_report ? (
          <p>
            {o.seller_report_expired
              ? "گزارش منقضی"
              : o.seller_report.source === "simulated"
                ? "شبیه‌سازی"
                : o.seller_report.source === "merchant_link"
                  ? "پاسخ فروشنده"
                  : "گزارش کاربر"}{" "}
            · {o.seller_report.note}
          </p>
        ) : null}
        <p className="muted">
          اعتبار قسطی نیازمند تأیید شرایط و سقف اعتبار شماست.
        </p>
        <Inspection inspection={o.inspection} />
      </details>
      <div className="offer-actions">
        <button
          className={"btn " + (inPlan ? "btn-soft" : "btn-primary")}
          onClick={onPlan}
        >
          {inPlan ? (
            <>
              <Check size={16} />
              در برنامه خرید
            </>
          ) : (
            <>
              <Plus size={16} />
              افزودن به برنامه
            </>
          )}
        </button>
        <button className="btn btn-ghost" onClick={onContact}>
          <MessageCircle size={16} />
          پیش‌نویس پرسش
        </button>
        <MoreMenu
          items={[
            ["فروشنده‌های همین مدل", Users, onSellers],
            ["بررسی و نقد محصول", MessageCircle, onReview],
            ["آدرس و ورودی فروشگاه", Building2, onLocation],
            ["هزینه و اقساط", Calculator, onCosts],
            ["افزودن به سبد چندقلمی", ShoppingBag, onBasket],
            ["درخواست تأیید و نگهداری", ShieldCheck, onQuote],
            ["سرنخ حضوری بیرون دیتاست", Globe, onExternal],
          ]}
        />
      </div>
    </article>
  );
}

function ContactModal({ contact: c, sid, onClose, onUpdate, showError }) {
  const [tab, setTab] = useState("draft"),
    [note, setNote] = useState(""),
    [price, setPrice] = useState(""),
    [available, setAvailable] = useState("unknown"),
    [hours, setHours] = useState(""),
    [pending, setPending] = useState(false),
    [done, setDone] = useState(""),
    [dialogue, setDialogue] = useState([]);
  async function report(status = "reported") {
    setPending(true);
    try {
      const d = await api("seller-events", {
        session_id: sid,
        shop_id: c.shop_id,
        product_id: c.product_id,
        status,
        price: price ? Number(price) : null,
        available: available === "unknown" ? null : available === "yes",
        hours,
        note,
      });
      onUpdate(d);
      setDone("گزارش شما ثبت شد؛ این نتیجه تأیید مستقل نیست.");
    } catch (e) {
      showError(e);
    } finally {
      setPending(false);
    }
  }
  async function simulate(scenario) {
    setPending(true);
    try {
      const d = await api("simulate-seller", {
        session_id: sid,
        shop_id: c.shop_id,
        product_id: c.product_id,
        scenario,
      });
      onUpdate(d);
      setDialogue(d.dialogue || []);
      setDone("سناریوی شبیه‌سازی اجرا شد؛ پاسخ واقعی فروشنده نیست.");
    } catch (e) {
      showError(e);
    } finally {
      setPending(false);
    }
  }
  async function resetSimulation() {
    setPending(true);
    try {
      const d = await api("simulate-seller/reset", { session_id: sid });
      onUpdate(d);
      setDialogue([]);
      setDone(d.notice);
    } catch (e) {
      showError(e);
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal title="پیگیری فروشنده" onClose={onClose}>
      <p className="contact-shop">
        <Store size={17} />
        {c.shop_name || c.offer?.shop_name}
      </p>
      <div className="contact-warning">
        <Info size={17} />
        <span>پیام را از راه ارتباطی فروشگاه بفرستید.</span>
      </div>
      <div className="tabs">
        {[
          ["draft", "پیگیری واقعی"],
          ["reply", "ثبت پاسخ فروشنده"],
          ["demo", "شبیه‌سازی (آزمایشی)"],
        ].map(([k, t]) => (
          <button
            className={tab === k ? "active" : ""}
            key={k}
            onClick={() => {
              setTab(k);
              setDone("");
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "draft" ? (
        <FollowUpChannels c={c} sid={sid} />
      ) : tab === "reply" ? (
        <form
          className="filter-form"
          onSubmit={(e) => {
            e.preventDefault();
            report();
          }}
        >
          <p className="fine-print">پاسخ فروشنده را ثبت کنید.</p>
          <div className="form-row">
            <label>
              قیمت اعلامی · تومان
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label>
              موجودی
              <select
                value={available}
                onChange={(e) => setAvailable(e.target.value)}
              >
                <option value="unknown">نامشخص</option>
                <option value="yes">فروشنده گفته موجود است</option>
                <option value="no">فروشنده گفته ناموجود است</option>
              </select>
            </label>
          </div>
          <label>
            ساعت یا آدرس تکمیلی
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              maxLength={300}
            />
          </label>
          <label>
            متن پاسخ یا یادداشت
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
              rows={3}
            />
          </label>
          <button
            className="primary"
            disabled={
              pending || (!note && !price && available === "unknown" && !hours)
            }
          >
            ثبت گزارش
          </button>
          <div className="failure-actions">
            <button
              type="button"
              disabled={pending}
              onClick={() => report("no_answer")}
            >
              پاسخ نداد؛ جایگزین بده
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => report("closed")}
            >
              بسته بود؛ جایگزین بده
            </button>
          </div>
        </form>
      ) : (
        <div className="simulation">
          <FlaskConical size={26} />
          <h3>آزمایش پیگیری و جایگزین‌یابی</h3>
          <p>حالت آزمایشی؛ پاسخ‌ها شبیه‌سازی می‌شوند.</p>
          {[
            ["available", "فروشنده پاسخ می‌دهد: موجود است"],
            ["unavailable", "فروشنده می‌گوید: ناموجود است"],
            ["price_changed", "قیمت نهایی ساختگی افزایش می‌یابد"],
            ["variant_mismatch", "مدل یا پیکربندی پیشنهادی متفاوت است"],
            ["credit_declined", "اعتبار حضوری همین خرید پذیرفته نمی‌شود"],
            ["no_answer", "فروشنده پاسخ نمی‌دهد"],
            ["closed", "فروشگاه بسته است"],
          ].map(([k, t]) => (
            <button
              className="outline full"
              key={k}
              disabled={pending}
              onClick={() => simulate(k)}
            >
              {t}
              <ArrowLeft size={16} />
            </button>
          ))}
          <button
            className="text-btn"
            disabled={pending}
            onClick={resetSimulation}
          >
            پاک کردن سناریوهای ساختگی این سفر
          </button>
          {dialogue.length ? (
            <div className="simulated-dialogue">
              <h4>گفت‌وگوی ساختگی · هیچ پیامی ارسال نشده است</h4>
              {dialogue.map((line, i) => (
                <p key={i}>
                  <b>
                    {line.role === "simulated_seller"
                      ? "پاسخ ساختگی"
                      : line.role === "assistant_questions"
                        ? "پرسش‌های باز"
                        : "پیش‌نویس دستیار"}
                    :{" "}
                  </b>
                  {line.text}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      )}
      {done ? (
        <p className="success-note" role="status">
          <Check size={17} />
          {done}
        </p>
      ) : null}
    </Modal>
  );
}

function ReplyContent({
  turn,
  onReference,
  onComparison,
  onAreas,
  onReview,
  onExternal,
}) {
  const refs = turn.references?.offers || [];
  const text = turn.content.replace(/\[(\d{1,2})\](?![([])/g, (raw, n) =>
    refs[Number(n) - 1]
      ? "[گزینه " + num(n) + "](#reply-offer-" + (Number(n) - 1) + ")"
      : raw,
  );
  return (
    <>
      {turn.references?.external_discovery ? (
        <button
          className="message-comparison"
          onClick={() => onExternal(turn.references.external_discovery)}
        >
          سرنخ‌های عمومی حضوری تهران · نسخه این پاسخ
        </button>
      ) : null}
      {turn.references?.buying_reviews?.map((r, i) => (
        <button
          key={"review-" + i}
          className="message-comparison"
          onClick={() => onReview(r)}
        >
          بررسی شواهد: {r.title}
        </button>
      ))}
      {turn.references?.shopping_areas?.areas?.length ? (
        <button
          className="message-areas"
          onClick={() => onAreas(turn.references.shopping_areas)}
        >
          <MapPin size={17} />
          نقشه نواحی پیشنهادی خرید حضوری
        </button>
      ) : null}
      {turn.references?.comparison ? (
        <button
          className="message-comparison"
          onClick={() => onComparison(turn.references.comparison)}
        >
          <GitCompareArrows size={17} />
          باز کردن مقایسه{" "}
          {num(
            turn.references.comparison.view_product_ids?.length ||
              turn.references.comparison.products.length,
          )}{" "}
          محصول
        </button>
      ) : null}
      {turn.references?.query_trail?.length ? (
        <details className="research-trail">
          <summary>
            شواهد بررسی · {num(turn.references.query_trail.length)} جست‌وجو
          </summary>
          {turn.references.research_plan?.map((t) => (
            <p key={t.id}>{t.question}</p>
          ))}
          <ul>
            {turn.references.query_trail.map((q, i) => (
              <li key={i}>
                {q.query || "فروشنده‌های مدل مشخص"} · {num(q.returned_offers)}{" "}
                آفر بررسی شد{" "}
                {q.candidate_limit_reached ? "· جست‌وجو به سقف نمونه رسید" : ""}
              </li>
            ))}
          </ul>
          <small>خلاصه جست‌وجو</small>
        </details>
      ) : null}
      <Markdown
        components={{
          img: () => null,
          a: ({ href, children, ...props }) =>
            href?.startsWith("#reply-offer-") ? (
              <button
                className="message-reference"
                onClick={() => onReference(refs[Number(href.slice(13))])}
              >
                {children}
              </button>
            ) : (
              <a
                href={href}
                {...props}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
        }}
      >
        {text}
      </Markdown>
      {turn.role === "assistant" &&
      !refs.length &&
      /\[\d+\]/.test(turn.content) ? (
        <p className="reference-notice">لینک محصولات این پاسخ در دسترس نیست.</p>
      ) : null}
    </>
  );
}
const sellerToken = new URLSearchParams(location.search).get("seller");
const shopToken = new URLSearchParams(location.search).get("shop");
createRoot(document.getElementById("root")).render(
  <>
    <Toaster />
    {shopToken ? (
      <ShopRefresh token={shopToken} />
    ) : new URLSearchParams(location.search).get("workspace") ===
      "freshness" ? (
      <FreshnessBoard />
    ) : sellerToken ? (
      <SellerPortal token={sellerToken} />
    ) : new URLSearchParams(location.search).get("workspace") === "ops" ? (
      <Suspense fallback={<div className="loading-screen">آماده‌سازی…</div>}>
        <Ops />
      </Suspense>
    ) : (
      <App />
    )}
  </>,
);
