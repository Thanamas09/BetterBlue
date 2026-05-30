# BetterBlue 🍱

**BetterBlue is a high-fidelity personal meal randomizer and intelligent food budget tracker designed to streamline daily dining decisions and maximize financial overview.**

Not sure what to eat? Set your budget, evaluate your energy needs, and let BetterBlue analyze your custom catalog to suggest the perfect meal. Seamlessly track your culinary choices and expenditures day-by-day, week-by-week.

---

## What it does

- **Smart Meal Randomizer** — Generates precise culinary suggestions based on real-time budget caps, food sources, energy requirements, and granular ingredient exclusions.
- **Isolate-Loop Rerolling Engine** — Distinct state separation between permanent rejections and temporary alternative shuffling for frictionless decision-making.
- **Granular Spending History** — Chronologically logs confirmed meals complete with pricing data, acquisition sources, and precise temporal tracking.
- **Daily & Weekly Financial Metrics** — High-level dashboard displays aggregate meal counts, daily micro-budgets, weekly totals, average spending per meal, and premium expense identification.
- **Hybrid Data Infrastructure** — Enterprise-grade cloud synchronization via Supabase for authenticated profiles, backed by an instantaneous local fallback architecture via `localStorage`.

---

## Features in V1.4 (Latest Update) 🚀

- **Advanced Infinite-Loop Reroller** — Completely decoupled the "Reject" (Banned permanently for the session) and "Reroll" (Shift to next eligible item) mechanisms, preventing the pool from prematurely draining and enabling an elegant continuous carousel.
- **Dynamic Input-Driven Form Locking** — Implemented an asynchronous state listener on the primary randomizer form. The main "Start Randomizing" button locks dynamically upon generation to block duplicated submission chains, instantly re-activating the moment *any* criteria configuration is modified.
- **Refactored Confirmation Architecture** — Transitioned the deprecated structural dialogs into a cohesive, responsive **Meal Saved Summary Card**.
- **Global Ingestion Filter** — Introduced the highly requested **All Sources** parameter to fetch randomizations comprehensively across every localized merchant node.
- **Chronological Data Grouping** — Enhanced the ledger views with distinct calendar-date item grouping paired with integrated per-day financial summation banners.
- **Enhanced Micro-UX Safeguards** — Replaced intrusive native browser alerts with custom elegant toast channels and modern confirmation modals. Engineered strict hardware save-states to eradicate duplicate request pipelines.
- **Aesthetic Font Optimization** — Exchanged bulky external font assets for a streamlined native system font stack to mitigate deployment blocking and hydration warnings.

---

## Tech Stack

- **Next.js 16** (App Router, Type-Safe React Architecture)
- **Tailwind CSS v4** (Modern Utility-First Design Utility)
- **Supabase Cloud Infrastructure** — Enterprise Authentication, Row-Level Ledger Storage (`meal_history`), Component Cataloging (`user_menus`, `hidden_default_menus`)
- **Web Storage Core API** — Resilient localized fallback mechanism

---

## Running Locally

Ensure you have Node.js installed on your workstation before initiating setup.

```bash
# Clone the remote repository
git clone <your-repo-url>

# Navigate to the workspace directory
cd BetterBlue-main

# Install production and development dependencies
npm install

# Initialize local environment orchestration
cp .env.example .env.local

# Run the local optimization compiler
npm run dev