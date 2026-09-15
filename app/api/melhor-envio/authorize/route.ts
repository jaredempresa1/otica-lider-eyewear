import { NextResponse } from "next/server";

const CALLBACK_URL = "https://otica-lider-eyewear.vercel.app/api/melhor-envio/callback";

export async function GET(request: Request) {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json({ error: "MELHOR_ENVIO_CLIENT_ID não configurado." }, { status: 503 });
  }

  const authorizeUrl = new URL("https://melhorenvio.com.br/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", CALLBACK_URL);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", crypto.randomUUID());
  authorizeUrl.searchParams.set("scope", "shipping-calculate");

  return NextResponse.redirect(authorizeUrl);
}
