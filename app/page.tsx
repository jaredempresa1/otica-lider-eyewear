import Link from "next/link";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { Collection, Product } from "@/types/product";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import InstitutionalMessage from "@/components/InstitutionalMessage";
import ProductGrid from "@/components/ProductGrid";
import CollectionTiles from "@/components/CollectionTiles";
import Testimonials from "@/components/Testimonials";

export const revalidate = 60;

export default async function HomePage() {
  let products: Product[] = [];
  let testimonials: Array<{ id: string; author_name: string; content: string }> = [];
  let collections: Collection[] = [];

  if (hasSupabaseConfig) {
    const [{ data: productData }, { data: testimonialData }, { data: collectionData }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase.from("collections").select("*").order("sort_order", { ascending: true }),
    ]);
    products = (productData as Product[]) ?? [];
    testimonials = testimonialData ?? [];
    collections = (collectionData as Collection[]) ?? [];
  }

  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const catalogProducts = products.filter(
    (product) => !featuredProducts.some((featured) => featured.id === product.id)
  );

  return (
    <main>
      <Hero />

      {featuredProducts.length > 0 && (
        <section className="section-shell pb-10 sm:pb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Curadoria Líder</p>
              <h2 className="section-title">Escolhas em destaque</h2>
            </div>
            <Link href="/produtos" className="text-link hidden sm:inline-flex">
              Ver coleção completa <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
        </section>
      )}

      {collections.length > 0 && (
        <section className="section-shell border-t border-brand-ink/10 pb-2 pt-12 sm:pt-16">
          <div className="mb-6">
            <p className="eyebrow">Marcas e coleções</p>
            <h2 className="section-title">Compre por marca ou por estilo</h2>
          </div>
          <CollectionTiles collections={collections} />
        </section>
      )}

      <section className={`section-shell py-12 sm:py-16 ${collections.length === 0 ? "border-t border-brand-ink/10" : ""}`}>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Catálogo completo</p>
            <h2 className="section-title">Encontre seu próximo clássico</h2>
          </div>
          <Link href="/produtos" className="text-link hidden sm:inline-flex">
            Ver todos <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ProductGrid products={catalogProducts.length > 0 ? catalogProducts : products} />
      </section>

      <InstitutionalMessage />
      <TrustBadges />
      <Testimonials testimonials={testimonials} />
    </main>
  );
}
