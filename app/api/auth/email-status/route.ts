import { NextResponse } from "next/server";
import { supabaseAdmin, hasSupabaseAdminConfig } from "@/lib/supabaseAdmin";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: Request) {
  if (isRateLimited(request, "auth-email-status", { limit: 12, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um minuto e tente novamente." }, { status: 429 });
  }

  if (!hasSupabaseAdminConfig) {
    return NextResponse.json({ error: "Consulta de contas indisponível." }, { status: 503 });
  }

  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    console.error("Falha ao consultar e-mail no Supabase:", error.message);
    return NextResponse.json({ error: "Não foi possível consultar a conta agora." }, { status: 502 });
  }

  const exists = data.users.some((user) => user.email?.trim().toLowerCase() === normalizedEmail);
  return NextResponse.json({ exists });
}
