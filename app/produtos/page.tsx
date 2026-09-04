import Link from "next/link";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { Collection, Product } from "@/types/product";
import ProductGrid from "@/components/ProductGrid";

export const revalidate = 60;

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: { colecao?: string };
}) {
  const colecao = searchParams?.colecao;
  let products: Product[] = [];
  let activeCollection: Collection | null = null;

  if (hasSupabaseConfig) {
    const [{ data }, collectionResult] = await Promise.all([
      // A "coleção inteira" sempre vem direto da tabela products (1 linha por
      // produto), então mesmo que um óculos esteja em 2 coleções ele nunca
      // aparece duplicado aqui.
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      colecao ? supabase.from("collections").select("*").eq("slug", colecao).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    products = (data as Product[]) ?? [];
    activeCollection = (collectionResult?.data as Collection | null) ?? null;
  }

  const visibleProducts = colecao
    ? products.filter((product) => (product.collection_slugs ?? []).includes(colecao))
    : products;

  return (
    <main className="section-shell py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        {activeCollection ? (
          <>
            <p className="eyebrow">Coleção</p>
            <h1 className="section-title mt-2">{activeCollection.name}</h1>
            <Link href="/produtos" className="text-link mt-4 inline-flex">
              Ver coleção completa <span aria-hidden="true">↗</span>
            </Link>
          </>
        ) : (
          <>
            <p className="eyebrow">A coleção inteira</p>
            <h1 className="section-title mt-2">Óculos de sol para ver e ser visto</h1>
            <p className="mt-3 max-w-xl font-body text-sm leading-6 text-brand-ink/60 sm:text-base">
              Modelos selecionados para acompanhar todos os seus dias — do essencial ao
              mais marcante.
            </p>
          </>
        )}
      </div>
      <ProductGrid products={visibleProducts} />
    </main>
  );
}
