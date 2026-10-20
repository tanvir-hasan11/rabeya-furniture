-- Rabeya Furniture — schema (rebuild of Sicily's storefront features)
-- Postgres / Supabase. Money is integer poisha (1 BDT = 100 poisha), currency = BDT.
-- Access model: Supabase Row Level Security ON. Public storefront tables are
-- anon-readable. Orders/reviews/coupons are NOT directly writable by anon;
-- all writes go through Next.js server actions / route handlers that validate
-- and use the service role. Order lookup is an RPC, never a row read.

create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists pg_trgm;       -- product name search

-- enums ---------------------------------------------------------------------
create type stock_status as enum ('in_stock', 'low_stock', 'out_of_stock');
create type payment_method as enum ('cod', 'online');
create type payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');
create type order_status as enum ('pending', 'confirmed', 'shipped',
                                  'delivered', 'cancelled', 'returned');
create type order_source as enum ('cart', 'direct');
create type coupon_type as enum ('percent', 'fixed');
create type delivery_zone as enum ('inside_dhaka', 'outside_dhaka');

-- customers ------------------------------------------------------------------
-- Mirrors auth.users; created on first login. Accounts are OPTIONAL — guests
-- order without one, so almost every order column is denormalised on `orders`.
create table customers (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- catalogue ------------------------------------------------------------------
create table categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,          -- flower-tub | tree-plant | wall-stand
  name_bn       text not null,
  image_path    text,
  display_order int  not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table products (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references categories(id) on delete restrict,
  slug             text not null unique,        -- /p/:slug  (SEO)
  name_bn          text not null,
  tagline_bn       text,
  description_bn   text,
  price_poisha     integer not null check (price_poisha >= 0),
  compare_poisha   integer check (compare_poisha is null or compare_poisha >= price_poisha),
  stock            integer not null default 0 check (stock >= 0),
  low_stock_at     integer not null default 5,
  stock_status     stock_status not null default 'in_stock',
  is_featured      boolean not null default false,
  is_flash_deal    boolean not null default false,
  flash_ends_at    timestamptz,                -- countdown; UTC
  benefits         jsonb not null default '[]', -- ["প্রিমিয়াম ফিনিশ", ...]
  box_contents     jsonb not null default '[]', -- [{title, subtitle}]
  rating_avg       numeric(2,1) not null default 0 check (rating_avg between 0 and 5),
  review_count     integer not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint flash_needs_end check (not is_flash_deal or flash_ends_at is not null)
);
create index on products (category_id);
create index on products (is_active, created_at desc);
create index on products (is_featured) where is_active;
create index on products (is_flash_deal) where is_flash_deal;
create index on products using gin (name_bn gin_trgm_ops);   -- search

create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt_bn      text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index on product_images (product_id, sort_order);

-- reviews --------------------------------------------------------------------
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null, -- null = guest
  author_name text not null,
  city_bn     text,
  rating      smallint not null check (rating between 1 and 5),
  body_bn     text not null,
  is_verified boolean not null default false,   -- bought it?
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);
create index on reviews (product_id, created_at desc) where is_visible;

-- delivery -------------------------------------------------------------------
create table districts (
  id           uuid primary key default gen_random_uuid(),
  name_bn      text not null unique,
  zone         delivery_zone not null,
  shipping_poisha integer not null check (shipping_poisha >= 0),
  eta_min_days integer not null default 1,
  eta_max_days integer not null default 4,
  is_active    boolean not null default true
);
create index on districts (zone) where is_active;

-- coupons --------------------------------------------------------------------
-- Not anon-readable. Validated through a server action.
create table coupons (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,           -- WELCOME10
  type          coupon_type not null,
  value         integer not null check (value > 0),  -- percent points or poisha
  min_order_poisha integer not null default 0,
  max_uses      integer,
  used_count    integer not null default 0,
  active_from   timestamptz,
  active_to     timestamptz,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint uses_within_limit check (max_uses is null or used_count <= max_uses)
);

-- orders ---------------------------------------------------------------------
create table orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique,          -- human-facing, e.g. RF-20261018-0007
  customer_id    uuid references customers(id) on delete set null,  -- null = guest
  customer_name  text not null,
  phone          text not null check (phone ~ '^01[3-9][0-9]{8}$'),  -- BD mobile
  district_id    uuid not null references districts(id) on delete restrict,
  address        text not null,
  payment_method payment_method not null default 'cod',
  payment_status payment_status not null default 'unpaid',
  currency       text not null default 'BDT',
  payment_ref    text unique,                   -- gateway txn id (SSLCommerz IPN)
  status         order_status not null default 'pending',
  source         order_source not null default 'cart',
  subtotal_poisha  integer not null check (subtotal_poisha >= 0),
  shipping_poisha  integer not null check (shipping_poisha >= 0),
  discount_poisha  integer not null default 0 check (discount_poisha >= 0),
  total_poisha     integer not null check (total_poisha >= 0),
  coupon_id      uuid references coupons(id) on delete set null,
  coupon_code    text,
  note           text,
  idempotency_key text unique,                  -- guards double-submit
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint total_maths check (
    total_poisha = subtotal_poisha + shipping_poisha - discount_poisha
  )
);
create index on orders (customer_id);
create index on orders (phone, created_at desc);      -- track-order lookup
create index on orders (status, created_at desc);
create index on orders (order_number);

