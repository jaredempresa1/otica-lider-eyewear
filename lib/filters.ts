import { Collection, Product } from "@/types/product";

/** Normaliza texto para comparação "aproximada": minúsculas, sem acento, e qualquer
 * pontuação/hífen/espaço vira um único espaço. Assim "Ray-Ban" e "ray ban" batem
 * com a mesma busca, mesmo escritos de formas diferentes. */
function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Distância de edição entre duas palavras (quantas letras precisa trocar/tirar/adicionar
 * pra uma virar a outra). É a base da busca "tolerante a erro de digitação". */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const previousRow = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) previousRow[j] = j;

  for (let i = 1; i <= a.length; i++) {
    let previousDiagonal = previousRow[0];
    previousRow[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = previousRow[j];
      previousRow[j] = a[i - 1] === b[j - 1] ? previousDiagonal : 1 + Math.min(previousDiagonal, previousRow[j], previousRow[j - 1]);
      previousDiagonal = temp;
    }
  }
  return previousRow[b.length];
}

/** Quantas letras de diferença ainda aceitamos como "a mesma palavra digitada errado",
 * proporcional ao tamanho da palavra: palavras curtas (até 3 letras) exigem exata,
 * pra não confundir palavras curtas diferentes (ex.: "sol" com "sal"). */
function maxTypoDistance(wordLength: number): number {
  if (wordLength <= 3) return 0;
  if (wordLength <= 6) return 1;
  return 2;
}

/** Tamanho mínimo de palavra pra entrar numa comparação por "contém": abaixo disso,
 * palavras curtas (ex.: "sol", "aço", "de") batem por acaso dentro de termos maiores
 * e digitados sem querer (ex.: "aço" aparecia contido em "lacoste"), gerando resultado
 * errado na busca. Com esse mínimo, só faz sentido comparar por "contém" quando as duas
 * palavras já são específicas o bastante. */
const MIN_CONTAINS_LENGTH = 4;

/** Uma palavra da busca "bate" com uma palavra do produto se: uma contém a outra
 * (busca parcial, ex.: "oculo" dentro de "oculos" — mas só quando ambas já têm um
 * tamanho mínimo, pra não confundir com uma palavra curta qualquer), ou se a distância
 * de edição entre elas está dentro da tolerância a erro de digitação (ex.: "lascoste" ~
 * "lacoste"). */
function wordsApproximatelyMatch(queryWord: string, productWord: string): boolean {
  if (queryWord.length >= MIN_CONTAINS_LENGTH && productWord.length >= MIN_CONTAINS_LENGTH) {
    if (productWord.includes(queryWord) || queryWord.includes(productWord)) return true;
  }
  const tolerance = Math.min(maxTypoDistance(queryWord.length), maxTypoDistance(productWord.length));
  if (tolerance === 0) return false;
  if (Math.abs(queryWord.length - productWord.length) > tolerance) return false;
  return levenshteinDistance(queryWord, productWord) <= tolerance;
}


/** Única lista de formatos do site: usada no filtro da vitrine E no campo "Formato" do admin,
 * pra nunca ficarem fora de sincronia (um formato digitado livremente no admin que não bata
 * exatamente com essas opções nunca aparece quando o cliente filtra por formato). */
export const FORMAT_OPTIONS = ["Redondo", "Quadrado", "Retangular", "Oval", "Gatinho", "Aviador", "Geométrico"];

export type QuickFilterValue = "menor-preco" | "maior-preco" | "destaques" | "mais-vendidos" | "ofertas";

export const QUICK_FILTERS: { value: QuickFilterValue; label: string }[] = [
  { value: "ofertas", label: "Ofertas" },
  { value: "mais-vendidos", label: "Mais vendidos" },
  { value: "destaques", label: "Em destaque" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "menor-preco", label: "Menor preço" },
];

/** Atalhos de filtro (gênero, esportivo, ordenação) que também devem aparecer como
 * sugestão na busca — ex.: digitar "masc" ou "fem" sugere o link do gênero, digitar
 * "promo" sugere "Ofertas" etc. `keywords` cobre variações comuns de escrita. */
