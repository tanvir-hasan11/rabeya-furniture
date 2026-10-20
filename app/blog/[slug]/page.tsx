import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/data";
import { toBengaliDigits } from "@/lib/money";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  return { title: post?.title ?? "ব্লগ" };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container-page max-w-2xl py-10">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> ব্লগে ফিরে যান
      </Link>
      <p className="mt-6 text-xs text-text-muted">{toBengaliDigits(post.publishedAt)}</p>
      <h1 className="mt-1 text-2xl font-bold">{post.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-text-muted">{post.body}</p>
    </article>
  );
}
