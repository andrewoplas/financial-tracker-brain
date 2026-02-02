# 🔐 Supabase Auth Configuration

## Quick Setup Steps:

### 1. **Configure Auth Settings**
Go to your Supabase project: https://supabase.com/dashboard/project/nbssibquqrkwuyhxzbyg

Navigate to **Authentication → Settings**:

### 2. **Email Authentication**
- ✅ **Enable email provider** (should be enabled by default)
- ✅ **Confirm email** = ON (users need to verify email)
- ✅ **Email confirmation** template looks good

### 3. **Site URL Configuration**  
In **Authentication → URL Configuration**:
- **Site URL:** `http://localhost:3001` (for development)
- **Redirect URLs:** Add `http://localhost:3001` (for auth redirects)

### 4. **Test the Flow**
1. Open http://localhost:3001
2. Click "Sign Up"  
3. Enter email + password
4. Check email for verification link
5. After verification, sign in
6. Should see dashboard with 3 default wallets created!

### 5. **For Production Later**
When deploying to Vercel:
- Update Site URL to your Vercel domain
- Add redirect URLs for production domain

---

**The authentication system is fully ready! 🚀**

Key features:
- ✅ Email + password signup/signin  
- ✅ Email verification required
- ✅ User-specific data isolation via RLS
- ✅ Auto-creates default wallets for new users
- ✅ Secure API with user context
- ✅ Sign out functionality