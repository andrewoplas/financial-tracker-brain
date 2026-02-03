-- Automatic Balance Calculation Triggers
-- This SQL creates database-level triggers to automatically keep wallet balances in sync

-- Function to calculate wallet balance from transactions
CREATE OR REPLACE FUNCTION calculate_wallet_balance(wallet_id_param UUID)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    balance_result DECIMAL(12,2);
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN type = 'income' THEN amount
            WHEN type = 'expense' THEN -amount
            ELSE 0
        END
    ), 0.00) INTO balance_result
    FROM transactions 
    WHERE wallet_id = wallet_id_param 
    AND status = 'completed';
    
    RETURN balance_result;
END;
$$ LANGUAGE plpgsql;

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance_from_transactions()
RETURNS TRIGGER AS $$
DECLARE
    target_wallet_id UUID;
    new_balance DECIMAL(12,2);
BEGIN
    -- Determine which wallet_id to update based on the operation
    IF TG_OP = 'DELETE' THEN
        target_wallet_id := OLD.wallet_id;
    ELSE
        target_wallet_id := NEW.wallet_id;
    END IF;

    -- Calculate the new balance
    new_balance := calculate_wallet_balance(target_wallet_id);
    
    -- Update the wallet balance
    UPDATE wallets 
    SET balance = new_balance, updated_at = NOW()
    WHERE id = target_wallet_id;
    
    -- Handle wallet_id changes in updates
    IF TG_OP = 'UPDATE' AND OLD.wallet_id != NEW.wallet_id THEN
        -- Also update the old wallet's balance
        new_balance := calculate_wallet_balance(OLD.wallet_id);
        UPDATE wallets 
        SET balance = new_balance, updated_at = NOW()
        WHERE id = OLD.wallet_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic balance updates
DROP TRIGGER IF EXISTS transaction_balance_trigger ON transactions;
CREATE TRIGGER transaction_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_wallet_balance_from_transactions();

-- Function to recalculate all wallet balances (for fixing existing data)
CREATE OR REPLACE FUNCTION recalculate_all_wallet_balances()
RETURNS TABLE(wallet_id UUID, wallet_name TEXT, old_balance DECIMAL(12,2), new_balance DECIMAL(12,2)) AS $$
DECLARE
    wallet_record RECORD;
    calculated_balance DECIMAL(12,2);
BEGIN
    FOR wallet_record IN SELECT id, name, balance FROM wallets LOOP
        calculated_balance := calculate_wallet_balance(wallet_record.id);
        
        UPDATE wallets 
        SET balance = calculated_balance, updated_at = NOW()
        WHERE id = wallet_record.id;
        
        wallet_id := wallet_record.id;
        wallet_name := wallet_record.name;
        old_balance := wallet_record.balance;
        new_balance := calculated_balance;
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to validate wallet balance (for monitoring)
CREATE OR REPLACE FUNCTION validate_wallet_balance(wallet_id_param UUID)
RETURNS TABLE(
    wallet_id UUID,
    stored_balance DECIMAL(12,2),
    calculated_balance DECIMAL(12,2),
    is_correct BOOLEAN,
    difference DECIMAL(12,2)
) AS $$
DECLARE
    stored_bal DECIMAL(12,2);
    calc_bal DECIMAL(12,2);
BEGIN
    SELECT balance INTO stored_bal FROM wallets WHERE id = wallet_id_param;
    calc_bal := calculate_wallet_balance(wallet_id_param);
    
    wallet_id := wallet_id_param;
    stored_balance := stored_bal;
    calculated_balance := calc_bal;
    difference := ABS(stored_bal - calc_bal);
    is_correct := difference < 0.01;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a function to fix any existing balance discrepancies
-- Run this once after setting up the triggers
-- SELECT * FROM recalculate_all_wallet_balances();

COMMENT ON FUNCTION calculate_wallet_balance IS 'Calculates wallet balance from all completed transactions';
COMMENT ON FUNCTION update_wallet_balance_from_transactions IS 'Trigger function to auto-update wallet balances when transactions change';
COMMENT ON FUNCTION recalculate_all_wallet_balances IS 'Recalculates and fixes all wallet balances (run once for data migration)';
COMMENT ON FUNCTION validate_wallet_balance IS 'Validates that stored balance matches calculated balance';