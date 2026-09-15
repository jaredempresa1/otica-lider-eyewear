import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { isRateLimited } from "@/lib/rateLimit";

/**
 * Antes, o formulário de WhatsApp da home inseria direto no Supabase pelo
 * navegador. Isso funciona, mas como a chave usada ali é pública, qualquer
 * pessoa também consegue chamar o Supabase diretamente (sem passar pelo
 * site) e nesse caso as proteções que já existiam no formulário (o campo
 * "isca" escondido e o tempo mínimo de preenchimento) não valem nada,
 * porque elas rodam só no navegador.
 *
 * Movendo a inserção pra uma rota do nosso servidor, conseguimos aplicar um
 * limite de requisições por IP que vale de verdade, não importa por onde a
 * tentativa de cadastro chegue.
 */
export async function POST(request: Request) {
  if (isRateLimited(request, "leads", { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco e tente de novo." }, { status: 429 });
  }

  let body: { name?: string; whatsapp?: string; gender?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const digits = typeof body.whatsapp === "string" ? body.whatsapp.replace(/\D/g, "") : "";
  const gender = body.gender === "masculino" || body.gender === "feminino" ? body.gender : null;

  if (!name || digits.length < 10 || digits.length > 11) {
    return NextResponse.json({ error: "Preencha nome e WhatsApp válidos." }, { status: 400 });
  }

  const { data: existing } = await supabase.from("leads").select("id").eq("whatsapp", digits).limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from("leads").insert({ name, whatsapp: digits, gender });
  if (error) {
    return NextResponse.json({ error: "Não foi possível concluir o cadastro." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
