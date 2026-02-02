# Update .env.local with your new Supabase credentials

Replace the values in `.env.local`:

```bash
# Replace with your NEW project values
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-NEW-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key-here
```

Then test the connection:
```bash
node test-supabase.js
```