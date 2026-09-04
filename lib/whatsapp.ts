import { CartItem } from "@/types/product";
import { ShippingResult } from "./shipping";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function buildWhatsAppOrderMessage(
  items: CartItem[],
  cep: string,
  shipping: ShippingResult
): string {
  const lines: string[] = [];

  lines.push("Olá! Gostaria de finalizar este pedido na Ótica Líder Eyewear:");
  lines.push("");

  let subtotal = 0;
  for (const item of items) {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    lines.push(
      `• ${item.quantity}x ${item.name} (${item.colorName}) — ${formatBRL(lineTotal)}`
    );
  }

  lines.push("");
  lines.push(`Subtotal: ${formatBRL(subtotal)}`);

  if (cep) {
    lines.push(`CEP de entrega: ${cep}`);
    if (shipping.freeShipping) {
      lines.push(`Frete: Grátis (${shipping.regionLabel})`);
    } else {
      lines.push("Frete: a calcular com vocês");
    }
  }

  lines.push("");
  lines.push("Aguardo o retorno para combinar pagamento e entrega. Obrigado(a)!");

  return lines.join("\n");
}

export function buildWhatsAppLink(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Mensagem pronta para quando o cliente quer encomendar um modelo esgotado
 * (esgotado só naquela cor, ou o produto inteiro esgotado).
 */
export function buildWhatsAppInquiryMessage(product: {
  brand?: string;
  model?: string;
  name: string;
  price: number;
}, options: { colorName?: string; wholeProductSoldOut?: boolean } = {}): string {
  const label = `${product.brand?.trim() ? `${product.brand.trim()} ` : ""}${product.model?.trim() || product.name}`.trim();
  const lines: string[] = [];

  lines.push("Olá! Vi este óculos na Ótica Líder Eyewear e queria fazer um pedido:");
  lines.push("");
  lines.push(`• ${label}${options.colorName ? ` — cor ${options.colorName}` : ""} — ${formatBRL(product.price)}`);
  lines.push("");
  lines.push(
    options.wholeProductSoldOut
      ? "Vi que está esgotado no momento. Vocês têm previsão de reposição ou conseguem separar uma unidade para mim?"
      : "Vi que essa cor está esgotada no momento. Vocês têm previsão de reposição ou têm outra cor parecida?"
  );

  return lines.join("\n");
}
