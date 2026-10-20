import { randomUUID } from "node:crypto";
import postgres from "postgres";
import * as seed from "../lib/data/seed.ts";

// Seeds the Postgres/Supabase database with the same demo catalogue the
// in-memory layer ships, using real UUIDs (the seed file uses readable ids for
// the memory layer). Run after migrate: node scripts/seed.ts
// Requires DATABASE_URL.

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const sql = postgres(url, { max: 1, prepare: false });

const catMap = new Map<string, string>();
const prodMap = new Map<string, string>();
const distMap = new Map<string, string>();

function stockStatus(stock: number, low: number) {
  if (stock <= 0) return "out_of_stock";
  if (stock <= low) return "low_stock";
  return "in_stock";
}

async function main() {
  console.log("Seeding…");

  for (const c of seed.categories) {
    const id = randomUUID();
    catMap.set(c.id, id);
    await sql`insert into categories (id, slug, name_bn, display_order, is_active)
      values (${id}, ${c.slug}, ${c.name}, ${c.displayOrder}, ${c.isActive})
      on conflict (slug) do nothing`;
  }

  for (const p of seed.products) {
    const id = randomUUID();
    prodMap.set(p.id, id);
    await sql`insert into products
      (id, category_id, slug, name_bn, tagline_bn, description_bn, price_poisha, compare_poisha,
       stock, low_stock_at, stock_status, is_featured, is_flash_deal, flash_ends_at,
       benefits, box_contents, rating_avg, review_count, is_active)
      values (
        ${id}, ${catMap.get(p.categoryId)!}, ${p.slug}, ${p.name}, ${p.tagline ?? null}, ${p.description},
        ${p.price}, ${p.comparePrice ?? null}, ${p.stock}, ${p.lowStockAt},
        ${stockStatus(p.stock, p.lowStockAt)}, ${p.isFeatured}, ${p.isFlashDeal},
        ${p.flashEndsAt ?? null}, ${sql.json(p.benefits)}, ${sql.json(p.boxContents)},
        ${String(p.ratingAvg)}, ${p.reviewCount}, ${p.isActive})
      on conflict (slug) do nothing`;
  }

  for (const d of seed.districts) {
    const id = randomUUID();
    distMap.set(d.id, id);
    await sql`insert into districts (id, name_bn, zone, shipping_poisha, eta_min_days, eta_max_days, is_active)
      values (${id}, ${d.name}, ${d.zone}, ${d.shippingFee}, ${d.etaMinDays}, ${d.etaMaxDays}, ${d.isActive})
      on conflict (name_bn) do nothing`;
  }

  for (const c of seed.coupons) {
    await sql`insert into coupons (id, code, type, value, min_order_poisha, max_uses, used_count, is_active)
      values (${randomUUID()}, ${c.code}, ${c.type}, ${c.value}, ${c.minOrder}, ${c.maxUses ?? null}, ${c.usedCount}, ${c.isActive})
      on conflict (code) do nothing`;
  }

  for (const b of seed.blogPosts) {
    await sql`insert into blog_posts (id, slug, title_bn, excerpt_bn, body_bn, is_published, published_at)
      values (${randomUUID()}, ${b.slug}, ${b.title}, ${b.excerpt}, ${b.body}, true, ${b.publishedAt})
      on conflict (slug) do nothing`;
  }

  for (const r of seed.reviews) {
    await sql`insert into reviews (id, product_id, author_name, city_bn, rating, body_bn, is_verified)
      values (${randomUUID()}, ${prodMap.get(r.productId)!}, ${r.authorName}, ${r.city ?? null}, ${r.rating}, ${r.body}, ${r.isVerified})`;
  }

  const settings = seed.siteSettings;
  const rows: [string, unknown][] = [
    ["store", settings],
    ["free_delivery_threshold", settings.freeDeliveryThreshold],
  ];
  for (const [key, value] of rows) {
    await sql`insert into site_settings (key, value) values (${key}, ${sql.json(value as never)})
      on conflict (key) do update set value = excluded.value, updated_at = now()`;
  }

  console.log("Done.");
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
