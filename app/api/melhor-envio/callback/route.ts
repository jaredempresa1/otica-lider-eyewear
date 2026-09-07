import { NextResponse } from "next/server";

const CALLBACK_URL = "https://otica-lider-eyewear.vercel.app/api/melhor-envio/callback";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return new NextResponse(
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Autorização não concluída</title></head><body style="font-family:Arial,sans-serif;max-width:640px;margin:64px auto;padding:24px;color:#1f2937"><h1>Autorização não concluída</h1><p>O Melhor Envio retornou um erro durante a autorização. Você pode fechar esta janela e tentar novamente.</p></body></html>`,
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  if (!code) {
    return new NextResponse(
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Callback do Melhor Envio</title></head><body style="font-family:Arial,sans-serif;max-width:640px;margin:64px auto;padding:24px;color:#1f2937"><h1>Callback do Melhor Envio</h1><p>Esta URL está ativa e aguardando uma autorização válida.</p></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse("Credenciais do Melhor Envio não configuradas.", { status: 503 });
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
    const tokenData = (await tokenResponse.json()) as { access_token?: string; refresh_token?: string; error?: string };

    if (!tokenResponse.ok || !tokenData.access_token) {
      return new NextResponse("Não foi possível concluir a autorização do Melhor Envio.", { status: 502 });
    }

    // O token é mostrado uma única vez para ser salvo como Secret na Vercel.
    return new NextResponse(
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Autorização concluída</title></head><body style="font-family:Arial,sans-serif;max-width:760px;margin:64px auto;padding:24px;color:#1f2937"><h1>Autorização concluída</h1><p>Copie o access token abaixo e salve-o na Vercel como <strong>MELHOR_ENVIO_TOKEN</strong> usando o tipo Secret. Não compartilhe este valor.</p><textarea readonly style="width:100%;min-height:130px;padding:12px">${tokenData.access_token}</textarea><p>Depois de salvar, faça Redeploy na Vercel. O refresh token também foi gerado e deve ser guardado para renovação futura:</p><textarea readonly style="width:100%;min-height:100px;padding:12px">${tokenData.refresh_token || "não retornado"}</textarea></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
    );
  } catch {
    return new NextResponse("Não foi possível conectar ao Melhor Envio.", { status: 502 });
  }
}
