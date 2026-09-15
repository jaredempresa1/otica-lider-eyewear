import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { isRateLimited } from "@/lib/rateLimit";

type CartItemInput = {
  productId?: string;
  slug?: string;
  name?: string;
  colorName?: string;
  quantity?: number;
  price?: number;
};

export async function POST(request: Request) {
  if (isRateLimited(request, "abandoned-carts", { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco e tente de novo." }, { status: 429 });
  }

  let body: { whatsapp?: string; items?: CartItemInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const digits = typeof body.whatsapp === "string" ? body.whatsapp.replace(/\D/g, "") : "";
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (digits.length < 10 || digits.length > 11 || rawItems.length === 0 || rawItems.length > 50) {
    return NextResponse.json({ error: "Dados do carrinho inválidos." }, { status: 400 });
  }

  const items = rawItems.map((item) => ({
    productId: typeof item.productId === "string" ? item.productId.slice(0, 100) : "",
    slug: typeof item.slug === "string" ? item.slug.slice(0, 200) : "",
    name: typeof item.name === "string" ? item.name.slice(0, 200) : "",
    colorName: typeof item.colorName === "string" ? item.colorName.slice(0, 100) : "",
    quantity: Number.isFinite(Number(item.quantity)) ? Math.max(1, Math.min(20, Math.round(Number(item.quantity)))) : 1,
    price: Number.isFinite(Number(item.price)) ? Math.max(0, Math.min(100_000, Number(item.price))) : 0,
  }));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const { data: existing } = await supabase.from("abandoned_carts").select("id").eq("whatsapp", digits).limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, alreadySaved: true });
  }

  const { error } = await supabase.from("abandoned_carts").insert({ whatsapp: digits, items, total });
  if (error) {
    return NextResponse.json({ error: "Não foi possível salvar." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
