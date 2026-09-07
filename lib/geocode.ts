/**
 * Converte um CEP em coordenadas (latitude/longitude) usando a BrasilAPI.
 *
 * Por quê BrasilAPI e não os Correios direto: o webservice dos Correios
 * não devolve coordenadas, só endereço. A BrasilAPI já cruza o CEP com a
 * base do IBGE/OpenStreetMap e devolve lat/lng quando disponível — de
 * graça e sem precisar de chave de API.
 *
 * https://brasilapi.com.br/docs#tag/CEP
 *
 * Nem todo CEP tem coordenadas (CEPs muito novos, por exemplo). Nesses
 * casos a função devolve `null` e quem chamar decide o que fazer
 * (ver lib/shipping.ts, que cai para uma verificação por faixa de CEP).
 */

export type Coordinates = {
  lat: number;
  lng: number;
};

/** Resultado completo da consulta de CEP: coordenadas + cidade (quando disponíveis). */
export type CepInfo = {
  coords: Coordinates | null;
  city: string | null;
};

const CACHE = new Map<string, CepInfo>();

async function fetchCepInfo(cep: string): Promise<CepInfo> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return { coords: null, city: null };

  if (CACHE.has(digits)) {
    return CACHE.get(digits) as CepInfo;
  }

  const empty: CepInfo = { coords: null, city: null };

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`, {
      // CEP não muda de coordenada nem de cidade; pode ficar em cache por um bom tempo.
      next: { revalidate: 60 * 60 * 24 * 30 },
    });

    if (!response.ok) {
      CACHE.set(digits, empty);
      return empty;
    }

    const data = await response.json();
    const latitude = data?.location?.coordinates?.latitude;
    const longitude = data?.location?.coordinates?.longitude;
    const city: string | null = typeof data?.city === "string" ? data.city : null;

    const coords: Coordinates | null =
      latitude != null && longitude != null ? { lat: Number(latitude), lng: Number(longitude) } : null;

    const info: CepInfo = { coords, city };
    CACHE.set(digits, info);
    return info;
  } catch {
    // Rede fora do ar, CEP inexistente, etc. — quem chamar cai no fallback.
    CACHE.set(digits, empty);
    return empty;
  }
}

/** Mantido por compatibilidade: só as coordenadas. */
export async function geocodeCep(cep: string): Promise<Coordinates | null> {
  const info = await fetchCepInfo(cep);
  return info.coords;
}

/** Coordenadas + cidade do CEP, quando a BrasilAPI conseguir resolver. */
export async function getCepInfo(cep: string): Promise<CepInfo> {
  return fetchCepInfo(cep);
}
