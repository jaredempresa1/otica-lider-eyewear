import { CartItem } from "@/types/product";
import { ShippingResult } from "./shipping";

export type PaymentSelection = {
  method: "pix" | "card";
  installments: number;
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function paymentDescription(payment: PaymentSelection, total: number): string {
  if (payment.method === "pix") return "Pix à vista";

  const installmentValue = total / payment.installments;
  return `Cartão de crédito — ${payment.installments}x de ${formatBRL(installmentValue)} sem juros`;
}

/** Mesma ideia da acima, mas sem presumir "sem juros": usada quando o total
 * de parcelas já vem do plano de parcelamento cadastrado no produto
 * (product.installments), que pode ter o valor parcelado maior que o preço
 * à vista. */
function madeToOrderPaymentDescription(payment: PaymentSelection, cashPrice: number, cardTotal: number): string {
  if (payment.method === "pix") return `Pix à vista — ${formatBRL(cashPrice)}`;

  const installmentValue = cardTotal / payment.installments;
  return `Cartão de crédito — ${payment.installments}x de ${formatBRL(installmentValue)}`;
}

export function buildWhatsAppOrderMessage(
  items: CartItem[],
  cep: string,
  shipping: ShippingResult,
  payment: PaymentSelection,
  coupon?: { code: string; discount: number },
): string {
  const lines: string[] = [];

  lines.push("Olá! Gostaria de finalizar este pedido na Ótica Líder Eyewear:");
  lines.push("");

  let subtotal = 0;
  for (const item of items) {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    lines.push(
      `• ${item.quantity}x ${item.name} (${item.colorName}) — ${formatBRL(lineTotal)}`,
    );
  }

  lines.push("");
  const discountedSubtotal = Math.max(0, subtotal - (coupon?.discount ?? 0));
  lines.push(`Subtotal: ${formatBRL(subtotal)}`);
  if (coupon?.discount) lines.push(`Cupom ${coupon.code}: -${formatBRL(coupon.discount)}`);
  lines.push(`Total dos produtos: ${formatBRL(discountedSubtotal)}`);
  lines.push(`Forma de pagamento: ${paymentDescription(payment, discountedSubtotal)}`);

	  if (cep) {
	    lines.push(`CEP de entrega: ${cep}`);
	    if (shipping.freeShipping) {
	      lines.push("Frete: Grátis");
	    } else if (shipping.price != null) {
	      lines.push(`Frete: ${formatBRL(shipping.price)}${shipping.deliveryTime ? ` — até ${shipping.deliveryTime} dias úteis` : ""}`);
	    } else {
	      lines.push("Frete: a calcular com vocês");
    }
  }

  lines.push("");
  lines.push("A equipe da Ótica Líder costuma responder em até 1 minuto.");
  lines.push("Aguardo o retorno para confirmar pagamento e entrega. Obrigado(a)!");

  return lines.join("\n");
}

export function buildWhatsAppLink(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Mensagem pronta para produtos marcados como "pedido especial" (sob
 * encomenda) no admin — ex.: um óculos de pouco giro que só é comprado
 * depois que o cliente confirma o pedido. Diferente da mensagem de
 * "esgotado" acima: aqui o produto nem chegou a ter estoque, então o
 * texto já avisa o prazo médio em vez de falar em "reposição".
 */
export function buildWhatsAppMadeToOrderMessage(product: {
  brand?: string;
  model?: string;
  name: string;
  price: number;
}, options: { colorName?: string; leadTime?: string; payment?: PaymentSelection; cardTotal?: number } = {}): string {
  const label = `${product.brand?.trim() ? `${product.brand.trim()} ` : ""}${product.model?.trim() || product.name}`.trim();
  const lines: string[] = [];

  lines.push("Olá! Quero fazer um pedido deste óculos sob encomenda na Ótica Líder Eyewear:");
  lines.push("");
  lines.push(`• ${label}${options.colorName ? ` — cor ${options.colorName}` : ""} — ${formatBRL(product.price)}`);
  if (options.payment) {
    lines.push(`Forma de pagamento: ${madeToOrderPaymentDescription(options.payment, product.price, options.cardTotal ?? product.price)}`);
  }
  if (options.leadTime?.trim()) {
    lines.push("");
    lines.push(`Vi que o prazo médio de entrega é ${options.leadTime.trim()}. Pode confirmar o pedido?`);
  } else {
  lines.push("");
  lines.push("A equipe da Ótica Líder costuma responder em até 1 minuto.");
  lines.push("Pode me confirmar o prazo médio de entrega e fechar o pedido?");
  }

  return lines.join("\n");
}

/**
 * Mensagem enviada pela equipe (aba "Carrinhos abandonados" do admin) para
 * quem deixou o WhatsApp e não fechou a compra. Organizada em blocos (saudação
 * → itens separados → gatilho de escassez/urgência → chamada para ação) em vez
 * do parágrafo único anterior, para ficar mais fácil de ler no celular e soar
 * como um atendimento de verdade, não um disparo automático.
 */
export function buildAbandonedCartMessage(cart: {
  items: { name: string; quantity: number }[];
  total: number;
}): string {
  const lines: string[] = [];

  lines.push("Oi! 👋 Passando aqui da Ótica Líder Eyewear.");
  lines.push("");
  lines.push("Vi que você separou esses óculos mas não finalizou o pedido:");
  lines.push("");
  for (const item of cart.items) {
    lines.push(`• ${item.quantity}x ${item.name}`);
  }
  lines.push("");
  lines.push(`Total da seleção: ${formatBRL(cart.total)}`);
  lines.push("");
  lines.push("Ainda estão reservados aqui pra você, mas o estoque é limitado e outros clientes estão vendo os mesmos modelos 👀");
  lines.push("");
  lines.push("Posso fechar o pedido agora mesmo por aqui e já te passo o prazo de entrega. Consigo te ajudar?");

  return lines.join("\n");
}

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
  lines.push("A equipe da Ótica Líder costuma responder em até 1 minuto.");
  lines.push(
    options.wholeProductSoldOut
      ? "Vi que está esgotado no momento. Vocês têm previsão de reposição ou conseguem separar uma unidade para mim?"
      : "Vi que essa cor está esgotada. Vocês têm previsão de reposição ou outra cor parecida?",
  );

  return lines.join("\n");
}
