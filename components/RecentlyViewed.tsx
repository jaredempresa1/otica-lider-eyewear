"use client";

import { useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { Collection, Product } from "@/types/product";
import ProductGrid from "./ProductGrid";

const STORAGE_KEY = "vistos_recentemente";
const MAX_ITEMS = 12;

/** Guarda o produto atual no histórico local do navegador do cliente (mais recente primeiro, sem repetir). */
export function trackRecentlyViewed(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const current: string[] = raw ? JSON.parse(raw) : [];
    const next = [slug, ...current.filter((item) => item !== slug)].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage indisponível (ex.: navegação privada) — ignora silenciosamente.
  }
}

export default function RecentlyViewed({ currentSlug, collections }: { currentSlug: string; collections?: Collection[] }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    let cancelled = false;

    let slugs: string[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const stored: string[] = raw ? JSON.parse(raw) : [];
      slugs = stored.filter((slug) => slug !== currentSlug);
    } catch {
      slugs = [];
    }

    if (slugs.length === 0) {
      setProducts([]);
      return;
    }

    supabase
      .from("products")
      .select("*")
      .in("slug", slugs)
      .then(({ data }) => {
        if (cancelled) return;
        const bySlug = new Map(((data as Product[]) ?? []).map((product) => [product.slug, product]));
        const ordered = slugs
          .map((slug) => bySlug.get(slug))
          .filter((product): product is Product => Boolean(product) && !(product as Product).hidden);
        setProducts(ordered);
      });

    return () => {
      cancelled = true;
    };
  }, [currentSlug]);

  if (products.length === 0) return null;

  return (
    <section className="section-shell border-t border-brand-ink/10 py-10 sm:py-14">
      <div className="mb-6">
        <h2 className="section-title">Vistos recentemente</h2>
      </div>
      <ProductGrid products={products} scroll collections={collections} />
    </section>
  );
}
