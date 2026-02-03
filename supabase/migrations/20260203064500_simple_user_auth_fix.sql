-- Simple fix for user authentication issues
-- Remove complex triggers and use a simpler approach

-- 1. Drop the problematic trigger and function
DROP TRIGGER IF EXISTS auto_create_user_wallets ON auth.users;
DROP FUNCTION IF EXISTS create_user_default_wallets();

-- 2. Make sure user_id columns are properly nullable and have correct constraints
ALTER TABLE wallets ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;

-- 3. Create a much simpler trigger function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default wallets for new user
  INSERT INTO wallets (user_id, name, description, color, budget_limit, balance) VALUES
    (NEW.id, 'Life', 'Essential expenses and bills', '#EF4444', 50000.00, 0.00),
    (NEW.id, 'Growth', 'Investments and savings', '#10B981', 30000.00, 0.00),
    (NEW.id, 'Fun', 'Entertainment and discretionary spending', '#F59E0B', 20000.00, 0.00);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail user creation
    RAISE WARNING 'Failed to create default wallets for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger with a simple name
CREATE TRIGGER new_user_default_wallets
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();

-- 5. Grant necessary permissions to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE wallets TO authenticated;
GRANT ALL ON TABLE transactions TO authenticated;
GRANT SELECT ON TABLE categories TO authenticated;

-- 6. Ensure RLS is working properly - simplify policies
DROP POLICY IF EXISTS "wallet_select_own" ON wallets;
DROP POLICY IF EXISTS "wallet_insert_own" ON wallets;
DROP POLICY IF EXISTS "wallet_update_own" ON wallets;
DROP POLICY IF EXISTS "wallet_delete_own" ON wallets;

CREATE POLICY "wallets_user_access" ON wallets
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transaction_select_own" ON transactions;
DROP POLICY IF EXISTS "transaction_insert_own" ON transactions;
DROP POLICY IF EXISTS "transaction_update_own" ON transactions;
DROP POLICY IF EXISTS "transaction_delete_own" ON transactions;

CREATE POLICY "transactions_user_access" ON transactions
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "category_select_all" ON categories;
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);