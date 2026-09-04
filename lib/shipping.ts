/**
 * Regras de frete grátis por CEP.
 *
 * Faixas oficiais dos Correios:
 * - João Pessoa (PB): 58000-001 a 58099-999
 * - Goiana (PE):       55900-000 a 55919-999
 *
 * Se um dia a loja passar a atender outras cidades de graça,
 * basta adicionar uma nova faixa no array FREE_SHIPPING_RANGES abaixo.
 */

type CepRange = {
  label: string;
  from: number; // primeiros 5 dígitos do CEP
  to: number;
};

const FREE_SHIPPING_RANGES: CepRange[] = [
  { label: "João Pessoa - PB", from: 58000, to: 58099 },
  { label: "Goiana - PE", from: 55900, to: 55919 },
];

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
};

export function checkShipping(cep: string): ShippingResult {
  const digits = cleanCep(cep);

  if (digits.length !== 8) {
    return { valid: false, freeShipping: false, regionLabel: null };
  }

  const prefix = parseInt(digits.slice(0, 5), 10);

  for (const range of FREE_SHIPPING_RANGES) {
    if (prefix >= range.from && prefix <= range.to) {
      return { valid: true, freeShipping: true, regionLabel: range.label };
    }
  }

  return { valid: true, freeShipping: false, regionLabel: null };
}
