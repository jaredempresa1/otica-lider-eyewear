import { NextResponse } from "next/server";

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

  return NextResponse.redirect(new URL("/?melhor_envio=authorized", url));
}
