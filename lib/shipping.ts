/**
 * Regras de frete: frete grátis na área definida e cotação automática para
 * os demais destinos através da API interna do Melhor Envio.
 */

import { getCepInfo } from "./geocode";
import { FREE_SHIPPING_ZONE, isInsideZone } from "./deliveryZone";
import { CartItem } from "@/types/product";

const EXCLUDED_CITIES = ["lucena", "santa rita", "conde"];

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

const FALLBACK_RANGES: { label: string; from: number; to: number }[] = [
  { label: "João Pessoa - PB", from: 58000, to: 58099 },
  { label: "Bayeux - PB", from: 58110, to: 58119 },
  { label: "Bayeux - PB", from: 58305, to: 58309 },
  { label: "Cabedelo - PB", from: 58310, to: 58319 },
];

function fallbackCheck(digits: string): ShippingResult {
  const prefix = parseInt(digits.slice(0, 5), 10);

  for (const range of FALLBACK_RANGES) {
    if (prefix >= range.from && prefix <= range.to) {
      return { valid: true, freeShipping: true, regionLabel: range.label, source: "fallback" };
    }
  }

  return { valid: true, freeShipping: false, regionLabel: null, source: "fallback" };
}

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
    return { valid: true, freeShipping: false, regionLabel: null, source: "api", error: "Não foi possível calcular o frete." };
  }
}

export async function checkShipping(cep: string, items: CartItem[] = []): Promise<ShippingResult> {
  const digits = cleanCep(cep);

  if (digits.length !== 8) {
    return { valid: false, freeShipping: false, regionLabel: null, source: "invalid" };
  }

  const { coords, city } = await getCepInfo(digits);

  if (!coords) {
    const fallback = fallbackCheck(digits);
    return fallback.freeShipping ? fallback : quoteOutsideFreeArea(digits, items);
  }

  if (!isExcludedCity(city) && isInsideZone(coords, FREE_SHIPPING_ZONE)) {
    return { valid: true, freeShipping: true, regionLabel: "sua região", source: "geo" };
  }

  return quoteOutsideFreeArea(digits, items);
}
