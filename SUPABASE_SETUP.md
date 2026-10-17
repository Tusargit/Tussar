# TUSSAR Smart Route-Day Booking — setup

This feature uses Supabase for shared order storage and owner-only dashboard access. GitHub Pages remains the static website host. **It will not aggregate real customer orders until the one-time Supabase setup below is completed.** WhatsApp ordering continues even before setup.

## 1. Create a Supabase project
1. Create a project at https://supabase.com/ and keep the database password private.
2. In Project Settings → API, copy the Project URL and the **anon/public** key. Never use the service-role key in website code.
3. Open SQL Editor, paste all of `supabase-schema.sql`, and run it.

## 2. Configure the website
Edit `supabase-config.js`:
- Replace `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE` with the project URL.
- Replace `PASTE_YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE` with the anon/public key.
These values are intended for browser use; Row Level Security policies protect the data.

## 3. Create the owner login
1. In Supabase → Authentication → Users, add an owner user using your email and a strong password.
2. Copy that user's UUID.
3. In SQL Editor, run this with your real UUID and email:
```sql
insert into public.owner_accounts (user_id, email)
values ('YOUR-AUTH-USER-UUID', 'YOUR-OWNER-EMAIL')
on conflict (user_id) do update set email = excluded.email, is_active = true;
```
Do not share the owner password or any service-role key.

## 4. Verify
1. Open the public website's order page and submit a small test order. It will still open WhatsApp; the same request should also be saved to Supabase.
2. Open `owner-dashboard.html`, sign in, and verify the order appears.
3. Confirm route demand groups by customer-entered area, preferred weekday, and distance band. Use the area field as a routing hint, not automatic geospatial routing.
4. Change a test order status and verify it refreshes.

## What the feature does / does not do
- Stores orders centrally so they can be combined across devices/customers.
- Summarises delivery demand by area, weekday, and distance band.
- Keeps customer names, phone numbers, and full addresses visible only to an authenticated owner.
- Lets the owner update request status.
- Does not automatically calculate road distance, promise a delivery date, charge delivery fees, or dispatch a vehicle. Confirm route day and charges manually with the customer.
- Public WhatsApp ordering is not blocked if Supabase is unavailable; inspect the browser console and owner dashboard status for setup errors.
