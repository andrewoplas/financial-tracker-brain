-- Fix authentication and user isolation schema

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

-- Create trigger to auto-create wallets for new users
DROP TRIGGER IF EXISTS create_wallets_for_new_user ON auth.users;
CREATE TRIGGER create_wallets_for_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_wallets();

-- Update RLS policies for proper user isolation

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on wallets" ON wallets;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;

-- Create user-isolated policies for wallets
CREATE POLICY "Users can view their own wallets" ON wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets" ON wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" ON wallets FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets" ON wallets FOR DELETE
    USING (auth.uid() = user_id);

-- Create user-isolated policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions FOR DELETE
    USING (auth.uid() = user_id);