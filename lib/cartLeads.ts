/**
 * Captura opcional de WhatsApp na sacola, para o carrinho abandonado.
 *
 * Hoje o carrinho só existe no localStorage do navegador — o site não sabe o
 * contato de quem não fechou a compra. Este é o primeiro passo: perguntar o
 * WhatsApp na sacola ("quer que a gente separe esse pedido caso você não
 * finalize agora?") e salvar, junto com um retrato do carrinho no momento do
 * envio, para a equipe poder seguir manualmente pelo WhatsApp. O disparo de
 * mensagem automática em si fica para uma etapa futura.
 *
 * Tabela separada da `leads` (que é o cadastro geral da home) porque o
 * formato dos dados é diferente — aqui precisamos guardar os itens do
 * carrinho, não nome/gênero.
 *
 * IMPORTANTE: a tabela precisa existir no Supabase antes de usar. Rode isto
 * uma vez no SQL Editor do projeto:
 *
 *   create table if not exists cart_whatsapp_leads (
 *     id uuid primary key default gen_random_uuid(),
 *     whatsapp text not null,
 *     subtotal numeric not null,
 *     items jsonb not null,
 *     created_at timestamptz not null default now()
 *   );
 *
 *   alter table cart_whatsapp_leads enable row level security;
 *
 *   create policy "Permitir inserção pública de carrinho abandonado"
 *     on cart_whatsapp_leads for insert to anon with check (true);
 *
 *   create policy "Permitir leitura autenticada de carrinho abandonado"
 *     on cart_whatsapp_leads for select to authenticated using (true);
 */

import { supabase, hasSupabaseConfig } from "./supabaseClient";
import { CartItem } from "@/types/product";

export async function saveCartWhatsAppLead(whatsapp: string, items: CartItem[], subtotal: number): Promise<{ error: string | null }> {
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 10) return { error: "Digite um WhatsApp válido, com DDD." };
  if (!hasSupabaseConfig) return { error: "Indisponível no momento. Tente novamente mais tarde." };

  const { error } = await supabase.from("cart_whatsapp_leads").insert({
    whatsapp: digits,
    subtotal,
    items: items.map((item) => ({ name: item.name, colorName: item.colorName, price: item.price, quantity: item.quantity })),
  });

  if (error) return { error: "Não foi possível salvar agora. Tente novamente." };
  return { error: null };
}
