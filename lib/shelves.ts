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
