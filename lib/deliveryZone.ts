/**
 * ÁREA DE FRETE GRÁTIS
 * =====================
 *
 * Em vez de "advinhar" a cidade a partir do prefixo do CEP, a gente
 * confere se o PONTO (latitude/longitude) do CEP do cliente cai dentro
 * desse polígono. É o mesmo princípio das áreas de entrega do iFood ou
 * do Uber.
 *
 * ⚠️ IMPORTANTE — os pontos abaixo são um RASCUNHO
 * ---------------------------------------------------
 * Eu desenhei esse polígono de olho na imagem que você mandou (a área
 * demarcada em vermelho: João Pessoa, Bayeux, Cabedelo e a orla até a
 * altura de Seixas). Mas eu "chutei" as coordenadas olhando um mapa —
 * não tenho como extrair os pontos exatos do contorno vermelho do seu
 * print. Então trate isso como ponto de partida, não como área final.
 *
 * PARA DEIXAR CERTEIRO (5 minutos, de graça):
 * 1. Abra https://geojson.io no navegador.
 * 2. No menu de desenho (ícone de polígono, canto superior direito),
 *    desenhe por cima do mapa a MESMA área que você marcou de vermelho.
 * 3. Clique nos pontos do polígono que você acabou de desenhar; o painel
 *    direito mostra um JSON com "coordinates": [[[lng, lat], [lng, lat], ...]].
 * 4. Copie esses pares e cole aqui embaixo em FREE_SHIPPING_ZONE, no
 *    formato { lat: ..., lng: ... } — repare que o geojson.io exporta
 *    como [lng, lat] (invertido!), então troque a ordem ao colar.
 * 5. Salve o arquivo. Pronto, a zona de frete grátis passa a ser
 *    exatamente a que você desenhou.
 *
 * Pode ter quantos pontos quiser (quanto mais pontos, mais fiel ao
 * contorno). Não precisa repetir o primeiro ponto no final — a função
 * abaixo já fecha o polígono sozinha.
 */

export type LatLng = {
  lat: number;
  lng: number;
};

export const FREE_SHIPPING_ZONE: LatLng[] = [
  { lat: -7.020, lng: -34.965 },
  { lat: -7.005, lng: -34.900 },
  { lat: -6.965, lng: -34.850 },
  { lat: -6.955, lng: -34.808 },
  { lat: -6.995, lng: -34.800 },
  { lat: -7.080, lng: -34.815 },
  { lat: -7.145, lng: -34.825 },
  { lat: -7.205, lng: -34.845 },
  { lat: -7.230, lng: -34.900 },
  { lat: -7.175, lng: -34.965 },
  { lat: -7.090, lng: -35.010 },
  { lat: -7.020, lng: -34.985 },
];

/**
 * Ray casting clássico: "atira" uma linha horizontal a partir do ponto
 * e conta quantas vezes ela cruza as arestas do polígono. Número ímpar
 * de cruzamentos = ponto está dentro.
 */
export function isInsideZone(point: LatLng, polygon: LatLng[] = FREE_SHIPPING_ZONE): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}
