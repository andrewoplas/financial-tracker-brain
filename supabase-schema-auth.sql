-- Financial Tracker Brain Database Schema with Authentication
-- Run this in the Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create wallets table with user isolation
CREATE TABLE wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    balance DECIMAL(12,2) DEFAULT 0.00,
    budget_limit DECIMAL(12,2),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table (shared across users)
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table with user isolation
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer')) DEFAULT 'expense',
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    payment_method VARCHAR(100),
    merchant VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Insert default categories (shared across all users)
INSERT INTO categories (name, icon, color) VALUES
-- Life categories
('Groceries', '🛒', '#EF4444'),
('Utilities', '⚡', '#EF4444'),
('Rent/Mortgage', '🏠', '#EF4444'),
('Transportation', '🚗', '#EF4444'),
('Healthcare', '⚕️', '#EF4444'),
-- Growth categories
('Investments', '📈', '#10B981'),
('Savings', '💰', '#10B981'),
('Education', '📚', '#10B981'),
-- Fun categories
('Dining Out', '🍽️', '#F59E0B'),
('Entertainment', '🎬', '#F59E0B'),
('Shopping', '🛍️', '#F59E0B'),
('Travel', '✈️', '#F59E0B'),
-- General
('Income', '💵', '#10B981'),
('Other', '📦', '#6B7280');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to initialize default wallets for new users
CREATE OR REPLACE FUNCTION create_default_wallets()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id, name, description, color, budget_limit) VALUES
        (NEW.id, 'Life', 'Essential expenses and bills', '#EF4444', 50000.00),
        (NEW.id, 'Growth', 'Investments and savings', '#10B981', 30000.00),
        (NEW.id, 'Fun', 'Entertainment and discretionary spending', '#F59E0B', 20000.00);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create default wallets when user signs up
CREATE TRIGGER create_wallets_for_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_wallets();

-- Enable Row Level Security
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user isolation
-- Wallets: users can only see their own wallets
CREATE POLICY "Users can view their own wallets" ON wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets" ON wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" ON wallets FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets" ON wallets FOR DELETE
    USING (auth.uid() = user_id);

-- Categories: everyone can read (shared), no writes needed
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT
    USING (true);

-- Transactions: users can only see their own transactions
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions FOR DELETE
    USING (auth.uid() = user_id);