type FilterSuggestion = { label: string; href: string; keywords: string[] };

const SEARCH_FILTER_SUGGESTIONS: FilterSuggestion[] = [
  { label: "Óculos Masculino", href: "/produtos?genero=masculino", keywords: ["masculino", "homem", "masc", "para homem"] },
  { label: "Óculos Feminino", href: "/produtos?genero=feminino", keywords: ["feminino", "mulher", "fem", "para mulher"] },
  { label: "Óculos Infantil", href: "/produtos?genero=infantil", keywords: ["infantil", "crianca", "kids", "filho", "filha"] },
  { label: "Óculos Esportivo", href: "/produtos?esportivo=1", keywords: ["esportivo", "esporte", "sport", "corrida", "ciclismo", "bike"] },
  { label: "Ofertas", href: "/produtos?ordenar=ofertas", keywords: ["oferta", "ofertas", "promocao", "promocoes", "desconto", "barato"] },
  { label: "Mais vendidos", href: "/produtos?ordenar=mais-vendidos", keywords: ["mais vendido", "mais vendidos", "vendido", "populares", "top vendas"] },
  { label: "Em destaque", href: "/produtos?ordenar=destaques", keywords: ["destaque", "destaques", "novidade", "novidades", "lancamento"] },
];

const SEARCH_SECTION_SUGGESTIONS: FilterSuggestion[] = [
  { label: "Óculos em destaque", href: "/produtos?secao=destaque", keywords: ["destaque", "destaques", "oculos em destaque", "featured"] },
  { label: "Óculos Sport Vision", href: "/produtos?secao=sport-vision", keywords: ["sport vision", "sport", "esportivo", "oculos sport vision"] },
  { label: "Óculos de sol feminino", href: "/produtos?secao=feminino", keywords: ["feminino", "feminina", "mulher", "solar feminino", "sol feminino", "oculos de sol feminino"] },
  { label: "Óculos de sol masculino", href: "/produtos?secao=masculino", keywords: ["masculino", "masculina", "homem", "solar masculino", "sol masculino", "oculos de sol masculino"] },
  { label: "Óculos de sol infantil", href: "/produtos?secao=infantil", keywords: ["infantil", "crianca", "kids", "solar infantil", "sol infantil", "oculos de sol infantil"] },
];

// Atalhos de filtro prontos para "ao clicar, levar para" (usado no destino do
// destaque promocional e dos slides do carrossel principal). Mesmas URLs que
// o filtro da vitrine já entende, então é só uma lista amigável pro admin.
export type FilterDestination = { value: string; label: string; href: string };

export const FILTER_DESTINATIONS: FilterDestination[] = [
  { value: "genero-feminino", label: "Óculos Feminino", href: "/produtos?genero=feminino" },
  { value: "genero-masculino", label: "Óculos Masculino", href: "/produtos?genero=masculino" },
  { value: "genero-infantil", label: "Óculos Infantil", href: "/produtos?genero=infantil" },
  { value: "esportivo", label: "Óculos Esportivo (Sport Vision)", href: "/produtos?esportivo=1" },
  { value: "ofertas", label: "Ofertas", href: "/produtos?ordenar=ofertas" },
  { value: "mais-vendidos", label: "Mais vendidos", href: "/produtos?ordenar=mais-vendidos" },
  { value: "destaques", label: "Em destaque", href: "/produtos?ordenar=destaques" },
  { value: "todos", label: "Todos os produtos", href: "/produtos" },
];

/** Compara a busca digitada com as palavras-chave de cada atalho, tolerando erro de
 * digitação (reaproveita o mesmo comparador usado na busca de produtos). */
export function matchFilterSuggestions(query: string): { label: string; href: string }[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];
  const queryWords = normalizedQuery.split(" ").filter(Boolean);

  return SEARCH_FILTER_SUGGESTIONS.filter((suggestion) =>
    suggestion.keywords.some((keyword) => {
      const normalizedKeyword = normalizeSearchText(keyword);
      if (normalizedKeyword.includes(normalizedQuery) || normalizedQuery.includes(normalizedKeyword)) return true;
      const keywordWords = normalizedKeyword.split(" ").filter(Boolean);
      return queryWords.some((queryWord) => keywordWords.some((keywordWord) => wordsApproximatelyMatch(queryWord, keywordWord)));
    })
  ).map(({ label, href }) => ({ label, href }));
}

