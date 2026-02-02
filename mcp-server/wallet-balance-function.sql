-- Function to safely update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(
  wallet_id UUID,
  amount_change DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE wallets 
  SET balance = balance + amount_change,
      updated_at = NOW()
  WHERE id = wallet_id;
END;
$$ LANGUAGE plpgsql;