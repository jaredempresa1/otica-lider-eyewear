/**
 * Regras de frete grátis por CEP — Região Metropolitana de João Pessoa
 * (João Pessoa, Bayeux, Cabedelo, Santa Rita, Conde, Lucena, Mamanguape,
 * Rio Tinto e Cruz do Espírito Santo, conforme Lei Complementar 59/2003-PB).
 *
 * Faixas confirmadas:
 * - João Pessoa (PB): 58000-000 a 58099-999
 * - Bayeux (PB):       58110-000 a 58119-999 e 58305-000 a 58309-999
 *
 * ⚠️ ATENÇÃO: as faixas de Cabedelo, Santa Rita, Conde, Lucena,
 * Mamanguape, Rio Tinto e Cruz do Espírito Santo abaixo são uma
 * ESTIMATIVA e ainda não foram confirmadas com uma fonte oficial dos
 * Correios. Confira em https://buscacepinter.correios.com.br/ antes de
 * publicar, para não liberar (ou negar) frete grátis por engano.
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
  { label: "Bayeux - PB", from: 58110, to: 58119 },
  { label: "Bayeux - PB", from: 58305, to: 58309 },
  // Estimativas — confirmar antes de publicar (ver aviso acima):
  { label: "Cabedelo - PB", from: 58100, to: 58108 },
  { label: "Cabedelo - PB", from: 58310, to: 58319 },
  { label: "Santa Rita - PB", from: 58300, to: 58304 },
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
