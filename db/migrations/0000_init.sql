-- 0000_init.sql — Rabeya Furniture
-- Postgres / Supabase. Money is integer poisha, currency BDT. Times are timestamptz.
-- Re-runnable: enums guarded, tables/indexes use IF NOT EXISTS.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$ begin
  create type stock_status as enum ('in_stock','low_stock','out_of_stock');
exception when duplicate_object then null; end $$;
do $$ begin
  create type payment_method as enum ('cod','online');
exception when duplicate_object then null; end $$;
do $$ begin
  create type payment_status as enum ('unpaid','paid','refunded','failed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type order_status as enum ('pending','confirmed','shipped','delivered','cancelled','returned');
exception when duplicate_object then null; end $$;
do $$ begin
  create type order_source as enum ('cart','direct');
exception when duplicate_object then null; end $$;
do $$ begin
  create type coupon_type as enum ('percent','fixed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type delivery_zone as enum ('inside_dhaka','outside_dhaka');
exception when duplicate_object then null; end $$;

create table if not exists customers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_bn text not null,
  image_path text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  slug text not null unique,
  name_bn text not null,
  tagline_bn text,
  description_bn text,
  price_poisha integer not null check (price_poisha >= 0),
  compare_poisha integer check (compare_poisha is null or compare_poisha >= price_poisha),
  stock integer not null default 0 check (stock >= 0),
  low_stock_at integer not null default 5,
  stock_status stock_status not null default 'in_stock',
  is_featured boolean not null default false,
  is_flash_deal boolean not null default false,
  flash_ends_at timestamptz,
  benefits jsonb not null default '[]',
  box_contents jsonb not null default '[]',
  rating_avg numeric(2,1) not null default 0 check (rating_avg between 0 and 5),
  review_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint flash_needs_end check (not is_flash_deal or flash_ends_at is not null)
);
create index if not exists products_category_id_idx on products (category_id);
create index if not exists products_active_idx on products (is_active, created_at desc);
create index if not exists products_name_trgm_idx on products using gin (name_bn gin_trgm_ops);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt_bn text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on product_images (product_id, sort_order);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  author_name text not null,
  city_bn text,
  rating smallint not null check (rating between 1 and 5),
  body_bn text not null,
  is_verified boolean not null default false,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on reviews (product_id, created_at desc);

create table if not exists districts (
  id uuid primary key default gen_random_uuid(),
  name_bn text not null unique,
  zone delivery_zone not null,
  shipping_poisha integer not null check (shipping_poisha >= 0),
  eta_min_days integer not null default 1,
  eta_max_days integer not null default 4,
  is_active boolean not null default true
);

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null,
  value integer not null check (value > 0),
  min_order_poisha integer not null default 0,
  max_uses integer,
  used_count integer not null default 0,
  active_from timestamptz,
  active_to timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uses_within_limit check (max_uses is null or used_count <= max_uses)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  phone text not null check (phone ~ '^01[3-9][0-9]{8}$'),
  district_id uuid not null references districts(id) on delete restrict,
  address text not null,
  payment_method payment_method not null default 'cod',
  payment_status payment_status not null default 'unpaid',
  currency text not null default 'BDT',
  payment_ref text unique,
  status order_status not null default 'pending',
  source order_source not null default 'cart',
  subtotal_poisha integer not null check (subtotal_poisha >= 0),
  shipping_poisha integer not null check (shipping_poisha >= 0),
  discount_poisha integer not null default 0 check (discount_poisha >= 0),
  total_poisha integer not null check (total_poisha >= 0),
  coupon_id uuid references coupons(id) on delete set null,
  coupon_code text,
  note text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint total_maths check (total_poisha = subtotal_poisha + shipping_poisha - discount_poisha)
);
create index if not exists orders_phone_idx on orders (phone, created_at desc);
create index if not exists orders_status_idx on orders (status, created_at desc);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name_bn text not null,
  unit_price_poisha integer not null check (unit_price_poisha >= 0),
  qty integer not null check (qty > 0),
  line_total_poisha integer not null check (line_total_poisha >= 0),
  created_at timestamptz not null default now(),
  constraint line_maths check (line_total_poisha = unit_price_poisha * qty)
);
create index if not exists order_items_order_idx on order_items (order_id);

create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  note_bn text,
  created_at timestamptz not null default now()
);
create index if not exists order_status_history_order_idx on order_status_history (order_id, created_at);

create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_bn text not null,
  excerpt_bn text,
  body_bn text,
  cover_path text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- dead-letter log for background jobs
create table if not exists job_events (
  id uuid primary key default gen_random_uuid(),
  job text not null,
  ref text,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

-- human-facing order numbers: RF-YYYYMMDD-NNNN
create sequence if not exists order_number_seq;

-- access rules ------------------------------------------------------------
alter table customers enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table reviews enable row level security;
alter table districts enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table wishlist_items enable row level security;
alter table blog_posts enable row level security;
alter table site_settings enable row level security;

do $$ begin
  create policy pub_read_categories on categories for select using (is_active);
  create policy pub_read_products on products for select using (is_active);
  create policy pub_read_images on product_images for select using (true);
  create policy pub_read_districts on districts for select using (is_active);
  create policy pub_read_reviews on reviews for select using (is_visible);
  create policy pub_read_blog on blog_posts for select using (is_published);
  create policy pub_read_settings on site_settings for select using (true);
  create policy own_customer on customers for all using (id = auth.uid()) with check (id = auth.uid());
  create policy own_wishlist on wishlist_items for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
  create policy own_orders_read on orders for select using (customer_id = auth.uid());
exception when duplicate_object then null; end $$;

-- guest order tracking RPC: safe projection, requires order number AND phone
create or replace function track_order(p_order_number text, p_phone text)
returns table (order_number text, status order_status, total_poisha integer, created_at timestamptz)
language sql security definer set search_path = public as $$
  select o.order_number, o.status, o.total_poisha, o.created_at
  from orders o
  where o.order_number = p_order_number and o.phone = p_phone
  limit 1;
$$;
revoke all on function track_order(text, text) from public;
grant execute on function track_order(text, text) to anon, authenticated;
