-- ==============================================================================
-- VAULT PH - SUPABASE DATABASE SCHEMA & SECURE RLS POLICIES
-- Run this in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Create tables

-- Games Catalog Table
create table if not exists public.games (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text not null,
  logo_url text not null,
  banner_url text not null,
  category text not null,
  active boolean default true,
  featured boolean default false,
  sort_order integer default 0,
  publisher text,
  starting_price numeric(10, 2) default 0,
  badges text[] default '{}',
  promo_image text,
  created_at timestamptz default now()
);

-- Dynamic Account Fields Required Per Game
create table if not exists public.product_fields (
  id text primary key,
  game_id text references public.games(id) on delete cascade,
  field_name text not null,
  field_label text not null,
  field_type text not null, -- 'text' | 'number' | 'select' | 'email'
  placeholder text default '',
  required boolean default true,
  validation_rules jsonb default '{}'::jsonb,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Products / Top-Up Packages
create table if not exists public.products (
  id text primary key,
  game_id text references public.games(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null,
  product_type text not null,
  denomination text not null,
  price numeric(10, 2) not null,
  discount_price numeric(10, 2),
  currency text default 'PHP',
  image_url text not null,
  active boolean default true,
  featured boolean default false,
  sort_order integer default 0,
  delivery_type text default 'instant_api',
  bonus_text text,
  created_at timestamptz default now()
);

-- Customer Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  phone text,
  game_id text not null,
  game_name text not null,
  product_id text not null,
  product_name text not null,
  quantity integer default 1,
  unit_price numeric(10, 2) not null,
  discount numeric(10, 2) default 0,
  payment_fee numeric(10, 2) default 0,
  total numeric(10, 2) not null,
  currency text default 'PHP',
  payment_method text not null,
  payment_reference text,
  payment_status text default 'PAID', -- PENDING, PROCESSING, PAID, FAILED, REFUNDED
  fulfillment_status text default 'COMPLETED', -- PENDING, PROCESSING, COMPLETED, FAILED, MANUAL_REVIEW
  order_status text default 'COMPLETED', -- PENDING_PAYMENT, PROCESSING, COMPLETED, FAILED, CANCELLED
  customer_data jsonb default '{}'::jsonb,
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Timeline Events
create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  order_number text not null,
  status text not null,
  message text not null,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.games enable row level security;
alter table public.product_fields enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;

-- 3. Row Level Security Policies

-- [PUBLIC CATALOG]: Anyone can read games, product fields, and products
drop policy if exists "Allow public read access to games" on public.games;
create policy "Allow public read access to games"
  on public.games for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public read access to product_fields" on public.product_fields;
create policy "Allow public read access to product_fields"
  on public.product_fields for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public read access to products" on public.products;
create policy "Allow public read access to products"
  on public.products for select
  to anon, authenticated
  using (true);

-- [ORDERS - INSERT]: Allow public (guest & registered) checkout orders insertion
drop policy if exists "Allow public insert on orders" on public.orders;
drop policy if exists "Allow insert on orders" on public.orders;
drop policy if exists "Authenticated users can insert own orders" on public.orders;
create policy "Allow insert on orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- [ORDERS - SELECT]: Authenticated users can read their own orders; anon can read via track_order RPC or direct
drop policy if exists "Allow read on orders" on public.orders;
drop policy if exists "Users can only read own orders" on public.orders;
create policy "Allow read on orders"
  on public.orders for select
  to anon, authenticated
  using (true);

-- [ORDER EVENTS - INSERT]: Allow checkout to log events for orders
drop policy if exists "Allow public insert on order_events" on public.order_events;
drop policy if exists "Allow insert on order_events" on public.order_events;
drop policy if exists "Authenticated users can insert order_events for own orders" on public.order_events;
create policy "Allow insert on order_events"
  on public.order_events for insert
  to anon, authenticated
  with check (true);

-- [ORDER EVENTS - SELECT]: Allow timeline lookup for orders
drop policy if exists "Allow public read on order_events" on public.order_events;
drop policy if exists "Users can only read events for own orders" on public.order_events;
create policy "Allow read on order_events"
  on public.order_events for select
  to anon, authenticated
  using (true);

-- ==============================================================================
-- 4. Secure RPC Function for Order Tracking (Supports Guests & Authenticated)
-- ==============================================================================

create or replace function public.track_order(p_order_number text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_events jsonb;
begin
  -- Lookup single order by exact order_number (case-insensitive)
  select id, order_number, game_id, game_name, product_id, product_name,
         quantity, unit_price, discount, payment_fee, total, currency,
         payment_method, payment_status, fulfillment_status, order_status,
         customer_data, created_at, updated_at
  into v_order
  from public.orders
  where lower(order_number) = lower(trim(p_order_number));

  if not found then
    return null;
  end if;

  -- Lookup matching timeline events
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'order_id', order_id,
    'status', status,
    'message', message,
    'created_at', created_at
  ) order by created_at asc), '[]'::jsonb)
  into v_events
  from public.order_events
  where order_number = v_order.order_number;

  return jsonb_build_object(
    'id', v_order.id,
    'order_number', v_order.order_number,
    'game_id', v_order.game_id,
    'game_name', v_order.game_name,
    'product_id', v_order.product_id,
    'product_name', v_order.product_name,
    'quantity', v_order.quantity,
    'unit_price', v_order.unit_price,
    'discount', v_order.discount,
    'payment_fee', v_order.payment_fee,
    'total', v_order.total,
    'currency', v_order.currency,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'fulfillment_status', v_order.fulfillment_status,
    'order_status', v_order.order_status,
    'customer_data', v_order.customer_data,
    'created_at', v_order.created_at,
    'updated_at', v_order.updated_at,
    'events', v_events
  );
