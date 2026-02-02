# 🧠 Financial Tracker Brain

Your intelligent financial tracking companion with MCP integration for seamless LLM-powered transaction processing.

## Features

- 🎯 **Wallet-Based Budgeting**: Life, Growth, and Fun wallets
- 🤖 **LLM Integration**: Claude/AI-powered transaction parsing via MCP
- 📊 **Real-time Dashboard**: Fundey-inspired clean design
- 📱 **Responsive Design**: Works on desktop and mobile
- 🔄 **Automated Processing**: SMS/Email transaction parsing

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (planned)
- **Integration**: MCP Server for LLM communication
- **Deployment**: Vercel

## Development Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## MCP Integration

The app exposes these functions for LLM interaction:

- `add_transaction(amount, description, wallet, date)`
- `get_wallet_balance(wallet_name)`
- `list_transactions(filters)`
- `update_transaction(id, changes)`
- `get_spending_summary(period)`

## Workflow

1. Receive transaction SMS/email
2. Forward to Claude: "Record this transaction"
3. Claude uses MCP to parse and store
4. View results in dashboard

## Current Status

✅ Basic UI/UX complete (Fundey-inspired design)
🔄 MCP server development in progress
⏳ Supabase integration pending
⏳ Vercel deployment pending

---

Built for Andrew's financial tracking needs 🦖

Environment updated: Feb 2, 2026