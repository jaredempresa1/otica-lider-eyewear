import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Collection, Product } from "@/types/product";
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

  // Produto oculto (rascunho) não tem página pública.
  if (!product || (product as Product).hidden) return notFound();

  // Usadas pra casar a marca do produto com o logo cadastrado em "Marcas e coleções" no admin.
  const { data: collectionData } = await supabase.from("collections").select("*");
  const collections = (collectionData as Collection[]) ?? [];

  // Outros produtos pra seção "Outros clientes também viram" — só do mesmo formato
  // (redondo, quadrado, aviador...) e do mesmo público (ou unissex, que aparece pros
  // dois), pra recomendação ficar realmente parecida com o que o cliente está vendo.
  const currentFormat = product.specifications?.format?.trim().toLocaleLowerCase("pt-BR") ?? "";
  const currentGender = product.gender || "unissex";

  let relatedProducts: Product[] = [];

  if (currentFormat) {
    const { data: candidateProducts } = await supabase
      .from("products")
      .select("*")
      .neq("slug", params.slug)
      .order("created_at", { ascending: false });

    relatedProducts = ((candidateProducts as Product[]) ?? [])
      .filter((candidate) => {
        if (candidate.hidden) return false;
        const format = candidate.specifications?.format?.trim().toLocaleLowerCase("pt-BR") ?? "";
        if (format !== currentFormat) return false;
        const gender = candidate.gender || "unissex";
        return gender === currentGender || gender === "unissex" || currentGender === "unissex";
      })
      .slice(0, 12);
  }

  return <ProductDetail product={product as Product} relatedProducts={relatedProducts} collections={collections} />;
}
