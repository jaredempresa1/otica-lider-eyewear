/**
 * Regras de frete: frete grátis na área definida e cotação automática para
 * os demais destinos através da API interna do Melhor Envio.
 */

import { getCepInfo } from "./geocode";
import { FREE_SHIPPING_ZONE, isInsideZone } from "./deliveryZone";
import { FREE_SHIPPING_CEP_OVERRIDES } from "./freeShippingOverrides";
import { CartItem } from "@/types/product";

const EXCLUDED_CITIES = ["lucena", "santa rita", "conde"];

/** A partir desse valor de carrinho, o frete sai grátis pra qualquer lugar do Brasil,
 * não só dentro da área geográfica de frete grátis (FREE_SHIPPING_ZONE). */
export const NATIONAL_FREE_SHIPPING_MINIMUM = 500;

function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function normalizeCityName(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isExcludedCity(city: string | null): boolean {
  if (!city) return false;
  return EXCLUDED_CITIES.includes(normalizeCityName(city));
}

export function cleanCep(cep: string): string {
  return cep.replace(/\D/g, "");
}

export function isValidCep(cep: string): boolean {
  return cleanCep(cep).length === 8;
}

export type ShippingOption = {
  id: number | null;
  name: string;
  price: number;
  deliveryTime: number;
};

export type ShippingResult = {
  valid: boolean;
  freeShipping: boolean;
  regionLabel: string | null;
  source: "geo" | "fallback" | "api" | "invalid";
  price?: number;
  deliveryTime?: number;
  serviceName?: string;
  options?: ShippingOption[];
  error?: string;
};

// ⚠️ Removido em 07/2026: este arquivo tinha uma tabela de faixas de CEP
// (FALLBACK_RANGES) que concedia frete grátis para QUALQUER CEP de João
// Pessoa, Bayeux ou Cabedelo inteiras sempre que a geocodificação por
// coordenadas falhasse (API fora do ar, CEP sem coordenadas cadastradas,
// erro de rede). Isso ignorava por completo o polígono da área de frete
// grátis (FREE_SHIPPING_ZONE) — ou seja, clientes de bairros bem fora da
// área real podiam ganhar frete grátis por acaso, sempre que a consulta de
// coordenadas falhasse. Como a regra é "só frete grátis para quem está
// REALMENTE dentro da área", removemos essa concessão automática: se não
// dá pra confirmar a localização exata do CEP, o site cai para a cotação
// paga (Melhor Envio) em vez de presumir frete grátis.

async function quoteOutsideFreeArea(cep: string, items: CartItem[]): Promise<ShippingResult> {
  try {
    const response = await fetch("/api/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postalCode: cep,
        items: items.map((item) => ({ id: item.productId, price: item.price, quantity: item.quantity })),
      }),
    });
    const data = (await response.json()) as {
      quote?: ShippingOption;
      options?: ShippingOption[];
      error?: string;
    };

    if (!response.ok || !data.quote) {
      return { valid: true, freeShipping: false, regionLabel: null, source: "api", error: data.error };
    }

    return {
      valid: true,
      freeShipping: false,
      regionLabel: null,
      source: "api",
      price: data.quote.price,
      deliveryTime: data.quote.deliveryTime,
      serviceName: data.quote.name,
      options: data.options || [data.quote],
    };
  } catch {
    return { valid: true, freeShipping: false, regionLabel: null, source: "api", error: "Frete a combinar pelo WhatsApp." };
  }
}

export async function checkShipping(cep: string, items: CartItem[] = []): Promise<ShippingResult> {
  const digits = cleanCep(cep);

  if (digits.length !== 8) {
    return { valid: false, freeShipping: false, regionLabel: null, source: "invalid" };
  }

  // Atalho manual: CEPs já confirmados como frete grátis não dependem de
  // geocodificação nenhuma (veja lib/freeShippingOverrides.ts).
  if (FREE_SHIPPING_CEP_OVERRIDES.includes(digits)) {
    return { valid: true, freeShipping: true, regionLabel: "sua região", source: "geo", deliveryTime: 3 };
  }

  const { coords, city } = await getCepInfo(digits);

  if (!coords) {
    // Não temos como confirmar se este CEP está dentro da área de frete
    // grátis — em vez de presumir que sim (como acontecia antes), calculamos
    // o frete pago normalmente (que ainda pode zerar pelo mínimo nacional
    // logo abaixo). Mais seguro que dar frete grátis "no escuro".
    return applyNationalFreeShippingThreshold(await quoteOutsideFreeArea(digits, items), items);
  }

  if (!isExcludedCity(city) && isInsideZone(coords, FREE_SHIPPING_ZONE)) {
    return { valid: true, freeShipping: true, regionLabel: "sua região", source: "geo", deliveryTime: 3 };
  }

  return applyNationalFreeShippingThreshold(await quoteOutsideFreeArea(digits, items), items);
}

/** Fora da área geográfica de frete grátis, o carrinho ainda pode ganhar frete grátis
 * se o subtotal bater o mínimo nacional — mantém o prazo de entrega vindo da cotação
 * real (Melhor Envio), só zera o valor cobrado. */
function applyNationalFreeShippingThreshold(quote: ShippingResult, items: CartItem[]): ShippingResult {
  if (cartSubtotal(items) < NATIONAL_FREE_SHIPPING_MINIMUM) return quote;
  return {
    ...quote,
    freeShipping: true,
    price: 0,
    regionLabel: quote.regionLabel ?? "todo o Brasil",
    options: quote.options?.map((option) => ({ ...option, price: 0 })),
  };
}
