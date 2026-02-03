-- Fix conflicting user authentication setup
-- Clean up duplicate triggers and functions

-- 1. Drop all existing conflicting triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_wallets_for_new_user ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS create_default_wallets_for_user(UUID);
DROP FUNCTION IF EXISTS create_default_wallets();

-- 2. Drop all existing conflicting RLS policies
DROP POLICY IF EXISTS "Users can only see own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can only insert own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can only update own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can only delete own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can view their own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can insert their own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can update their own wallets" ON wallets;
DROP POLICY IF EXISTS "Users can delete their own wallets" ON wallets;
DROP POLICY IF EXISTS "Authenticated users only" ON wallets;

DROP POLICY IF EXISTS "Users can only see own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can only insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can only update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can only delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
DROP POLICY IF EXISTS "Authenticated users only" ON transactions;

-- 3. Create one clean trigger function for new users
CREATE OR REPLACE FUNCTION create_user_default_wallets()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default wallets for the new user
    INSERT INTO wallets (user_id, name, description, color, budget_limit) VALUES
        (NEW.id, 'Life', 'Essential expenses and bills', '#EF4444', 50000.00),
        (NEW.id, 'Growth', 'Investments and savings', '#10B981', 30000.00),
        (NEW.id, 'Fun', 'Entertainment and discretionary spending', '#F59E0B', 20000.00);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create one clean trigger
CREATE TRIGGER auto_create_user_wallets
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION create_user_default_wallets();

-- 5. Create clean, non-overlapping RLS policies

-- Wallet policies
CREATE POLICY "wallet_select_own" ON wallets 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wallet_insert_own" ON wallets 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallet_update_own" ON wallets 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallet_delete_own" ON wallets 
    FOR DELETE USING (auth.uid() = user_id);

-- Transaction policies
CREATE POLICY "transaction_select_own" ON transactions 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transaction_insert_own" ON transactions 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transaction_update_own" ON transactions 
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transaction_delete_own" ON transactions 
    FOR DELETE USING (auth.uid() = user_id);

-- Category policies (global read access)
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "category_select_all" ON categories 
    FOR SELECT USING (true);

-- 6. Ensure user_id columns exist and have proper constraints
-- (These should already exist from previous migrations, but let's be safe)

-- Check if user_id column exists in wallets table, add if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'wallets' AND column_name = 'user_id') THEN
        ALTER TABLE wallets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Check if user_id column exists in transactions table, add if missing  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'user_id') THEN
        ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 7. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);