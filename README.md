# BetterBlue 🍱

**BetterBlue is a personal meal randomizer and food budget tracker that helps users decide what to eat next and review their food spending history.**

Not sure what to eat? Set your budget, pick a mood, and let BetterBlue suggest something. Then track what you ate and how much you spent — day by day, week by week.

---

## What it does

- **Meal randomizer** — suggests a meal based on your budget, food source, hunger level, and excluded ingredients
- **Meal history** — saves each confirmed meal with price, source, and time
- **Daily spending summary** — shows how many meals you've logged today and the total cost
- **Weekly spending summary** — total meals, total spending, average per meal, and most expensive meal this week
- **Cloud or local storage** — history saved to Supabase when logged in, or to `localStorage` when not

---

## Features in V1.3

- Rewrote the old confirmation card into a proper **Meal Saved Summary Card**
- Added **All Sources** option so you can randomize across every food source
- Added **daily meal history grouping** by date with per-day totals
- Added **today spending summary** on the home page hero
- Added **weekly spending summary** on the history page
- Replaced `alert()` / `confirm()` with toast notifications and custom confirm modals
- Added button disabled state while saving to prevent duplicate records
- Improved empty states on the randomizer and history pages
- Fixed build error caused by `next/font/google` — now uses a system font stack
- Improved loading and error states with user-facing messages
- Cleaned up restaurant / checkout / delivery wording so the app stays focused on personal meal tracking

---

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** — auth, `meal_history` table, `user_menus` table, `hidden_default_menus` table
- `localStorage` fallback for unauthenticated users

---

## Running locally

```bash
git clone <your-repo-url>
cd BetterBlue-main
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Supabase setup

You need three tables in your Supabase project:

**`meal_history`**
```sql
id          uuid primary key default gen_random_uuid()
user_id     uuid references auth.users
menu_id     uuid nullable
menu_name   text
price       numeric
place       text
budget      numeric nullable
hunger_level text nullable
meal_type   text default 'other'
eaten_at    timestamptz default now()
```

**`user_menus`** — stores custom menus and overrides for default menus

**`hidden_default_menus`** — stores which built-in menus the user has hidden

Row-level security (RLS) should be enabled on all tables with policies that let users read and write only their own rows.

---

## Roadmap

- [ ] Weekly 5 food group tracking (protein, carbs, fat, vegetables, fruits)
- [ ] Daily budget cap with progress bar
- [ ] Meal type tagging (breakfast / lunch / dinner / snack)
- [ ] Export spending history as CSV
- [ ] Push notifications for meal time reminders
