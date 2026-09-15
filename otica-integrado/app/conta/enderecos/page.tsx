"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { deleteAddress, EMPTY_ADDRESS, getMyAddresses, SavedAddress, saveMyAddress, setDefaultAddress } from "@/lib/address";
import { lookupCep } from "@/lib/viacep";

function addressLabel(address: SavedAddress) {
  return `${address.logradouro}, ${address.numero}${address.complemento ? ` — ${address.complemento}` : ""}`;
}

export default function EnderecosPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [address, setAddress] = useState<SavedAddress>(EMPTY_ADDRESS);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cepInvalid, setCepInvalid] = useState(false);
  const skipNextClearRef = useRef(false);

  async function loadAddresses() {
    const existing = await getMyAddresses();
    setAddresses(existing);
    if (existing.length > 0 && !editing) setAddress(existing[0]);
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/conta/entrar");
        return;
      }
      await loadAddresses();
      setChecking(false);
    });
  }, [router]);

  useEffect(() => {
    if (!editing) return;
    if (skipNextClearRef.current) {
      skipNextClearRef.current = false;
      return;
    }

    setCepInvalid(false);
    setAddress((current) => ({ ...current, logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }));
    const digits = address.cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    let cancelled = false;
    lookupCep(digits).then((result) => {
      if (cancelled) return;
      if (result.exists === false) {
        setCepInvalid(true);
        return;
      }
      if (result.address) {
        setAddress((current) => ({ ...current, logradouro: result.address!.logradouro, bairro: result.address!.bairro, cidade: result.address!.cidade, estado: result.address!.estado }));
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.cep, editing]);

  function startNewAddress() {
    setSaved(false);
    setCepInvalid(false);
    setAddress({ ...EMPTY_ADDRESS, is_default: addresses.length === 0 });
    setEditing(true);
  }

  function editAddress(item: SavedAddress) {
    skipNextClearRef.current = true;
    setSaved(false);
    setCepInvalid(false);
    setAddress({ ...item });
    setEditing(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (cepInvalid) return;
    setSaving(true);
    setSaved(false);
    const ok = await saveMyAddress(address);
    if (ok) {
      await loadAddresses();
      setEditing(false);
      setSaved(true);
    }
    setSaving(false);
  }

  async function handleSelect(id: string) {
    const ok = await setDefaultAddress(id);
    if (ok) await loadAddresses();
  }

  async function handleDelete(item: SavedAddress) {
    if (!item.id || !window.confirm("Excluir este endereço de entrega?")) return;
    const ok = await deleteAddress(item.id);
    if (ok) {
      await loadAddresses();
      if (address.id === item.id) setAddress(EMPTY_ADDRESS);
    }
  }

  if (checking) return null;

  return (
    <main className="section-shell min-h-[70vh] py-12 sm:py-16">
      <Link href="/conta" className="inline-flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/55 transition-colors hover:text-brand-gold">
        <ArrowLeft size={15} /> Minha conta
      </Link>

      <p className="eyebrow mt-6">Endereços de entrega</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-brand-ink sm:text-4xl">Meus endereços</h1>
      <p className="mt-2 max-w-xl font-body text-sm leading-6 text-brand-ink/60">
        Escolha o endereço que será usado automaticamente no checkout ou cadastre uma nova opção para suas compras.
      </p>

      <section className="mt-8 max-w-2xl">
        {addresses.length > 0 ? (
          <div className="grid gap-3">
            {addresses.map((item) => (
              <div key={item.id} className={`rounded-2xl border p-4 transition-colors ${item.is_default ? "border-brand-gold bg-brand-gold/5" : "border-brand-ink/12 bg-white"}`}>
                <div className="flex items-start gap-3">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                    <input type="radio" name="default-address" checked={Boolean(item.is_default)} onChange={() => item.id && handleSelect(item.id)} className="mt-1 h-4 w-4 accent-brand-gold" aria-label={`Selecionar endereço ${addressLabel(item)}`} />
                    <span className="min-w-0 font-body text-sm leading-6 text-brand-ink">
                      <span className="block font-semibold">{addressLabel(item)}</span>
                      <span className="block text-brand-ink/60">{item.bairro} · {item.cidade} - {item.estado} · CEP {item.cep}</span>
                      {item.is_default && <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-gold"><Check size={14} /> Endereço principal</span>}
                    </span>
                  </label>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => editAddress(item)} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink/50 transition-colors hover:bg-brand-sage hover:text-brand-ink" aria-label="Editar endereço"><Pencil size={15} /></button>
                    <button type="button" onClick={() => handleDelete(item)} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink/45 transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Excluir endereço"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-ink/15 bg-white px-5 py-8 text-center font-body text-sm text-brand-ink/55">Você ainda não tem endereços cadastrados.</div>
        )}

        {!editing && (
          <button type="button" onClick={startNewAddress} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition-colors hover:bg-brand-gold">
            <Plus size={17} /> Adicionar novo endereço
          </button>
        )}

        {editing && (
          <form onSubmit={handleSubmit} className="mt-7 grid gap-4 rounded-2xl border border-brand-ink/10 bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-brand-ink/10 pb-4">
              <h2 className="font-heading text-xl font-semibold text-brand-ink">{address.id ? "Editar endereço" : "Novo endereço"}</h2>
              <button type="button" onClick={() => setEditing(false)} className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/55 hover:text-brand-gold">Cancelar</button>
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">CEP</label>
              <input type="text" inputMode="numeric" required placeholder="00000-000" value={address.cep} onChange={(e) => setAddress((current) => ({ ...current, cep: e.target.value }))} className="mt-1.5 w-full max-w-[180px] rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
              {cepInvalid && <p className="mt-1.5 font-body text-sm font-semibold text-red-600">CEP inválido. Confira o número e tente de novo.</p>}
            </div>
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div><label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Rua</label><input type="text" required value={address.logradouro} onChange={(e) => setAddress((current) => ({ ...current, logradouro: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" /></div>
              <div><label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Número</label><input type="text" required value={address.numero} onChange={(e) => setAddress((current) => ({ ...current, numero: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" /></div>
            </div>
            <div><label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Complemento (opcional)</label><input type="text" value={address.complemento} onChange={(e) => setAddress((current) => ({ ...current, complemento: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" /></div>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_80px]"><div><label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Bairro</label><input type="text" required value={address.bairro} onChange={(e) => setAddress((current) => ({ ...current, bairro: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" /></div><div><label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Cidade</label><input type="text" required value={address.cidade} onChange={(e) => setAddress((current) => ({ ...current, cidade: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" /></div><div><label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">UF</label><input type="text" maxLength={2} required value={address.estado} onChange={(e) => setAddress((current) => ({ ...current, estado: e.target.value.toUpperCase() }))} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm uppercase outline-none focus:border-brand-gold" /></div></div>
            <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-brand-ink/75"><input type="checkbox" checked={Boolean(address.is_default)} onChange={(e) => setAddress((current) => ({ ...current, is_default: e.target.checked }))} className="h-4 w-4 accent-brand-gold" /> Usar como endereço principal</label>
            {saved && <p className="font-body text-sm text-green-700">Endereço salvo com sucesso.</p>}
            <button type="submit" disabled={saving || cepInvalid} className="mt-2 w-fit rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition-colors hover:bg-brand-gold disabled:opacity-60">{saving ? "Salvando..." : "Salvar endereço"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