export function matchSectionSuggestions(query: string): { label: string; href: string }[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];
  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  return SEARCH_SECTION_SUGGESTIONS.filter((suggestion) =>
    suggestion.keywords.some((keyword) => {
      const normalizedKeyword = normalizeSearchText(keyword);
      if (normalizedKeyword.includes(normalizedQuery) || normalizedQuery.includes(normalizedKeyword)) return true;
      const keywordWords = normalizedKeyword.split(" ").filter(Boolean);
      return queryWords.some((queryWord) => keywordWords.some((keywordWord) => wordsApproximatelyMatch(queryWord, keywordWord)));
    })
  ).map(({ label, href }) => ({ label, href }));
}

export type ProductFilterState = {
  busca: string;
  genero: string[];
  marca: string[];
  cor: string[];
  formato: string[];
  ia: boolean;
  esportivo: boolean;
  precoMin: number | null;
  precoMax: number | null;
};

export const EMPTY_FILTER_STATE: ProductFilterState = {
  busca: "",
  genero: [],
  marca: [],
  cor: [],
  formato: [],
  ia: false,
  esportivo: false,
  precoMin: null,
  precoMax: null,
};

function parseListParam(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumberParam(value?: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type FilterSearchParams = {
  q?: string;
  genero?: string;
  marca?: string;
  cor?: string;
  formato?: string;
  ia?: string;
  esportivo?: string;
  precoMin?: string;
  precoMax?: string;
};

/** Lê o estado de filtros a partir dos searchParams da URL (gênero, marca, cor, preço). */
export function parseFilterState(searchParams: FilterSearchParams): ProductFilterState {
  return {
    busca: searchParams.q?.trim() ?? "",
    genero: parseListParam(searchParams.genero).filter((value) => value === "masculino" || value === "feminino" || value === "infantil"),
    marca: parseListParam(searchParams.marca),
    cor: parseListParam(searchParams.cor),
    formato: parseListParam(searchParams.formato),
    ia: searchParams.ia === "1",
    esportivo: searchParams.esportivo === "1",
    precoMin: parseNumberParam(searchParams.precoMin),
    precoMax: parseNumberParam(searchParams.precoMax),
  };
}

export function countActiveFilters(state: ProductFilterState, priceBounds?: { min: number; max: number }): number {
  let count = state.genero.length + state.marca.length + state.cor.length + state.formato.length;
  if (state.busca) count += 1;
  if (state.ia) count += 1;
  if (state.esportivo) count += 1;
  if (priceBounds) {
    const minChanged = state.precoMin !== null && state.precoMin > priceBounds.min;
    const maxChanged = state.precoMax !== null && state.precoMax < priceBounds.max;
    if (minChanged || maxChanged) count += 1;
  } else if (state.precoMin !== null || state.precoMax !== null) {
    count += 1;
  }
  return count;
}

/** Um produto "unissex" (ou sem gênero definido) aparece nos dois filtros, masculino e feminino. */
export function productMatchesFilters(product: Product, state: ProductFilterState): boolean {
  if (state.busca) {
    // Só busca em nome, marca e modelo — campos estruturados e específicos do produto.
    // A descrição foi tirada daqui porque costuma ter texto livre/genérico repetido em
    // vários produtos (ex.: menções a outras marcas como comparação), o que fazia uma
    // busca por uma marca específica (ex.: "Lacoste") trazer óculos de outras marcas.
    const searchText = normalizeSearchText([product.name, product.brand, product.model].filter(Boolean).join(" "));
    const productWords = searchText.split(" ").filter(Boolean);
    const normalizedQuery = normalizeSearchText(state.busca);
    const queryWords = normalizedQuery.split(" ").filter(Boolean);
    // Cada palavra da busca precisa achar uma palavra "parecida" no produto (contém,
    // ou está a poucas letras de distância — cobre erro de digitação, ex.: "lascoste" ~ "lacoste").
    const matchesByWord = queryWords.length > 0 && queryWords.every((queryWord) => productWords.some((productWord) => wordsApproximatelyMatch(queryWord, productWord)));
    // Também compara ignorando todos os espaços, para pegar buscas como "rayban" batendo com "Ray-Ban".
    const matchesCollapsed = normalizedQuery.length > 0 && searchText.replace(/ /g, "").includes(normalizedQuery.replace(/ /g, ""));
    if (!matchesByWord && !matchesCollapsed) return false;
  }

  if (state.genero.length > 0) {
    // "Unissex" (ou sem gênero definido) continua caindo em masculino OU feminino,
    // como antes — mas nunca em "infantil": infantil é uma categoria própria, só
    // aparece quando o produto foi marcado como infantil de verdade no admin.
    const genderValue = product.gender && product.gender.trim() ? product.gender : "unissex";
    const matchesGender =
      state.genero.includes(genderValue) ||
      (genderValue === "unissex" && state.genero.some((value) => value === "masculino" || value === "feminino"));
    if (!matchesGender) return false;
  }

  if (state.marca.length > 0) {
    const slugs = product.collection_slugs ?? [];
    if (!state.marca.some((slug) => slugs.includes(slug))) return false;
  }

  if (state.cor.length > 0) {
    const colorNames = (product.colors ?? []).map((color) => color.name);
    if (!state.cor.some((name) => colorNames.includes(name))) return false;
  }

  if (state.formato.length > 0) {
    const format = product.specifications?.format?.trim().toLocaleLowerCase("pt-BR") ?? "";
    if (!state.formato.some((value) => format === value.toLocaleLowerCase("pt-BR"))) return false;
  }

  // Óculos com IA = marcado manualmente no admin (ai_tryon), não "tem foto".
  if (state.ia && !product.ai_tryon) return false;

  // Óculos esportivo = marcado manualmente no admin, filtro à parte — mas o
  // produto continua aparecendo normalmente nos demais filtros também.
  if (state.esportivo && !product.sportivo) return false;

  if (state.precoMin !== null && product.price < state.precoMin) return false;
  if (state.precoMax !== null && product.price > state.precoMax) return false;

  return true;
}

export function filterProducts(products: Product[], state: ProductFilterState): Product[] {
  return products.filter((product) => productMatchesFilters(product, state));
}

/** Aplica o filtro rápido: "menor/maior preço" ordenam, os demais recortam a lista. */
export function applyQuickFilter(products: Product[], ordenar: string | null | undefined): Product[] {
  switch (ordenar) {
    case "menor-preco":
      return [...products].sort((a, b) => a.price - b.price);
    case "maior-preco":
      return [...products].sort((a, b) => b.price - a.price);
    case "destaques":
      return products.filter((product) => product.featured);
    case "mais-vendidos":
      return products.filter((product) => product.more_sold);
    case "ofertas":
      return products.filter((product) => product.compare_at_price != null && product.compare_at_price > product.price);
    default:
      return products;
  }
}

export function getColorNames(products: Product[]): string[] {
  const names = new Set<string>();
  products.forEach((product) => (product.colors ?? []).forEach((color) => {
    if (color.name?.trim()) names.add(color.name.trim());
  }));
  return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function getFormatNames(products: Product[]): string[] {
  const names = new Set<string>();
  products.forEach((product) => {
    const format = product.specifications?.format?.trim();
    const match = FORMAT_OPTIONS.find((option) => option.toLocaleLowerCase("pt-BR") === format?.toLocaleLowerCase("pt-BR"));
    if (match) names.add(match);
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function getPriceBounds(products: Product[]): { min: number; max: number } {
  if (!products.length) return { min: 0, max: 0 };
  const prices = products.map((product) => product.price);
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}

export function getBrandCollections(products: Product[], collections: Collection[]): Collection[] {
  const usedSlugs = new Set<string>();
  products.forEach((product) => (product.collection_slugs ?? []).forEach((slug) => usedSlugs.add(slug)));
  return collections.filter((collection) => usedSlugs.has(collection.slug));
}
