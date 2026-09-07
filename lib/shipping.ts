/**
 * Regra de frete grátis
 * ======================
 * 1. Pega o CEP do cliente e converte em latitude/longitude (lib/geocode.ts,
 *    via BrasilAPI — gratuita).
 * 2. Confere se esse ponto cai dentro da área desenhada em
 *    lib/deliveryZone.ts (mesmo princípio de área de entrega do iFood/Uber).
 * 3. Se a API não conseguir coordenadas para o CEP (acontece com CEPs muito
 *    novos), cai para uma verificação por faixa de CEP como reserva —
 *    só para não deixar o cliente sem resposta nesse caso raro.
 *
 * Isso é assíncrono (por causa da chamada de API), então quem usar
 * `checkShipping` precisa dar `await` — veja app/sacola/page.tsx.
 */

import { getCepInfo } from "./geocode";
import { FREE_SHIPPING_ZONE, isInsideZone } from "./deliveryZone";

// Cidades que NÃO devem ter frete grátis, mesmo que o CEP caia dentro do
// polígono (que é um desenho aproximado e pode encostar nessas áreas).
// Comparação sem acento/maiúsculas para não depender da grafia exata que
// a BrasilAPI devolver.
const EXCLUDED_CITIES = ["lucena", "santa rita"];

function normalizeCityName(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isExcludedCity(city: string | null): boolean {
  if (!city) return false;
  const normalized = normalizeCityName(city);
  return EXCLUDED_CITIES.includes(normalized);
}

export function cleanCep(cep: string): string {
  return cep.replace(/\D/g, "");
}

export function isValidCep(cep: string): boolean {
  return cleanCep(cep).length === 8;
}

export type ShippingResult = {
  valid: boolean;
  freeShipping: boolean;
  regionLabel: string | null;
  /** "geo" = confirmado por coordenadas, "fallback" = confirmado por faixa de CEP, "invalid" = CEP incompleto */
  source: "geo" | "fallback" | "invalid";
};

// Faixas de reserva — só entram em ação quando a geocodificação falha.
// Se um dia quiser ajustar, é só editar aqui.
const FALLBACK_RANGES: { label: string; from: number; to: number }[] = [
  { label: "João Pessoa - PB", from: 58000, to: 58099 },
  { label: "Bayeux - PB", from: 58110, to: 58119 },
  { label: "Bayeux - PB", from: 58305, to: 58309 },
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

export async function checkShipping(cep: string): Promise<ShippingResult> {
  const digits = cleanCep(cep);

  if (digits.length !== 8) {
    return { valid: false, freeShipping: false, regionLabel: null, source: "invalid" };
  }

  const { coords, city } = await getCepInfo(digits);

  if (!coords) {
    return fallbackCheck(digits);
  }

  // Lucena e Santa Rita ficam fora do frete grátis mesmo que o ponto caia
  // dentro do polígono desenhado (ele é aproximado e pode encostar nelas).
  if (isExcludedCity(city)) {
    return { valid: true, freeShipping: false, regionLabel: null, source: "geo" };
  }

  const inside = isInsideZone(coords, FREE_SHIPPING_ZONE);

  return {
    valid: true,
    freeShipping: inside,
    regionLabel: inside ? "sua região" : null,
    source: "geo",
  };
}