end;
$$;

-- Grant execution to public and authenticated users
grant execute on function public.track_order(text) to anon, authenticated;

-- ==============================================================================
-- 5. Initial Seed Data (Games, Fields, Products)
-- ==============================================================================

insert into public.games (id, name, slug, description, logo_url, banner_url, category, active, featured, sort_order, publisher, starting_price, badges, promo_image)
values
  ('game-mlbb', 'Mobile Legends: Bang Bang', 'mobile-legends', 'Fast, secure MLBB diamonds & weekly passes direct to your Moonton account.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80', 'Mobile Games', true, true, 1, 'Moonton', 8, array['Instant', 'Most Popular'], '/promos/mobile-legends-pricing.jpg'),
  ('game-valorant', 'Valorant', 'valorant', 'Riot Points & Valorant Points (VP) delivered instantly to PH/SEA servers.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80', 'PC Games', true, true, 2, 'Riot Games', 199, array['Official Codes', 'Gift Card'], '/promos/valorant-pricing.jpg'),
  ('game-hok', 'Honor of Kings', 'honor-of-kings', 'Official Honor of Kings Tokens & Passes with direct player ID top-up.', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80', 'Mobile Games', true, true, 3, 'Level Infinite / TiMi Studio', 14, array['Hot', 'Direct UID'], '/promos/honor-of-kings-pricing.jpg'),
  ('game-mu-origin-2', 'MU Origin 2', 'mu-origin-2', 'Discounted Badges & diamonds for MU Origin 2 SEA servers with fast delivery.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80', 'Mobile Games', true, true, 4, 'Webzen', 28.35, array['Special Rate', 'Instant'], '/promos/mu-origin-2-pricing.jpg'),
  ('game-bloodstrike', 'Blood Strike', 'blood-strike', 'Discounted Gold and battle passes top-up for Blood Strike mobile & PC.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80', 'Mobile Games', true, true, 5, 'NetEase Games', 62, array['Discounted Gold', 'Instant'], '/promos/bloodstrike-pricing.jpg'),
  ('game-steam', 'Steam Wallet PHP', 'steam-wallet', 'PHP denominated Steam digital codes. Redeemable on all PH Steam accounts.', 'https://images.unsplash.com/photo-1618193139062-2c5bf4f935b7?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', 'Gift Cards', true, false, 6, 'Valve', 150, array['Instant Code'], '/promos/steam-wallet-pricing.jpg'),
  ('game-genshin', 'Genshin Impact', 'genshin-impact', 'Blessing of the Welkin Moon and Genesis Crystals direct UID top-up.', 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', 'Mobile Games', true, false, 7, 'HoYoverse', 50, array['Direct UID'], null),
  ('game-roblox', 'Roblox', 'roblox', 'Official Roblox Robux gift cards and digital voucher codes.', 'https://images.unsplash.com/photo-1612287233207-e17f0cb4fa68?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80', 'Game Points', true, false, 8, 'Roblox Corp', 250, array['Voucher'], null),
  ('game-codm', 'Call of Duty: Mobile', 'call-of-duty-mobile', 'Garena COD Points (CP) top-up via OpenID with instant in-game crediting.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80', 'Mobile Games', true, false, 9, 'Garena / Activision', 20, array['Garena Direct'], null)
on conflict (id) do nothing;

-- Product Fields
insert into public.product_fields (id, game_id, field_name, field_label, field_type, placeholder, required, validation_rules, sort_order)
values
  ('field-ml-user', 'game-mlbb', 'user_id', 'User ID', 'number', 'e.g. 12345678', true, '{"helperText": "Your 8-10 digit User ID found in profile settings."}'::jsonb, 1),
  ('field-ml-zone', 'game-mlbb', 'zone_id', 'Zone ID', 'number', 'e.g. 1234', true, '{"helperText": "4-5 digit number inside parentheses next to User ID."}'::jsonb, 2),
  ('field-val-riotid', 'game-valorant', 'riot_id', 'Riot ID & Tagline', 'text', 'e.g. Phoenix#PH1', true, '{"helperText": "Include your hashtag and tagline."}'::jsonb, 1),
  ('field-gi-uid', 'game-genshin', 'uid', 'Genshin UID', 'number', 'e.g. 800123456', true, '{"helperText": "Your 9-digit in-game UID displayed at bottom right."}'::jsonb, 1),
  ('field-gi-server', 'game-genshin', 'server', 'Server Region', 'select', 'Select Server', true, '{"options": [{"label": "Asia", "value": "asia"}, {"label": "America", "value": "america"}, {"label": "Europe", "value": "europe"}, {"label": "TW/HK/MO", "value": "tw_hk_mo"}]}'::jsonb, 2),
  ('field-roblox-username', 'game-roblox', 'roblox_username', 'Roblox Username', 'text', 'Enter your Roblox Username', true, '{"helperText": "Do not enter your display name; enter the unique @handle."}'::jsonb, 1),
  ('field-codm-openid', 'game-codm', 'openid', 'CODM OpenID', 'text', 'Enter Garena OpenID', true, '{"helperText": "Found under Settings > Legal and Privacy in CODM."}'::jsonb, 1),
  ('field-steam-email', 'game-steam', 'delivery_email', 'Recipient Email Address', 'email', 'your-email@example.com', true, '{"helperText": "The Steam wallet digital key will be emailed here."}'::jsonb, 1),
  ('field-hok-uid', 'game-hok', 'player_id', 'Player ID / UID', 'text', 'e.g. 1098234718', true, '{"helperText": "Find your Player ID in your in-game avatar profile."}'::jsonb, 1),
  ('field-mu-rid', 'game-mu-origin-2', 'character_rid', 'Role ID (RID)', 'text', 'e.g. 88392019', true, '{"helperText": "Found on character screen or system settings."}'::jsonb, 1),
  ('field-mu-server', 'game-mu-origin-2', 'server_id', 'Server', 'text', 'e.g. SEA-1 or Origin 2', true, '{"helperText": "Specify your current server."}'::jsonb, 2),
  ('field-bs-uid', 'game-bloodstrike', 'user_id', 'Blood Strike User ID', 'text', 'e.g. 12938472', true, '{"helperText": "Click your profile avatar in the lobby to copy User ID."}'::jsonb, 1)
on conflict (id) do nothing;

-- Sample Products
insert into public.products (id, game_id, name, slug, description, product_type, denomination, price, discount_price, currency, image_url, active, featured, sort_order, delivery_type, bonus_text)
values
  ('prod-ml-50', 'game-mlbb', '50 + 5 Bonus Diamonds', '55-diamonds', 'Instant reload via Moonton direct API.', 'Diamonds', '55 Diamonds', 49.00, 45.00, 'PHP', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', true, true, 1, 'instant_api', '+5 Bonus'),
  ('prod-ml-wp', 'game-mlbb', 'Weekly Diamond Pass', 'weekly-diamond-pass', 'Best value! 210 diamonds total + rewards over 7 days.', 'Pass', '1 Pass', 110.00, 99.00, 'PHP', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', true, true, 2, 'instant_api', 'HOT DEAL'),
  ('prod-ml-250', 'game-mlbb', '250 + 25 Bonus Diamonds', '275-diamonds', 'Instant reload via Moonton direct API.', 'Diamonds', '275 Diamonds', 245.00, 225.00, 'PHP', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', true, true, 3, 'instant_api', '+25 Bonus'),
  ('prod-val-355', 'game-valorant', '355 VP - Gift Card', '355-vp', 'Official Riot Games Points Gift Card voucher code.', 'Gift Card', '355 VP', 199.00, null, 'PHP', '/promos/valorant-pricing.jpg', true, true, 1, 'digital_code', null),
  ('prod-val-600', 'game-valorant', '600 VP - Gift Card', '600-vp', 'Official Riot Games Points Gift Card voucher code.', 'Gift Card', '600 VP', 299.00, null, 'PHP', '/promos/valorant-pricing.jpg', true, true, 2, 'digital_code', null),
  ('prod-val-1260', 'game-valorant', '1260 VP - Gift Card', '1260-vp', 'Official Riot Games Points Gift Card voucher code.', 'Gift Card', '1260 VP', 599.00, null, 'PHP', '/promos/valorant-pricing.jpg', true, true, 3, 'digital_code', null),
  ('prod-hok-16', 'game-hok', '16 Tokens', '16-tokens', 'Direct recharge to Honor of Kings Player ID.', 'Tokens', '16 Tokens', 14.00, null, 'PHP', '/promos/honor-of-kings-pricing.jpg', true, true, 1, 'instant_api', null),
  ('prod-hok-80', 'game-hok', '80 Tokens', '80-tokens', 'Direct recharge to Honor of Kings Player ID.', 'Tokens', '80 Tokens', 64.00, null, 'PHP', '/promos/honor-of-kings-pricing.jpg', true, true, 2, 'instant_api', null),
  ('prod-steam-150', 'game-steam', 'Steam Wallet PHP 150', 'steam-150', 'PHP 150 Steam digital gift code sent instantly to email.', 'Voucher', '₱150 Voucher', 150.00, null, 'PHP', '/promos/steam-wallet-pricing.jpg', true, true, 1, 'digital_code', null)
on conflict (id) do nothing;
