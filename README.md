<div align="center">

# بازارگرد · Bazaargard

**از «چی بخرم؟» تا «از کجا بخرم؟»**

دستیار فارسی برای جست‌وجوی کالا، مقایسهٔ گزینه‌ها و برنامه‌ریزی خرید حضوری در تهران.

[![CI](https://github.com/pouyarouzbeh/bazaargard/actions/workflows/ci.yml/badge.svg)](https://github.com/pouyarouzbeh/bazaargard/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-149eca)
![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.12%2B-009688)
[![MIT](https://img.shields.io/badge/License-MIT-913f3f)](LICENSE)

[شروع سریع](#شروع-سریع-در-ویندوز) · [توسعه](#توسعه) · [مستندات](#مستندات) · [English](#english)

</div>

## دربارهٔ این نسخه

این مخزن نسخهٔ توسعه‌یافتهٔ [moazeniz/bazargard](https://github.com/moazeniz/bazargard) است. تجربهٔ خرید بازطراحی شده و رابط راست‌به‌چپ، پالت جیگری و سنگی، تم روشن و تیره، دراور و toast مشترک و متن‌های کوتاه دارد. ساختار راهنماها و اسکیل‌های توسعه نیز با معماری بازارگرد تطبیق یافته است.

## قابلیت‌ها

- **جست‌وجو:** نام یا مدل کالا، بودجه، برند، محدوده و شرایط اقساط حضوری.
- **انتخاب محصول و فروشگاه:** کارت محصول، پیشنهادهای فروشندگان، قیمت و تاریخ ثبت.
- **مقایسه:** مشخصات چند محصول، نمودار، منابع و خروجی HTML/CSV.
- **نقشه و برنامهٔ خرید:** انتخاب فروشگاه، حداکثر چهار توقف، سبد چندقلمی و مسیریابی.
- **پیگیری:** پیش‌نویس پرسش، لینک پاسخ فروشنده و چک‌لیست شخصی.
- **گفت‌وگوی هوشمند:** اتصال اختیاری به مدل؛ جست‌وجوی مستقیم بدون کلید مدل هم کار می‌کند.
- **توسعهٔ ساختاریافته:** قراردادهای `AGENTS.md`، پنج skill محلی، بررسی کنتراست و بودجهٔ خروجی.

فضای Ops جداگانه برای بررسی سایت نمونه و عملیات تأییدشونده نیز در کد موجود است؛ برای راه‌اندازی بخش خرید به آن نیازی نیست.

## پیش‌نیازها

| مورد | نیاز |
| --- | --- |
| Python | نسخهٔ 3.12 یا بالاتر |
| Node.js | نسخهٔ 20.19 یا بالاتر |
| داده | سه فایل `products.csv`، `shops.csv` و `offers.csv` یا یک `catalog.db` سازگار |
| کلید مدل | فقط برای گفت‌وگوی هوشمند و امکانات وابسته به مدل |

دیتاست همراه مخزن توزیع نمی‌شود. دیتاست محلی بررسی‌شده شامل ۲۲۵٬۹۰۳ محصول، ۳۳۱٬۵۰۶ پیشنهاد و ۶٬۴۷۶ فروشگاه بوده است؛ تعداد رکوردها به دادهٔ ورودی شما بستگی دارد.

## شروع سریع در ویندوز

در PowerShell:

```powershell
git clone https://github.com/pouyarouzbeh/bazaargard.git
cd bazaargard
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-windows.txt
npm.cmd --prefix frontend ci --no-audit --no-fund
npm.cmd --prefix frontend run build
Copy-Item .env.example .env
```

CSVها را استخراج کنید و مسیر پوشه‌ای را بدهید که هر سه فایل مستقیماً در آن قرار دارند:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-local.ps1 -DatasetDir "C:\datasets\torob"
```

اگر کاتالوگ آماده دارید، آن را در `data\catalog.db` قرار دهید و دستور زیر را اجرا کنید. برای دفعات بعد نیز همین دستور کافی است:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\run-local.ps1
```

برنامه در **<http://127.0.0.1:8506>** باز می‌شود. برای توقف `Ctrl+C` بزنید. کاتالوگ موجود بازنویسی نمی‌شود. راهنمای کامل: [اجرای ویندوز](docs/LOCAL_WINDOWS.fa.md).

## اجرا در Linux / macOS

با Python، Node و Make نصب‌شده:

```bash
git clone https://github.com/pouyarouzbeh/bazaargard.git
cd bazaargard
make install
make install-frontend
make catalog DATASET_DIR=/path/to/torob-csvs
make frontend-build
cp .env.example .env
set -a; . ./.env; set +a
make run
```

برای استفاده از `catalog.db` آماده، آن را در `data/` قرار دهید و مرحلهٔ `make catalog` را رد کنید.

## تنظیمات

الگوی تنظیمات در [.env.example](.env.example) است. مقادیر واقعی را فقط در `.env` یا محیط اجرا تنظیم کنید.

| متغیر | کاربرد |
| --- | --- |
| `PUBLIC_BASE_URL` | نشانی برنامه؛ پیش‌فرض نمونه برای لوکال است |
| `DATA_DIR` | مسیر کاتالوگ و دادهٔ اجرایی؛ پیش‌فرض لوکال `data/` است |
| `LLM_PROVIDER` | `boxapi` یا `anthropic` |
| `BOXAPI_BASE_URL` / `BOXAPI_KEYS` | نشانی سرویس و کلیدهای مسیر BoxAPI |
| `RELAY_URL` / `RELAY_TOKEN` | تنظیمات relay برای مسیر Anthropic |
| `LLM_MODEL` / `LLM_LIGHT_MODEL` | انتخاب مدل در مسیر BoxAPI؛ اختیاری |

تنظیمات پیش‌فرض نمونه هیچ کلید یا مقصد انتشار فعالی ندارند. پس از تغییر `.env`، بک‌اند را دوباره اجرا کنید.

## توسعه

بک‌اند خروجی `frontend/dist` را سرو می‌کند. پس از تغییر UI بیلد تازه بگیرید؛ برای به‌روزرسانی خودکار، بک‌اند را روی پورت 8506 نگه دارید و Vite را در ترمینال دیگری اجرا کنید:

```bash
npm --prefix frontend run dev -- --host 127.0.0.1
```

بررسی‌های فرانت‌اند:

```bash
npm --prefix frontend run check
```

این دستور مستندات agent/skill، ۷۲ جفت کنتراست رنگ، تست‌های رفتار، بیلد و سقف حجم فشردهٔ JS/CSS را بررسی می‌کند.

تست‌های بک‌اند در PowerShell:

```powershell
.\.venv\Scripts\python.exe -X utf8 -m pytest -q tests
# برای تست‌های وابسته به دیتاست:
$env:TEST_CATALOG = (Resolve-Path .\data\catalog.db).Path
.\.venv\Scripts\python.exe -X utf8 -m pytest -q tests
```

در Linux/macOS از `make test` یا `make test-full TEST_CATALOG=/absolute/path/catalog.db` استفاده کنید.

در بررسی لوکال ویندوز، ۴۰۰ تست از ۴۰۳ تست بک‌اند موفق بوده‌اند؛ سه شکست مربوط به PDF و آزمایشگاه جانبی Ops هستند. جزئیات در [راهنمای ویندوز](docs/LOCAL_WINDOWS.fa.md) ثبت شده است. تست مدل واقعی به کلید و سرویس در دسترس نیاز دارد.

## ساختار پروژه

```text
bazaargard/
├── backend/             FastAPI، کاتالوگ، حافظه، agent و تحقیق
├── frontend/            React 19، Vite، اجزای UI و تم
├── .agents/skills/      پنج workflow مخصوص توسعه و بررسی
├── agents/shared/      معماری، طراحی، دسترس‌پذیری و داده
├── tests/              تست‌های Python
├── scripts/            بررسی خروجی، کنتراست و ابزارهای اجرا
├── docs/               راهنماها، گزارش تغییرات و مجوزها
├── infra/              ابزارهای زیرساخت و Liara
├── run-local.ps1        اجرای ویندوز و ورود دیتاست
└── .env.example         الگوی تنظیمات بدون کلید
```

معماری اجرا: `React → FastAPI → SQLite/FTS5`؛ سرویس مدل و منابع عمومی وب اختیاری‌اند. کاتالوگ، حافظه و وضعیت اجرا جدا از سورس نگه‌داری می‌شوند.

## داده و انتشار

- `.env`، دیتاست، پایگاه‌های داده، گفت‌وگوها، کش و `node_modules` وارد Git نمی‌شوند.
- قیمت‌ها دادهٔ ثبت‌شده‌اند. وضعیت موجودی، هویت و منابع در محل مربوط نمایش داده می‌شوند؛ بعضی نام‌ها و شماره‌های دیتاست نمونه‌اند.
- ارسال پیام به فروشنده خودکار نیست. سناریوهای شبیه‌سازی از پاسخ واقعی جدا هستند.
- Docker و ابزارهای Liara در مخزن موجودند؛ [راهنمای انتشار](docs/DEPLOYMENT.md) تنظیمات آن‌ها را توضیح می‌دهد. آدرس‌ها و شناسه‌های زیرساخت منبع، مقصد آمادهٔ این مخزن نیستند.
- پوش به `main` برنامه را روی سرور منتشر نمی‌کند. workflow انتشار منبع به مخزن اصلی محدود است.

## مستندات

- [راهنمای اجرای ویندوز](docs/LOCAL_WINDOWS.fa.md)
- [معماری](docs/ARCHITECTURE.md) و [قابلیت‌ها](docs/FEATURES.md)
- [داده](docs/DATA.md) و [امنیت](docs/SECURITY.md)
- [انتقال ساختار و بازسازی UX](docs/UX_REBUILD.md)
- [گزارش تغییرات این نسخه](docs/changelogs/README.md)
- [قرارداد توسعه](AGENTS.md)

## English

Bazaargard is a Persian, RTL assistant for in-person shopping in Tehran. It combines catalogue search, product comparison, store offers, maps and visit planning. This repository develops the upstream Bazargard project with a rebuilt shopping experience, light/dark semantic themes, shared overlays/toasts and local engineering skills.

Requires Python 3.12+, Node.js 20.19+ and a compatible Torob catalogue. The dataset and API credentials are not distributed. Direct search works without an LLM key; model-backed features need configured credentials. See the setup sections above and linked documentation for platform-specific details.

## مجوز و منبع

بر پایهٔ پروژهٔ [Bazargard از MeowMeow Team](https://github.com/moazeniz/bazargard)، با حفظ تاریخچه و [مجوز MIT](LICENSE). تغییرات این مخزن شامل تجربهٔ خرید، طراحی رابط و ساختار توسعهٔ محلی است.

صف ButterPop از Peony اقتباس شده و [مجوز و انتساب آن](docs/licenses/BUTTERPOP_LICENSE.md) حفظ شده است. دیتاست ترب مجوز و شرایط توزیع مستقل دارد و جزو این مخزن نیست.
