# FairShare

**Split Fairly, Settle Simply.**

FairShare helps groups record shared expenses, calculate who owes whom, and minimize repayments — so splitting the bill never has to be awkward.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

- **Home** — Dashboard with balance summary, outstanding groups, and recent activity
- **Groups** — List active and archived groups; rename, edit, archive, restore, or permanently delete
- **Expenses** — Add, edit, and delete with equal, unequal, percentage, shares, or itemized splits
- **Settlements** — Record payments with balance validation (can't overpay)
- **Recurring expenses** — Create, edit, or remove; weekly/monthly/yearly/custom with auto-generation
- **Profile** — Name, email, photo, default currency, notification preferences (local)
- **Search** — Global search across groups, expenses, and members
- **Reports** — Category and monthly spending, outstanding balances, CSV export
- **Activity Feed** — Track expense creation, settlements, and comments
- **Comments** — Add notes to individual expenses

Data is persisted in your browser via `localStorage`.

## Testing the app

The fastest way to explore features is to load demo data:

1. Run `npm run dev` and open [http://localhost:5173](http://localhost:5173)
2. Scroll to the bottom of **Home** and click **+ Testing & demo data**
3. Click **Load Demo Data** — this fills the app with two active groups (roommates + trip), an archived group, expenses across all split types, a settlement, and comments
4. Follow the built-in **Suggested walkthrough** to hit every major flow
5. Use **Clear All Data** when you want a fresh slate

### What the demo includes

| Group | Scenario |
| ----- | -------- |
| **Apartment 4B** | Rent (equal), utilities (unequal), groceries (itemized), partial Venmo settlement |
| **Portland Weekend** | Hotel (shares), dinner (equal) |
| **Office Lunch Club** | Archived group for testing restore/delete |

### Things worth trying

- **Balances tab** — debt simplification suggestions
- **Expenses tab** — expand an expense to see split breakdown and comments
- **Add Expense** — try percentage and itemized splits with tax/tip
- **Settle Up** — use the Fill shortcut to pre-fill a payment
- **Groups → Archived** — archive, restore, or permanently delete

## Tech Stack

- React 19 + Vite
- React Router
- Vanilla CSS (receipt-inspired UI)

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run preview` | Preview production build |
