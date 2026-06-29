# FairShare

**Split fairly, settle simply.**

FairShare helps groups record shared expenses, calculate who owes whom, and minimize repayments — so splitting the bill never has to be awkward.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

- **Home** — Dashboard with balance summary, outstanding groups, and recent activity
- **Groups** — List active and archived groups; archive, restore, or permanently delete
- **Expenses** — Record expenses with equal, unequal, percentage, shares, or itemized splits
- **Balances** — Automatic net balance calculation per member
- **Debt Simplification** — Minimize the number of payments needed to settle up
- **Settlements** — Record payments (cash, Venmo, bank transfer, etc.)
- **Activity Feed** — Track expense creation, settlements, and comments
- **Comments** — Add notes to individual expenses

Data is persisted in your browser via `localStorage`.

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
