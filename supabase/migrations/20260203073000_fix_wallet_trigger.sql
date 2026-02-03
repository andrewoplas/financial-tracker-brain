-- Fix wallet creation trigger - make it actually work
-- Drop existing broken trigger and create a working one

-- 1. Drop existing trigger and function
DROP TRIGGER IF EXISTS auto_create_user_wallets ON auth.users;
DROP TRIGGER IF EXISTS create_wallets_for_new_user ON auth.users;
DROP TRIGGER IF EXISTS new_user_default_wallets ON auth.users;
DROP FUNCTION IF EXISTS create_user_default_wallets();
DROP FUNCTION IF EXISTS handle_new_user_signup();
DROP FUNCTION IF EXISTS create_default_wallets();

-- 2. Create a working trigger function
CREATE OR REPLACE FUNCTION public.create_user_wallets()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default wallets for the new user
  INSERT INTO public.wallets (user_id, name, description, color, budget_limit, balance) VALUES
    (NEW.id, 'Life', 'Essential expenses and bills', '#EF4444', 50000.00, 0.00),
    (NEW.id, 'Growth', 'Investments and savings', '#10B981', 30000.00, 0.00),
    (NEW.id, 'Fun', 'Entertainment and discretionary spending', '#F59E0B', 20000.00, 0.00);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create wallets for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER create_wallets_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_wallets();

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_user_wallets() TO service_role;