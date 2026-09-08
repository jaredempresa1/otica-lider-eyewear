/**
 * CEPs CONFIRMADOS MANUALMENTE COMO FRETE GRÁTIS
 * ================================================
 *
 * A geocodificação automática (BrasilAPI + OpenStreetMap, veja geocode.ts)
 * não acerta 100% dos CEPs — alguns CEPs genéricos (tipo "-000") ou muito
 * novos não têm coordenada cadastrada em nenhuma das duas fontes, e às
 * vezes a coordenada que vem cai perto demais da borda do polígono
 * (FREE_SHIPPING_ZONE, em deliveryZone.ts) e escapa por poucos metros.
 *
 * Esta lista é um "atalho manual": qualquer CEP aqui dentro recebe frete
 * grátis direto, sem depender de geocodificação nenhuma. Serve tanto para
 * os CEPs que você já testou e confirmou que deveriam ser grátis, quanto
 * para qualquer CEP futuro que der errado — é só adicionar aqui.
 *
 * COMO ADICIONAR UM NOVO CEP:
 * 1. Confirme que o endereço está mesmo dentro da área de frete grátis
 *    (mapa, endereço conhecido, etc.).
 * 2. Copie o CEP só com números (sem traço) e cole na lista abaixo.
 * 3. Salve o arquivo. Pronto — não precisa mexer em mais nada.
 */

export const FREE_SHIPPING_CEP_OVERRIDES: string[] = [
  "58310000", // Cabedelo
  "58010340", // João Pessoa
  "58305310", // Cabedelo
  "58083624", // João Pessoa
  "58078458", // João Pessoa
  "58069000", // João Pessoa
];
