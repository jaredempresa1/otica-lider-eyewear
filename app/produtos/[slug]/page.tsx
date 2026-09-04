import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Product } from "@/types/product";
import ProductDetail from "@/components/ProductDetail";

export const revalidate = 60;

export default async function ProdutoPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!product) return notFound();

  return <ProductDetail product={product as Product} />;
}
