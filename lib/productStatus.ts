import { Product, ProductColor, ProductGender } from "@/types/product";

const GENDER_LABELS: Record<ProductGender, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  unissex: "Unissex",
  infantil: "Infantil",
};

export function genderLabel(gender?: string): string {
  return GENDER_LABELS[(gender as ProductGender) ?? "unissex"] ?? GENDER_LABELS.unissex;
}

/**
 * Um produto é considerado totalmente esgotado quando:
 * - foi marcado manualmente como esgotado (product.sold_out), ou
 * - o estoque geral chegou a zero, ou
 * - ele tem cores cadastradas e TODAS elas estão marcadas como esgotadas.
 */
export function isProductSoldOut(product: Pick<Product, "sold_out" | "stock" | "colors">): boolean {
  if (product.sold_out) return true;
  if ((product.stock ?? 0) <= 0) return true;
  if (product.colors && product.colors.length > 0 && product.colors.every((color) => color.sold_out)) return true;
  return false;
}

export function isColorSoldOut(color?: ProductColor): boolean {
  return Boolean(color?.sold_out);
}

/**
 * Esgotado "de verdade" para fins de vitrine: produto sob encomenda nunca conta
 * como esgotado (ele sempre pode ser pedido), mesmo com estoque zerado.
 */
export function isSoldOutForShelf(product: Pick<Product, "sold_out" | "stock" | "colors" | "made_to_order">): boolean {
  return !product.made_to_order && isProductSoldOut(product);
}

/** Joga os esgotados para o fim da lista, mantendo a ordem original dentro de cada grupo. */
export function sortSoldOutLast<T extends Pick<Product, "sold_out" | "stock" | "colors" | "made_to_order">>(products: T[]): T[] {
  return [...products].sort((a, b) => Number(isSoldOutForShelf(a)) - Number(isSoldOutForShelf(b)));
}

/**
 * Formata o conteúdo da embalagem para a página do produto: troca vírgulas por "+"
 * e "estojo" por "case", sem depender de como o texto foi digitado no admin.
 * Ex.: "Óculos, Flanela, Estojo" -> "Óculos + Flanela + case".
 */
export function formatPackageContents(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  return trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/estojo/gi, "case"))
    .join(" + ");
}
