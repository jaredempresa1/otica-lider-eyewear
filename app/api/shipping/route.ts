import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getValidMelhorEnvioToken } from "@/lib/melhorEnvio";

const ORIGIN_POSTAL_CODE = "58043320";
const MELHOR_ENVIO_URL = "https://melhorenvio.com.br/api/v2/me/shipment/calculate";

// Usado até a tabela shipping_settings ser criada no Supabase.
const DEFAULT_PACKAGE = {
  width: 15,
  height: 10,
  length: 20,
  weight: 0.5,
};

// Melhor Envio: 1 = PAC e 2 = SEDEX.
const REQUESTED_SERVICES = "1,2";

type QuoteRequest = {
  postalCode?: string;
  items?: Array<{ id: string; price: number; quantity: number }>;
};

type MelhorEnvioQuote = {
  id?: number;
  name?: string;
  price?: number | string;
  custom_price?: number | string;
  delivery_time?: number;
  custom_delivery_time?: number;
  error?: string;
};

function cleanPostalCode(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeDeliveryTime(value: unknown): number {
  const days = Number(value);
  return Number.isFinite(days) && days > 0 ? Math.round(days) : 0;
}

export async function POST(request: Request) {
  const token = await getValidMelhorEnvioToken();
  const userAgent = process.env.MELHOR_ENVIO_USER_AGENT || "Otica Lider Eyewear (contato@oticalider.com.br)";

  if (!token) {
    return NextResponse.json(
      {
        error:
          "Cotação automática indisponível: autorize o Melhor Envio uma vez em /api/melhor-envio/authorize.",
      },
      { status: 503 },
    );
  }

  let body: QuoteRequest;
  try {
    body = (await request.json()) as QuoteRequest;
  } catch {
    return NextResponse.json({ error: "Dados de cotação inválidos." }, { status: 400 });
  }

  const postalCode = cleanPostalCode(body.postalCode || "");
  if (postalCode.length !== 8 || !body.items?.length) {
    return NextResponse.json({ error: "Informe um CEP de destino e ao menos um item." }, { status: 400 });
  }

  const { data: packageSettings } = await supabase
    .from("shipping_settings")
    .select("width, height, length, weight")
    .eq("id", 1)
    .maybeSingle();

  const packageSize = packageSettings ? {
    width: Number(packageSettings.width),
    height: Number(packageSettings.height),
    length: Number(packageSettings.length),
    weight: Number(packageSettings.weight),
  } : DEFAULT_PACKAGE;

  const products = body.items.map((item) => ({
    id: item.id,
    ...packageSize,
    insurance_value: Number(item.price.toFixed(2)),
    quantity: Math.max(1, item.quantity),
  }));

  try {
    const requestQuotes = async (services?: string) => fetch(MELHOR_ENVIO_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": userAgent,
      },
      body: JSON.stringify({
        from: { postal_code: ORIGIN_POSTAL_CODE },
        to: { postal_code: postalCode },
        products,
        options: { receipt: false, own_hand: false },
        ...(services ? { services } : {}),
      }),
      cache: "no-store",
    });

    let response = await requestQuotes(REQUESTED_SERVICES);
    let data = (await response.json()) as MelhorEnvioQuote[] | { error?: string };

    // Se PAC/SEDEX não estiver disponível para uma rota específica, tenta
    // novamente sem restringir a transportadora para obter outras opções.
    if (response.ok && Array.isArray(data) && !data.some((quote) => quote.error == null && Number(quote.custom_price ?? quote.price ?? 0) > 0)) {
      response = await requestQuotes();
      data = (await response.json()) as MelhorEnvioQuote[] | { error?: string };
    }

    if (!response.ok || !Array.isArray(data)) {
      return NextResponse.json(
        { error: Array.isArray(data) ? "Não há serviço de entrega disponível para este CEP." : data.error || "Não foi possível calcular o frete para este CEP." },
        { status: 502 },
      );
    }

    const quotes = data
      .filter((quote) => quote.error == null)
      .map((quote) => ({
        id: quote.id ?? null,
        name: quote.name || "Transportadora",
        price: Number(quote.custom_price ?? quote.price ?? 0),
        deliveryTime: normalizeDeliveryTime(quote.custom_delivery_time ?? quote.delivery_time),
      }))
      .filter((quote) => Number.isFinite(quote.price) && quote.price > 0)
      .sort((a, b) => a.price - b.price);

    if (!quotes.length) {
      return NextResponse.json({ error: "Nenhuma opção de frete disponível para este CEP. Confira o CEP ou tente outra modalidade." }, { status: 404 });
    }

    return NextResponse.json({ quote: quotes[0], options: quotes });
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar ao serviço de frete." }, { status: 502 });
  }
}
