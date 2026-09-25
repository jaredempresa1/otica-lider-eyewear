import { Product } from "@/types/product";

// Guarda, no navegador do próprio cliente, os últimos óculos que ele abriu —
// não depende de login nem de backend, então cada aparelho tem sua própria lista.
const STORAGE_KEY = "recentlyViewedProducts";
const MAX_ITEMS = 12;

export function getRecentlyViewed(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product: Product) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed().filter((item) => item.id !== product.id);
    const updated = [product, ...existing].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage pode estar indisponível (modo privado, cookies bloqueados etc.) — ignora silenciosamente.
  }
}
