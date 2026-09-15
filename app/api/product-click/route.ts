import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.id || !body?.slug || !body?.name) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
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
