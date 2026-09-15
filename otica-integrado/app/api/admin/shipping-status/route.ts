import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getValidMelhorEnvioToken } from "@/lib/melhorEnvio";
import { isRateLimited } from "@/lib/rateLimit";

/**
 * Diz pro painel admin se a cotação automática de frete (Melhor Envio) está
 * funcionando agora. Só responde pra quem estiver logado como admin — do
 * contrário, qualquer visitante poderia ficar batendo aqui e forçar
 * tentativas de renovação de token sem necessidade.
 */
export async function GET(request: Request) {
  if (isRateLimited(request, "shipping-status", { limit: 20, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
  }

  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!accessToken || !supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { data: isAdmin } = await userClient.rpc("is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const token = await getValidMelhorEnvioToken();
  return NextResponse.json({ connected: Boolean(token) });
}
