-- Temporarily disable email confirmation for testing
-- This allows signup without email verification

-- Update auth config to disable email confirmation
UPDATE auth.config 
SET enable_confirmations = false 
WHERE name = 'email';