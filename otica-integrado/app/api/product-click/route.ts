import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isRateLimited } from "@/lib/rateLimit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // No máximo 30 cliques registrados por IP a cada minuto — o suficiente
  // pra qualquer visitante real, mas barra um script tentando inflar as
  // métricas de "produtos mais clicados" do dashboard.
  if (isRateLimited(request, "product-click", { limit: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 });
  }

  try {
    const body = await request.json();
    if (
      typeof body?.id !== "string" || !UUID_RE.test(body.id) ||
      typeof body?.slug !== "string" || !body.slug.trim() || body.slug.length > 200 ||
      typeof body?.name !== "string" || !body.name.trim() || body.name.length > 200
    ) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("product_clicks").insert({ product_id: body.id, product_slug: body.slug, product_name: body.name });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível registrar o clique" }, { status: 400 });
  }
}
