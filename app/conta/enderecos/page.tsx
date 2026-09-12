"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { EMPTY_ADDRESS, getMyAddress, saveMyAddress, SavedAddress } from "@/lib/address";
import { fetchAddressByCep } from "@/lib/viacep";

export default function EnderecosPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [address, setAddress] = useState<SavedAddress>(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/conta/entrar");
        return;
      }
      const existing = await getMyAddress();
      if (existing) setAddress(existing);
      setChecking(false);
    });
  }, [router]);

  // Preenche rua/bairro/cidade automaticamente quando o CEP fica completo.
  // Sempre que o CEP muda, esses campos são atualizados para o CEP novo —
  // só número e complemento continuam como o cliente digitou.
  useEffect(() => {
    const digits = address.cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    let cancelled = false;
    fetchAddressByCep(digits).then((found) => {
      if (cancelled || !found) return;
      setAddress((current) => ({
        ...current,
        logradouro: found.logradouro || current.logradouro,
        bairro: found.bairro || current.bairro,
        cidade: found.cidade || current.cidade,
        estado: found.estado || current.estado,
      }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.cep]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    const ok = await saveMyAddress(address);
    setSaving(false);
    setSaved(ok);
  }

  if (checking) return null;

  return (
    <main className="section-shell min-h-[70vh] py-12 sm:py-16">
      <Link href="/conta" className="inline-flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/55 transition-colors hover:text-brand-gold">
        <ArrowLeft size={15} /> Minha conta
      </Link>

      <p className="eyebrow mt-6">Endereço de entrega</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-brand-ink sm:text-4xl">Meu endereço</h1>
      <p className="mt-2 max-w-md font-body text-sm leading-6 text-brand-ink/60">
        Salve seu endereço aqui uma vez e ele já vem preenchido automaticamente na próxima vez que você for finalizar uma compra.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid max-w-lg gap-4">
        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">CEP</label>
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="00000-000"
            value={address.cep}
            onChange={(e) => setAddress((current) => ({ ...current, cep: e.target.value }))}
            className="mt-1.5 w-full max-w-[180px] rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Rua</label>
            <input type="text" required value={address.logradouro} onChange={(e) => setAddress((current) => ({ ...current, logradouro: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Número</label>
            <input type="text" required value={address.numero} onChange={(e) => setAddress((current) => ({ ...current, numero: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
          </div>
        </div>
        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Complemento (opcional)</label>
          <input type="text" value={address.complemento} onChange={(e) => setAddress((current) => ({ ...current, complemento: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
        </div>
        <div className="grid grid-cols-[1fr_1fr_80px] gap-3">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Bairro</label>
            <input type="text" required value={address.bairro} onChange={(e) => setAddress((current) => ({ ...current, bairro: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Cidade</label>
            <input type="text" required value={address.cidade} onChange={(e) => setAddress((current) => ({ ...current, cidade: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">UF</label>
            <input type="text" maxLength={2} required value={address.estado} onChange={(e) => setAddress((current) => ({ ...current, estado: e.target.value.toUpperCase() }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm uppercase outline-none focus:border-brand-gold" />
          </div>
        </div>

        {saved && <p className="font-body text-sm text-green-700">Endereço salvo! Ele já vai aparecer pronto na sua próxima compra.</p>}

        <button type="submit" disabled={saving} className="mt-2 w-fit rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition-colors hover:bg-brand-gold disabled:opacity-60">
          {saving ? "Salvando..." : "Salvar endereço"}
        </button>
      </form>
    </main>
  );
}
