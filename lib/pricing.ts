/** Calcula a % de desconto (arredondada) a partir do preço atual e do preço anterior.
 * Retorna null quando não há desconto válido (sem preço anterior, ou preço anterior
 * menor/igual ao atual), pra quem consome já saber se deve ou não mostrar o selo. */
export function calculateDiscountPercent(price: number, compareAtPrice: number | null | undefined): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round((1 - price / compareAtPrice) * 100);
}
