/**
 * Renovação automática do token do Melhor Envio.
 * ================================================
 *
 * Antes: o token de acesso era colado à mão em uma variável de ambiente
 * (MELHOR_ENVIO_TOKEN) e expirava periodicamente, exigindo que alguém
 * refizesse a autorização e colasse um novo valor na Vercel.
 *
 * Agora: depois de autorizar UMA ÚNICA VEZ em /api/melhor-envio/authorize,
 * o access_token e o refresh_token ficam guardados na tabela
 * melhor_envio_tokens (Supabase, acessível só pela chave de serviço).
 * Toda vez que o site precisa calcular um frete, getValidMelhorEnvioToken()
 * confere se o token ainda vale; se estiver perto de expirar, ele mesmo
 * troca o refresh_token por um par novo de tokens e atualiza o banco —
 * sem precisar de nenhuma ação humana depois da primeira autorização.
 */

import { hasSupabaseAdminConfig, supabaseAdmin } from "./supabaseAdmin";

const TOKEN_URL = "https://melhorenvio.com.br/oauth/token";

// Renova um pouco antes de expirar de verdade, pra nunca correr o risco de
// usar um token vencido numa cotação por causa de alguns segundos de atraso.
const SAFETY_MARGIN_MS = 5 * 60 * 1000;

type StoredToken = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
};

function userAgent(): string {
  return process.env.MELHOR_ENVIO_USER_AGENT || "Otica Lider Eyewear (contato@oticalider.com.br)";
}

async function getStoredToken(): Promise<StoredToken | null> {
  const { data } = await supabaseAdmin
    .from("melhor_envio_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("id", 1)
    .maybeSingle();

  return (data as StoredToken | null) ?? null;
}

/** Guarda um novo par de tokens — chamado tanto pela autorização inicial quanto pela renovação. */
export async function saveMelhorEnvioToken(token: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}): Promise<void> {
  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();

  await supabaseAdmin.from("melhor_envio_tokens").upsert({
    id: 1,
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });
}

async function refreshMelhorEnvioToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": userAgent(),
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as TokenResponse;

    if (!response.ok || !data.access_token || !data.refresh_token || !data.expires_in) {
      return null;
    }

    await saveMelhorEnvioToken({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });

    return data.access_token;
  } catch {
    return null;
  }
}

/**
 * Devolve um access token válido do Melhor Envio, renovando sozinho quando
 * necessário. Retorna null quando não há como calcular frete automático
 * (loja nunca autorizou o Melhor Envio e nenhum token fixo foi configurado).
 */
export async function getValidMelhorEnvioToken(): Promise<string | null> {
  if (!hasSupabaseAdminConfig) {
    // Sem a chave de serviço, cai para o modo antigo (token fixo no .env,
    // sem renovação automática) só para não quebrar quem ainda não migrou.
    return process.env.MELHOR_ENVIO_TOKEN || null;
  }

  const stored = await getStoredToken();
  if (!stored) {
    return process.env.MELHOR_ENVIO_TOKEN || null;
  }

  const expiresAt = new Date(stored.expires_at).getTime();
  const stillValid = Number.isFinite(expiresAt) && expiresAt - SAFETY_MARGIN_MS > Date.now();
  if (stillValid) {
    return stored.access_token;
  }

  const refreshed = await refreshMelhorEnvioToken(stored.refresh_token);
  // Se a renovação falhar (ex.: instabilidade momentânea do Melhor Envio),
  // ainda tenta usar o token antigo — pode estar perto do limite, mas às
  // vezes ainda funciona, em vez de simplesmente desistir da cotação.
  return refreshed || stored.access_token;
}
