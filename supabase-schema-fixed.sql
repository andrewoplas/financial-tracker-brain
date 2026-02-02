-- Financial Tracker Brain Database Schema  
-- Fixed version for Supabase

-- Enable UUID extension (use gen_random_uuid instead)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create wallets table
CREATE TABLE wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    balance DECIMAL(12,2) DEFAULT 0.00,
    budget_limit DECIMAL(12,2),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table  
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Insert default wallets (Life, Growth, Fun)
INSERT INTO wallets (name, description, color, budget_limit) VALUES
('Life', 'Essential expenses and bills', '#EF4444', 50000.00),
('Growth', 'Investments and savings', '#10B981', 30000.00),
('Fun', 'Entertainment and discretionary spending', '#F59E0B', 20000.00);

-- Insert default categories
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

-- Add updated_at triggers
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (adjust later with auth)
CREATE POLICY "Allow all operations on wallets" ON wallets FOR ALL USING (true);
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true);