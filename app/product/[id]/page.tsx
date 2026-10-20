import { notFound, redirect } from "next/navigation";
import { getProductById } from "@/lib/data";

export default async function ProductIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  redirect(`/p/${product.slug}`);
}
