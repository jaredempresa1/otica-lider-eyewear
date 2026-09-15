/**
 * Busca o endereço completo (rua, bairro, cidade, estado) a partir de um
 * CEP usando a ViaCEP — gratuita, sem chave, e é a mesma base dos Correios.
 *
 * Usada só para PREENCHER automaticamente o formulário de endereço; o
 * cálculo de frete grátis continua sendo feito por lib/geocode.ts +
 * lib/deliveryZone.ts, que são mais precisos para a área de entrega.
 */

export type ViaCepAddress = {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const CACHE = new Map<string, ViaCepAddress | null>();

export type CepLookupResult = {
  /** true = CEP existe; false = CEP não existe (a ViaCEP confirmou); null = não deu pra confirmar (sem internet etc.) — nesse caso não bloqueamos o cliente por um problema nosso. */
  exists: boolean | null;
  address: ViaCepAddress | null;
};

/** Confere se o CEP realmente existe (não só se tem 8 dígitos) e já devolve o endereço, numa única chamada. */
export async function lookupCep(cep: string): Promise<CepLookupResult> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return { exists: null, address: null };

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return { exists: null, address: null };

    const data = await response.json();
    if (data?.erro) return { exists: false, address: null };

    return {
      exists: true,
      address: {
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      },
    };
  } catch {
    return { exists: null, address: null };
  }
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepAddress | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  if (CACHE.has(digits)) return CACHE.get(digits) ?? null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) {
      CACHE.set(digits, null);
      return null;
    }

    const data = await response.json();
    if (data?.erro) {
      CACHE.set(digits, null);
      return null;
    }

    const address: ViaCepAddress = {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      estado: data.uf || "",
    };

    CACHE.set(digits, address);
    return address;
  } catch {
    CACHE.set(digits, null);
    return null;
  }
}
