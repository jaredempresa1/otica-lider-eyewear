/**
 * ÁREA DE FRETE GRÁTIS
 * =====================
 *
 * Em vez de "adivinhar" a cidade a partir do prefixo do CEP, a gente
 * confere se o PONTO (latitude/longitude) do CEP do cliente cai dentro
 * desse polígono. É o mesmo princípio das áreas de entrega do iFood ou
 * do Uber.
 *
 * ⚠️ REVISADO EM 07/2026 — ainda é uma ESTIMATIVA, não um traçado exato
 * -----------------------------------------------------------------------
 * A versão anterior deste arquivo foi um "chute" olhando um print.
 * Esta versão foi refeita usando coordenadas reais e confirmadas de
 * Bayeux, João Pessoa, Cabedelo e Cabo Branco/Ponta do Seixas como
 * pontos de referência, ajustando o contorno para acompanhar o formato
 * da área vermelha do seu print (cobrindo Bayeux, toda a orla de João
 * Pessoa, Cabedelo, até a altura de Cabo Branco/Seixas).
 *
 * Isso é bem mais confiável que o rascunho anterior, mas ainda pode ter
 * erro de algumas centenas de metros perto das bordas — um print não
 * carrega informação de projeção/zoom exata, então não dá pra extrair
 * coordenadas com precisão cirúrgica só olhando a imagem.
 *
 * Cidades como Lucena, Santa Rita e Conde são bloqueadas separadamente
 * em lib/shipping.ts (EXCLUDED_CITIES), então mesmo que o polígono
 * "vaze" um pouco para perto delas, essas cidades continuam de fora.
 *
 * PARA DEIXAR 100% EXATO (5 minutos, de graça):
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
  { lat: -7.055, lng: -34.945 }, // norte de Bayeux
  { lat: -7.010, lng: -34.900 }, // acompanhando o rio Sanhauá, ao norte
  { lat: -6.985, lng: -34.860 }, // seguindo para leste, rumo a Cabedelo
  { lat: -6.965, lng: -34.822 }, // norte de Cabedelo / Costinha
  { lat: -6.985, lng: -34.812 }, // litoral de Cabedelo (Intermares/Camboinha)
  { lat: -7.020, lng: -34.815 }, // porto de Cabedelo
  { lat: -7.095, lng: -34.822 }, // orla de João Pessoa (Bessa/Manaíra/Tambaú)
  { lat: -7.150, lng: -34.800 }, // Cabo Branco / Ponta do Seixas
  { lat: -7.195, lng: -34.812 }, // sul de Seixas, virada da costa
  { lat: -7.215, lng: -34.865 }, // interior sul de João Pessoa
  { lat: -7.150, lng: -34.930 }, // interior, retornando em direção a Bayeux
  { lat: -7.090, lng: -34.958 }, // oeste de Bayeux, fecha o polígono
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
