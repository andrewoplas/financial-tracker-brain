-- Add missing columns to existing tables if they don't exist
-- This migration only adds columns, no data insertion

-- Add columns to transactions table if they don't exist
DO $$
BEGIN
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='status') THEN
        ALTER TABLE transactions ADD COLUMN status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed';
    END IF;
    
    -- Add type column  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='type') THEN
        ALTER TABLE transactions ADD COLUMN type TEXT CHECK (type IN ('income', 'expense', 'transfer')) DEFAULT 'expense';
    END IF;
    
    -- Add payment_method column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='payment_method') THEN
        ALTER TABLE transactions ADD COLUMN payment_method TEXT;
    END IF;
    
    -- Add merchant column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='merchant') THEN
        ALTER TABLE transactions ADD COLUMN merchant TEXT;
    END IF;
    
    -- Add notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='notes') THEN
        ALTER TABLE transactions ADD COLUMN notes TEXT;
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='updated_at') THEN
        ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END$$;

-- Add missing columns to wallets table if they don't exist
DO $$
BEGIN
    -- Add color column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallets' AND column_name='color') THEN
        ALTER TABLE wallets ADD COLUMN color TEXT DEFAULT '#10B981';
    END IF;
    
    -- Add budget_limit column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallets' AND column_name='budget_limit') THEN
        ALTER TABLE wallets ADD COLUMN budget_limit DECIMAL(10,2);
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallets' AND column_name='updated_at') THEN
        ALTER TABLE wallets ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add description column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallets' AND column_name='description') THEN
        ALTER TABLE wallets ADD COLUMN description TEXT;
    END IF;
END$$;

-- Add missing columns to categories table if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='icon') THEN
        ALTER TABLE categories ADD COLUMN icon TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='color') THEN
        ALTER TABLE categories ADD COLUMN color TEXT DEFAULT '#10B981';
    END IF;
END$$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);

-- Only create indexes for columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='type') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='status') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    END IF;
END$$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist and updated_at column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wallets' AND column_name='updated_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_wallets_updated_at') THEN
            CREATE TRIGGER update_wallets_updated_at 
                BEFORE UPDATE ON wallets 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='updated_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
            CREATE TRIGGER update_transactions_updated_at 
                BEFORE UPDATE ON transactions 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END$$;