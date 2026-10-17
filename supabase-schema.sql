-- TUSSAR Smart Route Booking — run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.route_requests (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null,
  phone text not null,
  product text not null check (product in ('250ML','600ML','1L','20L')),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) not null default 0,
  preferred_day text,
  distance_band text not null check (distance_band in ('0-5','5-10','10-20','20-plus')),
  fulfilment text not null check (fulfilment in ('delivery','pickup')),
  area text not null,
  address text not null,
  status text not null default 'new' check (status in ('new','reviewing','route-planned','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.owner_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_active boolean not null default true
);

alter table public.route_requests enable row level security;
alter table public.owner_accounts enable row level security;

drop policy if exists "Public can submit route requests" on public.route_requests;
create policy "Public can submit route requests"
  on public.route_requests for insert to anon, authenticated
  with check (
    length(trim(customer_name)) between 2 and 100
    and length(trim(phone)) between 7 and 25
    and length(trim(area)) between 2 and 120
    and length(trim(address)) between 5 and 1000
  );

drop policy if exists "Owners can read route requests" on public.route_requests;
create policy "Owners can read route requests"
  on public.route_requests for select to authenticated
  using (exists (
    select 1 from public.owner_accounts oa
    where oa.user_id = auth.uid() and oa.is_active = true
  ));

drop policy if exists "Owners can update route requests" on public.route_requests;
create policy "Owners can update route requests"
  on public.route_requests for update to authenticated
  using (exists (
    select 1 from public.owner_accounts oa
    where oa.user_id = auth.uid() and oa.is_active = true
  ))
  with check (exists (
    select 1 from public.owner_accounts oa
    where oa.user_id = auth.uid() and oa.is_active = true
  ));

drop policy if exists "Owners can read their own owner record" on public.owner_accounts;
create policy "Owners can read their own owner record"
  on public.owner_accounts for select to authenticated
  using (user_id = auth.uid());

create or replace function public.get_route_demand()
returns table (
  preferred_day text,
  area text,
  distance_band text,
  order_count bigint,
  total_units bigint,
  estimated_subtotal numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(nullif(trim(rr.preferred_day), ''), 'No preference') as preferred_day,
    rr.area,
    rr.distance_band,
    count(*) as order_count,
    sum(rr.quantity)::bigint as total_units,
    sum(rr.subtotal)::numeric as estimated_subtotal
  from public.route_requests rr
  where rr.fulfilment = 'delivery'
    and rr.status not in ('cancelled')
    and rr.created_at >= now() - interval '45 days'
  group by 1,2,3
  order by count(*) desc, rr.area asc;
$$;

revoke all on function public.get_route_demand() from public;
grant execute on function public.get_route_demand() to anon, authenticated;

grant insert on public.route_requests to anon, authenticated;
grant select, update on public.route_requests to authenticated;
grant select on public.owner_accounts to authenticated;

-- After creating your owner account in Supabase Authentication, run this once
-- with your real auth user UUID and owner email:
-- insert into public.owner_accounts (user_id, email)
-- values ('YOUR-AUTH-USER-UUID', 'YOUR-OWNER-EMAIL')
-- on conflict (user_id) do update set email = excluded.email, is_active = true;
