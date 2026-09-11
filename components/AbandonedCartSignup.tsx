"use client";

import { useEffect, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import { CartItem } from "@/types/product";

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function AbandonedCartSignup({ items }: { items: CartItem[] }) {
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(Date.now());
  useEffect(() => setStartedAt(Date.now()), []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (website || Date.now() - startedAt < 1200) return;
    const last = Number(localStorage.getItem("otica-abandoned-last-submit") || 0);
    if (Date.now() - last < 30000) { setStatus("error"); setMessage("Aguarde alguns segundos e tente novamente."); return; }
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) {
      setStatus("error");
      setMessage("Digite um WhatsApp válido, com DDD.");
      return;
    }
    if (!hasSupabaseConfig) {
      setStatus("error");
      setMessage("Cadastro indisponível no momento.");
      return;
    }
    setStatus("loading");
    const { data: existing } = await supabase.from("abandoned_carts").select("id").eq("whatsapp", digits).limit(1);
    if (existing && existing.length > 0) { setStatus("success"); setMessage("Já salvamos sua seleção. Nossa equipe pode separar os óculos para você."); return; }
    const { error } = await supabase.from("abandoned_carts").insert({
      whatsapp: digits,
      items: items.map(({ productId, slug, name, colorName, quantity, price }) => ({ productId, slug, name, colorName, quantity, price })),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    });
    if (error) {
      setStatus("error");
      setMessage("Não foi possível salvar. Tente novamente.");
      return;
    }
    localStorage.setItem("otica-abandoned-last-submit", String(Date.now()));
    setStatus("success");
    setMessage("Perfeito! Vamos separar sua seleção para você.");
    setWhatsapp("");
  }

  return (
    <div className="mt-6 border-t border-brand-paper/15 pt-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><MessageCircle size={17} fill="currentColor" /></span>
        <div>
          <h3 className="font-body text-[15px] font-semibold leading-5 text-brand-paper">Quer que a gente separe esse pedido caso você não finalize agora?</h3>
          <p className="mt-1 font-body text-[12px] leading-5 text-brand-paper/65">Deixe seu WhatsApp e nossa equipe guarda os óculos do seu carrinho.</p>
        </div>
      </div>
      {status === "success" ? (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-brand-moss/60 px-3 py-3 font-body text-[13px] text-brand-paper"><Check size={16} className="text-brand-gold" /> {message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} className="hidden" aria-hidden="true" />
          <input type="tel" inputMode="numeric" value={whatsapp} onChange={(event) => setWhatsapp(formatWhatsApp(event.target.value))} placeholder="(83) 99999-9999" aria-label="Seu WhatsApp" className="min-w-0 flex-1 rounded-xl border border-brand-paper/20 bg-brand-paper/10 px-3 py-3 font-body text-[13px] text-brand-paper outline-none placeholder:text-brand-paper/45 focus:border-brand-gold" />
          <button type="submit" disabled={status === "loading"} className="shrink-0 rounded-xl bg-brand-paper px-3 py-2 font-body text-[10px] font-bold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:bg-brand-gold hover:text-brand-paper disabled:opacity-60">{status === "loading" ? "Salvando" : "Salvar"}</button>
        </form>
      )}
      {status === "error" && <p className="mt-2 font-body text-[12px] text-red-200" role="alert">{message}</p>}
    </div>
  );
}
