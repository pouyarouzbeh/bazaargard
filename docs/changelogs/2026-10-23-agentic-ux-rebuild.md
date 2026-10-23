# انتقال ساختار agentic و بازسازی تجربه خرید

## مشخصات و هدف

- تاریخ: 2026-10-23، منطقه Asia/Tehran. وضعیت: completed-local. انتشار خارجی: انجام نشده.
- درخواست: خواندن کامل سند UX کاربر و ساختار Peony، انتقال راهنماها و اسکیل‌ها و بازسازی رابط متناسب با خرید حضوری بازارگرد.
- آماده‌سازی ویندوز، ignoreهای داده و سند UX کاربر از مرحله قبلی حفظ شدند.

## قبل و بعد

صفحه شروع یک ورودی اصلی و چهار مسیر واقعی دارد. محصول از آفر فروشگاه تفکیک می‌شود؛ ابتدا سه گزینه و سپس نتایج بیشتر ارائه می‌شود. فیلترهای فعال مستقیماً قابل حذف‌اند، اصلاح یک فیلتر شرایط دیگر را نگه می‌دارد و نتایج قبلی حین جست‌وجوی بعدی باقی می‌مانند. خطای جست‌وجو امکان تلاش مجدد دارد. بدون کلید مدل، جست‌وجوی مستقیم فعال است.

قیمت و تاریخ ثبت‌شده و عدم قطعیت ساعت/هویت مشخص‌اند. شماره‌های ساختگی دیتاست به‌عنوان تماس واقعی نشان داده نمی‌شوند. برنامه حرکت و چک‌لیست شخصی به معنای تأیید فروشنده نیستند.

سیستم بصری روشن/تیره، لوگو، ارسال، کارت‌ها و ناوبری بازطراحی شدند. دراور مشترک بر پایه Radix با اصلاح فوکوس پیونی، اسکرول مستقل و حرکت transform/opacity قرار گرفت. toast از صف ButterPop پیونی با renderer سازگار استفاده می‌کند. ستاره‌ها و درخشش از UI حذف، امتیازها عددی و آیکون‌ها کنار متن شدند. فلش‌های پیشروی و لینک مورب در تمام بخش‌ها با فلش افقی چپ جایگزین شدند.

## فایل‌های این تغییر

- قراردادها: `AGENTS.md`، `frontend/AGENTS.md`، `agents/agent-workflow.md`، شش راهنمای `agents/shared`؛ پنج skill با SKILL، metadata و references در `.agents/skills`.
- پوسته و رفتار: `frontend/src/main.jsx`، `ui.jsx`، `style.css`، `pages.jsx`، `map.jsx`، `comparison.jsx` و فلش‌های لینک در `areas.jsx`، `features.jsx`، `followup.jsx`، `freshness.jsx`، `locations.jsx`، `ops.jsx`.
- اجزای جدید: `shopping-home.jsx`، `shopping-filters.jsx`، `product-card.jsx`، `purchase-checklist.jsx`، `shopping-model.mjs`، `shopping-model.test.mjs` و `shopping-experience.css`.
- theme و feedback: `theme.css`، `theme-toggle.jsx`، `frontend/public/theme-init.js`، `frontend/index.html`، `butterpop-store.mjs`، `butterpop-store.test.mjs`، `toaster.jsx` و `toaster.css`.
- سازگاری توکن‌های theme در `areas.css`، `buying-review.css`، `comparison.css`، `devconsole.css`، `dialogs.css`، `features.css`، `freshness.css`، `locations.css`، `ops.css` و `web-alternatives.css`.
- وابستگی/بررسی: `frontend/package.json`، lockfile و `scripts/check-frontend-budget.mjs`.
- گزارش‌ها: `docs/UX_REBUILD.md`، این changelog و index؛ مجوز منبع در `docs/licenses/BUTTERPOP_LICENSE.md`.

## منابع و سازگاری

سند UX کاربر به‌طور کامل خوانده شد. ریشه AGENTS، workflow، ۱۲ راهنمای shared، پنج SKILL و مراجع Peony خوانده شدند. قوانین Next/Laravel/فروش کفش منتقل نشده‌اند. ButterPop با حفظ مجوز MIT منتقل شده و اصلاح فوکوس sheet از پیونی اقتباس شده است. Radix Dialog 1.1.23 برای مدیریت focus، presence، scroll lock و dismissal اضافه شد.

React/Vite، FastAPI، API و مالکیت سشن حفظ شده‌اند. backend تغییر نکرده است. دیتاست، کلیدها و state خصوصی وارد bundle نشده‌اند.

## اعتبارسنجی

- `npm --prefix frontend run check`: بررسی دو AGENTS، پنج skill و ۲۸ لینک؛ شش تست رفتار؛ بیلد Vite و بودجه gzip موفق.
- آخرین سقف بررسی‌شده: JS کمتر از 220 KiB gzip و CSS کمتر از 40 KiB. هشدار Vite برای chunk بیش از 500 kB خام و نادیده گرفتن use-client در Radix باقی است؛ بررسی خروجی فشرده عبور می‌کند.
- `npm audit --omit=dev --audit-level=critical`: بدون آسیب‌پذیری در وابستگی تولیدی در زمان بررسی.
- پنج skill با quick_validate اسکیل‌ساز اعتبارسنجی شدند؛ diff whitespace بررسی شد.
- مرورگر: شروع، جست‌وجوی واقعی هدفون، نمایش سه محصول/نتایج بیشتر، بودجه فارسی، حذف مستقل فیلتر، آفرهای محصول، مقایسه دو محصول، افزودن به برنامه و toast، آماده حرکت و نقشه بررسی شدند. نقشه پس از بارگذاری بیلد تازه با پنج فروشگاه بالا آمد.
- روشن/تیره در دسکتاپ مشاهده شد. موبایل 390×844 و 320×800، نبود overflow افقی در عرض 320، ناوبری افقی با ارتفاع لمس 44 و نبود آیکون star/sparkle بررسی شد. دراور در موبایل بدون فوکوس خودکار ورودی باز شد؛ Escape فوکوس را به دکمه آغازگر برگرداند و پیش‌نویس بعد از بازگشایی حفظ شد.
- یک خطای lazy chunk در تب دارای بیلد قدیمی بعد از بیلد مجدد مشاهده شد؛ reload با بیلد تازه نقشه را بازیابی کرد. تب‌های باز قدیمی پس از بیلد جدید باید reload شوند.

## اجرا و محدودیت

بیلد لوکال از `http://127.0.0.1:8506/` سرو می‌شود. commit/push/deploy انجام نشده است. برای دیدن تغییر در مرورگرهای دیگر reload لازم است.

گفت‌وگوی مدل بدون کلید واقعی آزمایش نشده است. بررسی پنج کاربر مستقل، دستگاه واقعی، نرخ فریم و سرویس‌های بیرونی تضمین نشده‌اند. سه شکست قبلی PDF/Ops ویندوز مربوط به آماده‌سازی اولیه‌اند؛ این تغییر backend را تغییر نداده و کل suite دوباره اجرا نشده است.

برای بازگشت، فایل‌های UI و وابستگی/دستورالعمل این تغییر باید از snapshot قبلی بازیابی و فرانت دوباره بیلد شود؛ داده و `.env` مستقل باقی می‌مانند. تغییرات قبلی و فایل UX کاربر متعلق به این بازگشت نیستند.
