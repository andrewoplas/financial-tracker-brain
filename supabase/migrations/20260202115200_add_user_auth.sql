-- Add user authentication and RLS
-- Add user_id columns to link data to authenticated users

-- Add user_id to wallets table
ALTER TABLE wallets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to transactions table  
ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Categories remain global (shared across users)

-- Update existing data to assign to the first user (if any exists)
-- This is safe for a fresh database but removes the demo data
DELETE FROM wallets;
DELETE FROM transactions;

-- Create default wallets function for new users
CREATE OR REPLACE FUNCTION create_default_wallets_for_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO wallets (user_id, name, description, color, budget_limit) VALUES
  (user_id, 'Life', 'Essential expenses and bills', '#EF4444', 50000.00),
  (user_id, 'Growth', 'Investments and savings', '#10B981', 30000.00),
  (user_id, 'Fun', 'Entertainment and discretionary spending', '#F59E0B', 20000.00);
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default wallets when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default wallets for the new user
  PERFORM create_default_wallets_for_user(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update RLS policies to be user-specific
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on wallets" ON wallets;
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;  
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;

-- Create user-specific policies for wallets
CREATE POLICY "Users can only see own wallets" ON wallets
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can only insert own wallets" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can only update own wallets" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can only delete own wallets" ON wallets
  FOR DELETE USING (auth.uid() = user_id);

-- Create user-specific policies for transactions
CREATE POLICY "Users can only see own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can only insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can only update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can only delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Categories remain global (all users can read)
CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (true);

-- Only authenticated users can access data
CREATE POLICY "Authenticated users only" ON wallets
  FOR ALL USING (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users only" ON transactions  
  FOR ALL USING (auth.role() = 'authenticated');

-- Add indexes for performance
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);