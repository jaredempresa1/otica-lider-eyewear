import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { isRateLimited } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 *
 * O cadastro passou a ser por e-mail (antes era por WhatsApp).
 */
export async function POST(request: Request) {
  if (isRateLimited(request, "leads", { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco e tente de novo." }, { status: 429 });
  }

  let body: { name?: string; email?: string; gender?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
  const gender = body.gender === "masculino" || body.gender === "feminino" ? body.gender : null;

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Digite um e-mail válido." }, { status: 400 });
  }

  const { data: existing } = await supabase.from("leads").select("id").eq("email", email).limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from("leads").insert({ name, email, gender });
  if (error) {
    return NextResponse.json({ error: "Não foi possível concluir o cadastro." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (isRateLimited(request, "leads-delete", { limit: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco e tente de novo." }, { status: 429 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const { error } = await supabase.from("leads").delete().eq("email", email);
  if (error) {
    return NextResponse.json({ error: "Não foi possível remover o cadastro." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