create table order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  product_id     uuid references products(id) on delete set null,
  name_bn        text not null,                 -- snapshot at purchase time
  unit_price_poisha integer not null check (unit_price_poisha >= 0),
  qty            integer not null check (qty > 0),
  line_total_poisha integer not null check (line_total_poisha >= 0),
  created_at     timestamptz not null default now(),
  constraint line_maths check (line_total_poisha = unit_price_poisha * qty)
);
create index on order_items (order_id);
create index on order_items (product_id);

create table order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  status     order_status not null,
  note_bn    text,
  created_at timestamptz not null default now()
);
create index on order_status_history (order_id, created_at);

-- wishlist -------------------------------------------------------------------
-- Guests keep a local copy; logged-in users sync here.
create table wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (customer_id, product_id)
);
create index on wishlist_items (customer_id, created_at desc);

-- content --------------------------------------------------------------------
create table blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title_bn     text not null,
  excerpt_bn   text,
  body_bn      text,
  cover_path   text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on blog_posts (is_published, published_at desc);

create table site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- access rules (Supabase RLS) -------------------------------------------------
alter table customers           enable row level security;
alter table categories          enable row level security;
alter table products            enable row level security;
alter table product_images      enable row level security;
alter table reviews             enable row level security;
alter table districts           enable row level security;
alter table coupons             enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table order_status_history enable row level security;
alter table wishlist_items      enable row level security;
alter table blog_posts          enable row level security;
alter table site_settings       enable row level security;

-- public catalogue & content: anyone may read
create policy pub_read_categories   on categories     for select using (is_active);
create policy pub_read_products     on products       for select using (is_active);
create policy pub_read_images       on product_images for select using (true);
create policy pub_read_districts    on districts      for select using (is_active);
create policy pub_read_reviews      on reviews        for select using (is_visible);
create policy pub_read_blog         on blog_posts     for select using (is_published);
create policy pub_read_settings     on site_settings  for select using (true);

-- customers manage only their own row; their own wishlist
create policy own_customer         on customers      for all
  using (id = auth.uid()) with check (id = auth.uid());
create policy own_wishlist         on wishlist_items for all
  using (customer_id = auth.uid()) with check (customer_id = auth.uid());
-- an owner may read their own orders; guests read via RPC only
create policy own_orders_read      on orders         for select
  using (customer_id = auth.uid());

-- coupons: no anon access (validated server-side)
-- orders/order_items/order_status_history: writes only via service-role server
--   actions; no anon insert policy. Order tracking uses the RPC below.

-- guest order tracking: SECURITY DEFINER, exposes only a safe projection,
-- requires BOTH order number and phone to match.
create or replace function track_order(p_order_number text, p_phone text)
returns table (
  order_number text, status order_status, total_poisha integer, created_at timestamptz
)
language sql security definer set search_path = public as $$
  select o.order_number, o.status, o.total_poisha, o.created_at
  from orders o
  where o.order_number = p_order_number and o.phone = p_phone
  limit 1;
$$;
revoke all on function track_order(text, text) from public;
grant execute on function track_order(text, text) to anon, authenticated;
