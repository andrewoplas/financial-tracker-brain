# Balance Calculation Issues - Analysis & Fix Plan

## Current Problems Identified

### 1. **Critical Bug in `updateWalletBalance` Function**
- Function accepts `newBalance` parameter but is called with `balanceChange` (delta)
- This causes wallet balance to be SET TO the change amount instead of ADDING the change
- Example: Adding $100 expense sets balance to -$100 instead of subtracting $100

### 2. **Manual Balance Management**
- Wallet balances are stored in `wallets.balance` field
- No automatic synchronization with transaction totals
- Prone to inconsistencies and data corruption

### 3. **Missing Real-time Updates**
- Balance calculations happen only on transaction add
- No recalculation when transactions are edited/deleted
- No validation that stored balance matches transaction totals

### 4. **Multiple Dashboard Components**
- `Dashboard.tsx` uses hardcoded data (not connected to database)
- `FundeyDesktopDashboard.tsx` uses real data but relies on potentially incorrect stored balances

## Fix Strategy

### Phase 1: Immediate Critical Bug Fix
1. Fix `updateWalletBalance` function to handle deltas properly
2. Add `calculateWalletBalance` function to compute balance from transactions
3. Update `AddTransactionForm` to use correct balance calculation

### Phase 2: Database-Level Balance Management
1. Create database function to calculate balances from transactions
2. Add triggers to auto-update balances when transactions change
3. Remove manual balance updates from application code

### Phase 3: Validation & Testing
1. Create balance validation utilities
2. Add balance recalculation endpoints
3. Implement comprehensive testing

### Phase 4: Real-time Updates
1. Add real-time balance updates using Supabase subscriptions
2. Ensure UI reflects changes immediately

## Implementation Plan

### Step 1: Fix Critical Bug
- [ ] Create new `adjustWalletBalance` function for delta changes
- [ ] Create `recalculateWalletBalance` function for full recalculation
- [ ] Update `AddTransactionForm` to use correct function
- [ ] Test with actual transactions

### Step 2: Database Functions
- [ ] Create SQL function `calculate_wallet_balance(wallet_id)`
- [ ] Create SQL trigger to auto-update balances on transaction changes
- [ ] Migrate to database-calculated balances

### Step 3: Application Updates
- [ ] Update all components to use calculated balances
- [ ] Add balance validation and correction utilities
- [ ] Connect `Dashboard.tsx` to real data

### Step 4: Testing & Verification
- [ ] Create comprehensive test suite
- [ ] Test edge cases (multiple transactions, transfers, etc.)
- [ ] Verify real-time updates work correctly

## Files to Modify
1. `/src/lib/supabase.ts` - Fix balance functions
2. `/src/components/AddTransactionForm.tsx` - Use correct balance updates
3. `/src/components/Dashboard.tsx` - Connect to real data
4. `/supabase/migrations/` - Add new database functions/triggers
5. New test files for balance validation