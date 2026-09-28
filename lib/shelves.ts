import { Product } from "@/types/product";

/**
 * Vitrines da loja (home e /produtos?secao=...). ESTA é a única fonte de verdade
 * de "em qual vitrine este produto aparece": a home, a página /produtos e a
 * prévia do admin usam a mesma regra, então nunca mais divergem.
 *
 * As vitrines são calculadas a partir de 3 coisas que já existem no cadastro:
 *  - Público (masculino / feminino / unissex / infantil)
 *  - Checkbox "Destaque"
 *  - Checkbox "Óculos esportivo" (Sport Vision)
 * Um produto pode aparecer em várias vitrines ao mesmo tempo — "Unissex" entra
 * em masculino E feminino, e Destaque / Esportivo são somados a isso.
 */
export type ShelfKey = "destaque" | "sport-vision" | "feminino" | "masculino" | "infantil";

export const SHELF_KEYS: ShelfKey[] = ["destaque", "sport-vision", "feminino", "masculino", "infantil"];

export const SHELF_LABELS: Record<ShelfKey, string> = {
  destaque: "Óculos em destaque",
  "sport-vision": "Óculos Sport Vision",
  feminino: "Óculos de sol feminino",
  masculino: "Óculos de sol masculino",
  infantil: "Óculos de sol infantil",
};

type ShelfInput = Pick<Product, "featured" | "sportivo" | "gender">;

export function isShelfKey(value: string | undefined | null): value is ShelfKey {
  return SHELF_KEYS.includes(value as ShelfKey);
}

export function productInShelf(product: ShelfInput, shelf: ShelfKey): boolean {
  const gender = product.gender || "unissex";
  switch (shelf) {
    case "destaque":
      return Boolean(product.featured);
    case "sport-vision":
      return Boolean(product.sportivo);
    case "feminino":
      return gender === "feminino" || gender === "unissex";
    case "masculino":
      return gender === "masculino" || gender === "unissex";
    case "infantil":
      return gender === "infantil";
  }
}

export function shelvesOfProduct(product: ShelfInput): ShelfKey[] {
  return SHELF_KEYS.filter((shelf) => productInShelf(product, shelf));
}

/**
 * Ordem dos óculos dentro de cada vitrine da HOME. Quem tem posição fixa
 * (campo "Posição na home" no admin, por vitrine) vem primeiro, na ordem
 * 1, 2, 3...; os demais vêm depois na ordem original (mais recentes primeiro).
 * A home mostra os 5 primeiros no mobile e os 3 primeiros no desktop.
 */
export function sortShelfProducts<T extends Pick<Product, "shelf_order">>(products: T[], shelf: ShelfKey): T[] {
  const positionOf = (product: T): number => {
    const value = Number(product.shelf_order?.[shelf]);
    return Number.isFinite(value) && value > 0 ? value : Number.POSITIVE_INFINITY;
  };
  return products
    .map((product, index) => ({ product, index, position: positionOf(product) }))
    .sort((a, b) => (a.position === b.position ? a.index - b.index : a.position - b.position))
    .map((entry) => entry.product);
}
