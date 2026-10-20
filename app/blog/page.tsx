import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/data";
import { toBengaliDigits } from "@/lib/money";

export const metadata: Metadata = { title: "ব্লগ" };

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-xl font-bold">ব্লগ</h1>
      <p className="mt-1 text-sm text-text-muted">ঘর সাজানোর টিপস, আইডিয়া ও গাইড।</p>
      <ul className="mt-6 divide-y divide-border">
        {posts.map((p) => (
          <li key={p.id} className="py-5">
            <p className="text-xs text-text-muted">{toBengaliDigits(p.publishedAt)}</p>
            <h2 className="mt-1 text-lg font-semibold">
              <Link href={`/blog/${p.slug}`} className="hover:text-accent">
                {p.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-text-muted">{p.excerpt}</p>
            <Link href={`/blog/${p.slug}`} className="mt-2 inline-block text-sm font-medium text-accent">
              পুরো লেখা পড়ুন
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
