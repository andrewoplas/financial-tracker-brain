#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class FinancialTrackerServer {
  constructor() {
    this.server = new Server(
      {
        name: "financial-tracker-brain",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "add_transaction",
            description: "Add a new transaction to a wallet",
            inputSchema: {
              type: "object",
              properties: {
                amount: {
                  type: "number",
                  description: "Transaction amount (positive for income, negative for expense)",
                },
                description: {
                  type: "string",
                  description: "Transaction description/merchant name",
                },
                wallet_name: {
                  type: "string",
                  description: "Wallet name (Life, Growth, Fun)",
                },
                date: {
                  type: "string",
                  description: "Transaction date (YYYY-MM-DD format)",
                  default: new Date().toISOString().split('T')[0],
                },
                category: {
                  type: "string",
                  description: "Transaction category (Food, Transport, Bills, etc.)",
                  default: "Other",
                },
                user_id: {
                  type: "string",
                  description: "User ID for the transaction",
                },
              },
              required: ["amount", "description", "wallet_name", "user_id"],
            },
          },
          {
            name: "get_wallet_balance",
            description: "Get the current balance of a specific wallet",
            inputSchema: {
              type: "object",
              properties: {
                wallet_name: {
                  type: "string",
                  description: "Wallet name (Life, Growth, Fun)",
                },
                user_id: {
                  type: "string",
                  description: "User ID",
                },
              },
              required: ["wallet_name", "user_id"],
            },
          },
          {
            name: "list_transactions",
            description: "Get recent transactions with optional filters",
            inputSchema: {
              type: "object",
              properties: {
                user_id: {
                  type: "string",
                  description: "User ID",
                },
                limit: {
                  type: "number",
                  description: "Number of transactions to return",
                  default: 10,
                },
                wallet_name: {
                  type: "string",
                  description: "Filter by wallet name (optional)",
                },
                days: {
                  type: "number",
                  description: "Get transactions from last N days (optional)",
                },
              },
              required: ["user_id"],
            },
          },
          {
            name: "get_spending_summary",
            description: "Get spending summary for a time period",
            inputSchema: {
              type: "object",
              properties: {
                user_id: {
                  type: "string",
                  description: "User ID",
                },
                period: {
                  type: "string",
                  description: "Time period: week, month, or year",
                  default: "month",
                },
              },
              required: ["user_id"],
            },
          },
          {
            name: "get_wallets",
            description: "Get all wallets for a user",
            inputSchema: {
              type: "object",
              properties: {
                user_id: {
                  type: "string",
                  description: "User ID",
                },
              },
              required: ["user_id"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "add_transaction":
            return await this.addTransaction(args);
          case "get_wallet_balance":
            return await this.getWalletBalance(args);
          case "list_transactions":
            return await this.listTransactions(args);
          case "get_spending_summary":
            return await this.getSpendingSummary(args);
          case "get_wallets":
            return await this.getWallets(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async addTransaction(args) {
    const { amount, description, wallet_name, date, category = "Other", user_id } = args;

    // Get wallet ID
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id')
      .eq('name', wallet_name)
      .eq('user_id', user_id)
      .single();

    if (walletError || !wallet) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Wallet "${wallet_name}" not found for user`,
          },
        ],
      };
    }

    // Get category ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();

    const categoryId = categoryData?.id || null;

    // Determine transaction type
    const transactionType = amount > 0 ? 'income' : 'expense';

    // Add transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        amount: Math.abs(amount), // Store as positive, type determines direction
        description,
        date: date || new Date().toISOString().split('T')[0],
        wallet_id: wallet.id,
        category_id: categoryId,
        user_id,
        type: transactionType,
        status: 'completed',
      })
      .select()
      .single();

    if (transactionError) {
      return {
        content: [
          {
            type: "text",
            text: `Error adding transaction: ${transactionError.message}`,
          },
        ],
      };
    }

    // Update wallet balance
    const balanceChange = transactionType === 'income' ? Math.abs(amount) : -Math.abs(amount);
    await supabase.rpc('update_wallet_balance', {
      wallet_id: wallet.id,
      amount_change: balanceChange
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ Transaction added successfully!\n` +
                `Amount: ₱${Math.abs(amount).toLocaleString()}\n` +
                `Description: ${description}\n` +
                `Wallet: ${wallet_name}\n` +
                `Type: ${transactionType}\n` +
                `Date: ${date || 'today'}`,
        },
      ],
    };
  }

  async getWalletBalance(args) {
    const { wallet_name, user_id } = args;

    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('name, balance')
      .eq('name', wallet_name)
      .eq('user_id', user_id)
      .single();

    if (error || !wallet) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Wallet "${wallet_name}" not found`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `💰 ${wallet.name} Wallet Balance: ₱${wallet.balance.toLocaleString()}`,
        },
      ],
    };
  }

  async listTransactions(args) {
    const { user_id, limit = 10, wallet_name, days } = args;

    let query = supabase
      .from('transactions')
      .select(`
        *,
        wallets(name, color),
        categories(name)
      `)
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (wallet_name) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('name', wallet_name)
        .eq('user_id', user_id)
        .single();
      
      if (wallet) {
        query = query.eq('wallet_id', wallet.id);
      }
    }

    if (days) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      query = query.gte('date', dateThreshold.toISOString().split('T')[0]);
    }

    const { data: transactions, error } = await query;

    if (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching transactions: ${error.message}`,
          },
        ],
      };
    }

    if (!transactions || transactions.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No transactions found",
          },
        ],
      };
    }

    const transactionList = transactions.map(t => 
      `${t.date} | ${t.type === 'income' ? '+' : '-'}₱${t.amount.toLocaleString()} | ${t.description} | ${t.wallets?.name || 'Unknown'}`
    ).join('\n');

    return {
      content: [
        {
          type: "text",
          text: `📋 Recent Transactions (${transactions.length}):\n\n${transactionList}`,
        },
      ],
    };
  }

  async getSpendingSummary(args) {
    const { user_id, period = 'month' } = args;

    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        type,
        categories(name),
        wallets(name)
      `)
      .eq('user_id', user_id)
      .gte('date', startDate.toISOString().split('T')[0]);

    if (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching spending summary: ${error.message}`,
          },
        ],
      };
    }

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const net = income - expenses;

    return {
      content: [
        {
          type: "text",
          text: `📊 ${period.charAt(0).toUpperCase() + period.slice(1)} Summary:\n\n` +
                `💰 Income: ₱${income.toLocaleString()}\n` +
                `💸 Expenses: ₱${expenses.toLocaleString()}\n` +
                `📈 Net: ${net >= 0 ? '+' : '-'}₱${Math.abs(net).toLocaleString()}`,
        },
      ],
    };
  }

  async getWallets(args) {
    const { user_id } = args;

    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('name, balance, description')
      .eq('user_id', user_id)
      .order('created_at', { ascending: true });

    if (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching wallets: ${error.message}`,
          },
        ],
      };
    }

    const walletList = wallets.map(w => 
      `💳 ${w.name}: ₱${w.balance.toLocaleString()}${w.description ? ` (${w.description})` : ''}`
    ).join('\n');

    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

    return {
      content: [
        {
          type: "text",
          text: `💼 Your Wallets:\n\n${walletList}\n\n💰 Total: ₱${totalBalance.toLocaleString()}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Financial Tracker MCP server running on stdio");
  }
}

const server = new FinancialTrackerServer();
server.run().catch(console.error);