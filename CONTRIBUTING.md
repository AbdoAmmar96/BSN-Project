# Contributing to BSN

شكراً إنك مهتم تساهم في المشروع. 🎉

## Quick rules

1. **Fork → branch → PR.** ما تـ push على `main` مباشرة.
2. كل feature/fix في branch منفصل: `feat/short-name` أو `fix/short-name`.
3. الـ commit message ENGLISH، سطر أول قصير (< 70 حرف)، body عربي/إنجليزي حسب التفاصيل.
4. ما تـ commit ملفات `.env` أو أي credentials. الـ `.gitignore` بيغطيهم لكن دائماً اتفقد `git status` قبل الـ commit.
5. كل PR يحتاج وصف يشرح: **ليه** التغيير، **إيه** اللي اتغير، **ازاي** اتختبر.

## Local setup

اقرأ [SETUP.md](./SETUP.md) — فيه كل التفاصيل.

## Code style

### Backend (Laravel)
- Run `./vendor/bin/pint` قبل commit (PSR-12 auto-format)
- استخدم type hints + return types
- Validation داخل الـ controller (`$request->validate`) أو في Form Request للـ rules المعقدة

### Frontend (React)
- Functional components فقط
- Tailwind للـ styling — لو محتاج CSS لـ animation معقد، حطه في `src/styles/index.css`
- استخدم TanStack Query للـ data fetching مش `useEffect + fetch`
- أي route جديد لازم يكون lazy via `React.lazy()`

## Reporting bugs

افتح issue على GitHub وحط:
- خطوات إعادة الإنتاج
- المتوقع vs اللي حصل
- screenshots لو UI
- نسخة الـ browser / PHP / Node

## Security issues

لا تفتح issue عام لحاجة أمنية. ابعت email لـ `hello@bp-eg.com` بالتفاصيل.
