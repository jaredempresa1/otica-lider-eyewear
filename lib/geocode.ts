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

const EMPTY: CepInfo = { coords: null, city: null };

async function fetchFromBrasilApi(digits: string): Promise<CepInfo> {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`, {
      // CEP não muda de coordenada nem de cidade; pode ficar em cache por um bom tempo.
      next: { revalidate: 60 * 60 * 24 * 30 },
    });

    if (!response.ok) return EMPTY;

    const data = await response.json();
    const latitude = data?.location?.coordinates?.latitude;
    const longitude = data?.location?.coordinates?.longitude;
    const city: string | null = typeof data?.city === "string" ? data.city : null;

    const coords: Coordinates | null =
      latitude != null && longitude != null ? { lat: Number(latitude), lng: Number(longitude) } : null;

    return { coords, city };
  } catch {
    return EMPTY;
  }
}

/**
 * Segunda fonte, só usada quando a BrasilAPI não devolve coordenadas.
 * OpenStreetMap (Nominatim) também é gratuito e sem chave, mas pede um
 * User-Agent identificando o site — por isso o cabeçalho abaixo.
 */
async function fetchFromNominatim(digits: string): Promise<CepInfo> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // não trava a tela esperando

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${digits}&country=Brazil&format=json&addressdetails=1&limit=1`,
      {
        headers: { "User-Agent": "OticaLiderEyewear/1.0 (contato@oticalider.com.br)" },
        signal: controller.signal,
        next: { revalidate: 60 * 60 * 24 * 30 },
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) return EMPTY;

    const data = await response.json();
    const first = Array.isArray(data) ? data[0] : null;
    if (!first) return EMPTY;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return EMPTY;

    const city: string | null =
      first.address?.city || first.address?.town || first.address?.municipality || first.address?.suburb || null;

    return { coords: { lat, lng }, city };
  } catch {
    // Timeout, rede fora do ar, CEP sem resultado, etc.
    return EMPTY;
  }
}

async function fetchCepInfo(cep: string): Promise<CepInfo> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return EMPTY;

  if (CACHE.has(digits)) {
    return CACHE.get(digits) as CepInfo;
  }

  const primary = await fetchFromBrasilApi(digits);

  if (primary.coords) {
    CACHE.set(digits, primary);
    return primary;
  }

  // BrasilAPI não achou coordenada — tenta o OpenStreetMap antes de desistir.
  const fallback = await fetchFromNominatim(digits);
  const info: CepInfo = { coords: fallback.coords, city: primary.city || fallback.city };

  CACHE.set(digits, info);
  return info;
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
