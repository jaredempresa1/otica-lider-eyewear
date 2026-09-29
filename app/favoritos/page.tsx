"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { useWishlist } from "@/components/WishlistContext";
import ProductCard from "@/components/ProductCard";
import { Collection, Product } from "@/types/product";

export default function FavoritosPage() {
  const { ids, hydrated } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasSupabaseConfig || ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      supabase.from("products").select("*").in("id", ids),
      supabase.from("collections").select("*").order("sort_order", { ascending: true }),
    ]).then(([{ data: productData }, { data: collectionData }]) => {
      setProducts((productData as Product[]) ?? []);
      setCollections((collectionData as Collection[]) ?? []);
      setLoading(false);
    });
  }, [hydrated, ids.join(",")]);

  return (
    <main className="section-shell py-10 sm:py-16">
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-brand-ink sm:text-4xl">Meus favoritos</h1>

      {!loading && hydrated && products.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-4 py-10 text-center">
          <Heart size={40} strokeWidth={1.3} className="text-brand-ink/25" />
          <p className="font-body text-sm text-brand-ink/60">Você ainda não favoritou nenhum óculos.</p>
          <Link href="/produtos" className="btn-brand px-6 py-3 text-[11px]">
            Ver coleção completa
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} collections={collections} />
          ))}
        </div>
      )}
    </main>
  );
}
