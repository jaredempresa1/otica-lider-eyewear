import { Collection, Product } from "@/types/product";

export type QuickFilterValue = "menor-preco" | "maior-preco" | "destaques" | "mais-vendidos" | "ofertas";

export const QUICK_FILTERS: { value: QuickFilterValue; label: string }[] = [
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "destaques", label: "Em destaque" },
  { value: "mais-vendidos", label: "Mais vendidos" },
  { value: "ofertas", label: "Ofertas" },
];

export type ProductFilterState = {
  genero: string[];
  marca: string[];
  cor: string[];
  precoMin: number | null;
  precoMax: number | null;
};

export const EMPTY_FILTER_STATE: ProductFilterState = {
  genero: [],
  marca: [],
  cor: [],
  precoMin: null,
  precoMax: null,
};

function parseListParam(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumberParam(value?: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type FilterSearchParams = {
  genero?: string;
  marca?: string;
  cor?: string;
  precoMin?: string;
  precoMax?: string;
};

/** Lê o estado de filtros a partir dos searchParams da URL (gênero, marca, cor, preço). */
export function parseFilterState(searchParams: FilterSearchParams): ProductFilterState {
  return {
    genero: parseListParam(searchParams.genero).filter((value) => value === "masculino" || value === "feminino"),
    marca: parseListParam(searchParams.marca),
    cor: parseListParam(searchParams.cor),
    precoMin: parseNumberParam(searchParams.precoMin),
    precoMax: parseNumberParam(searchParams.precoMax),
  };
}

export function countActiveFilters(state: ProductFilterState, priceBounds?: { min: number; max: number }): number {
  let count = state.genero.length + state.marca.length + state.cor.length;
  if (priceBounds) {
    const minChanged = state.precoMin !== null && state.precoMin > priceBounds.min;
    const maxChanged = state.precoMax !== null && state.precoMax < priceBounds.max;
    if (minChanged || maxChanged) count += 1;
  } else if (state.precoMin !== null || state.precoMax !== null) {
    count += 1;
  }
  return count;
}

/** Um produto "unissex" (ou sem gênero definido) aparece nos dois filtros, masculino e feminino. */
export function productMatchesFilters(product: Product, state: ProductFilterState): boolean {
  if (state.genero.length > 0) {
    const isUnissex = !product.gender || product.gender === "unissex";
    const matchesGender = isUnissex || state.genero.includes(product.gender as string);
    if (!matchesGender) return false;
  }

  if (state.marca.length > 0) {
    const slugs = product.collection_slugs ?? [];
    if (!state.marca.some((slug) => slugs.includes(slug))) return false;
  }

  if (state.cor.length > 0) {
    const colorNames = (product.colors ?? []).map((color) => color.name);
    if (!state.cor.some((name) => colorNames.includes(name))) return false;
  }

  if (state.precoMin !== null && product.price < state.precoMin) return false;
  if (state.precoMax !== null && product.price > state.precoMax) return false;

  return true;
}

export function filterProducts(products: Product[], state: ProductFilterState): Product[] {
  return products.filter((product) => productMatchesFilters(product, state));
}

/** Aplica o filtro rápido: "menor/maior preço" ordenam, os demais recortam a lista. */
export function applyQuickFilter(products: Product[], ordenar: string | null | undefined): Product[] {
  switch (ordenar) {
    case "menor-preco":
      return [...products].sort((a, b) => a.price - b.price);
    case "maior-preco":
      return [...products].sort((a, b) => b.price - a.price);
    case "destaques":
      return products.filter((product) => product.featured);
    case "mais-vendidos":
      return products.filter((product) => product.more_sold);
    case "ofertas":
      return products.filter((product) => product.compare_at_price != null && product.compare_at_price > product.price);
    default:
      return products;
  }
}

export function getColorNames(products: Product[]): string[] {
  const names = new Set<string>();
  products.forEach((product) => (product.colors ?? []).forEach((color) => {
    if (color.name?.trim()) names.add(color.name.trim());
  }));
  return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function getPriceBounds(products: Product[]): { min: number; max: number } {
  if (!products.length) return { min: 0, max: 0 };
  const prices = products.map((product) => product.price);
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}

export function getBrandCollections(products: Product[], collections: Collection[]): Collection[] {
  const usedSlugs = new Set<string>();
  products.forEach((product) => (product.collection_slugs ?? []).forEach((slug) => usedSlugs.add(slug)));
  return collections.filter((collection) => usedSlugs.has(collection.slug));
}
