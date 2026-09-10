import { NextResponse } from "next/server";
import { hasSupabaseAdminConfig } from "@/lib/supabaseAdmin";
import { saveMelhorEnvioToken } from "@/lib/melhorEnvio";

const CALLBACK_URL = "https://otica-lider-eyewear.vercel.app/api/melhor-envio/callback";

function htmlPage(title: string, body: string, status: number) {
  return new NextResponse(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:Arial,sans-serif;max-width:640px;margin:64px auto;padding:24px;color:#1f2937"><h1>${title}</h1>${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return htmlPage(
      "Autorização não concluída",
      "<p>O Melhor Envio retornou um erro durante a autorização. Você pode fechar esta janela e tentar novamente.</p>",
      400,
    );
  }

  if (!code) {
    return htmlPage(
      "Callback do Melhor Envio",
      "<p>Esta URL está ativa e aguardando uma autorização válida.</p>",
      200,
    );
  }

  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return htmlPage(
      "Credenciais ausentes",
      "<p>Credenciais do Melhor Envio não configuradas (MELHOR_ENVIO_CLIENT_ID / MELHOR_ENVIO_CLIENT_SECRET).</p>",
      503,
    );
  }

  if (!hasSupabaseAdminConfig) {
    return htmlPage(
      "Configuração pendente",
      "<p>Falta configurar <strong>SUPABASE_SERVICE_ROLE_KEY</strong> na Vercel antes de autorizar — é ela que permite ao site guardar e renovar o token sozinho. Adicione essa variável, faça redeploy e tente autorizar de novo.</p>",
      503,
    );
  }

  try {
    const tokenResponse = await fetch("https://melhorenvio.com.br/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": process.env.MELHOR_ENVIO_USER_AGENT || "Otica Lider Eyewear (contato@oticalider.com.br)",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: CALLBACK_URL,
        code,
      }),
      cache: "no-store",
    });
    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
    };

    if (!tokenResponse.ok || !tokenData.access_token || !tokenData.refresh_token || !tokenData.expires_in) {
      return htmlPage(
        "Autorização não concluída",
        "<p>Não foi possível concluir a autorização do Melhor Envio. Tente novamente.</p>",
        502,
      );
    }

    await saveMelhorEnvioToken({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    });

    return htmlPage(
      "Autorização concluída ✅",
      "<p>O Melhor Envio foi conectado e o token já foi salvo automaticamente. A partir de agora a cotação de frete se renova sozinha para sempre — você não precisa colar nada em lugar nenhum. Pode fechar esta janela.</p>",
      200,
    );
  } catch {
    return htmlPage("Erro de conexão", "<p>Não foi possível conectar ao Melhor Envio.</p>", 502);
  }
}
