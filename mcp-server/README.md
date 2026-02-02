# 🤖 Financial Tracker MCP Server

Model Context Protocol (MCP) server that enables Claude and other LLMs to interact with your financial tracker app.

## Features

- ✅ **Add Transactions** - Record income/expenses with natural language
- ✅ **Check Balances** - Get wallet balances instantly  
- ✅ **List Transactions** - View recent activity with filters
- ✅ **Spending Summary** - Get insights by week/month/year
- ✅ **Wallet Management** - View all wallets and balances

## Quick Start

### 1. Install Dependencies
```bash
cd mcp-server
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Add Database Function
Run this in your Supabase SQL Editor:
```sql
-- Function to safely update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(
  wallet_id UUID,
  amount_change DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE wallets 
  SET balance = balance + amount_change,
      updated_at = NOW()
  WHERE id = wallet_id;
END;
$$ LANGUAGE plpgsql;
```

### 4. Test the Server
```bash
npm run test
```

### 5. Configure OpenClaw
Add to your OpenClaw config:
```json
{
  "mcpServers": {
    "financial-tracker": {
      "command": "node",
      "args": ["path/to/financial-tracker-brain/mcp-server/src/index.js"],
      "cwd": "path/to/financial-tracker-brain/mcp-server"
    }
  }
}
```

## Usage Examples

Once connected, Claude can:

**Add a transaction:**
> "Add ₱500 lunch at Jollibee to my Life wallet"

**Check balance:**
> "What's my Growth wallet balance?"

**Get recent transactions:**
> "Show me my last 5 transactions"

**Monthly summary:**
> "Give me this month's spending summary"

## Available Tools

### `add_transaction`
- **amount**: Transaction amount (positive = income, negative = expense)
- **description**: Transaction description/merchant
- **wallet_name**: Target wallet (Life, Growth, Fun)
- **date**: Transaction date (optional, defaults to today)
- **category**: Transaction category (optional)
- **user_id**: User ID (required)

### `get_wallet_balance`
- **wallet_name**: Wallet to check
- **user_id**: User ID

### `list_transactions`
- **user_id**: User ID (required)
- **limit**: Number of transactions (default: 10)
- **wallet_name**: Filter by wallet (optional)
- **days**: Filter by last N days (optional)

### `get_spending_summary`
- **user_id**: User ID (required)
- **period**: Time period (week/month/year, default: month)

### `get_wallets`
- **user_id**: User ID (required)

## Development

```bash
# Run in development mode (auto-restart)
npm run dev

# Run in production mode
npm run start

# Test the server
npm run test
```

---

🦖 **Built for Andrew's Financial Brain** - Making money management as easy as talking to Claude!