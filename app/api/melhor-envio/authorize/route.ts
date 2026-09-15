import { NextResponse } from "next/server";
import crypto from "crypto";

const CALLBACK_URL = "https://otica-lider-eyewear.vercel.app/api/melhor-envio/callback";
const STATE_COOKIE = "me_oauth_state";

/**
 * Segurança: essa rota inicia a conexão do site com sua conta do Melhor
 * Envio. Antes, qualquer pessoa que descobrisse essa URL podia acessá-la e
 * reconectar a cotação de frete do site à conta de outra pessoa. Agora ela
 * só funciona se vier acompanhada da chave secreta que só você conhece
 * (MELHOR_ENVIO_SETUP_SECRET, configurada na Vercel) — ou seja, vira um
 * link de uso único, não uma porta aberta.
 */
export async function GET(request: Request) {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const setupSecret = process.env.MELHOR_ENVIO_SETUP_SECRET;

  if (!clientId) {
    return NextResponse.json({ error: "MELHOR_ENVIO_CLIENT_ID não configurado." }, { status: 503 });
  }

  if (!setupSecret) {
    return NextResponse.json(
      { error: "MELHOR_ENVIO_SETUP_SECRET não configurado. Defina essa variável na Vercel antes de autorizar." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");

  if (providedSecret !== setupSecret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://melhorenvio.com.br/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", CALLBACK_URL);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("scope", "shipping-calculate");

  const response = NextResponse.redirect(authorizeUrl);
  // Guarda o "state" num cookie de curta duração pra conferir, no retorno
  // (callback), que a resposta pertence a esta mesma autorização — impede
  // que alguém force o callback a aceitar uma autorização de outra pessoa.
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/api/melhor-envio",
  });

  return response;
}
