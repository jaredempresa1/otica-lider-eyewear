"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getMyAddress, SavedAddress } from "@/lib/address";

type Tab = "pedidos" | "perfil";

export default function ContaPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("pedidos");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<SavedAddress | null>(null);
  const [marketingEmailOptIn, setMarketingEmailOptIn] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/conta/entrar");
        return;
      }
      const fullName = (data.user.user_metadata?.full_name as string) || "";
      const [first, ...rest] = fullName.trim().split(" ").filter(Boolean);
      setFirstName(first || "");
      setLastName(rest.join(" "));
      setEmail(data.user.email ?? "");
      setMarketingEmailOptIn(Boolean(data.user.user_metadata?.marketing_email_opt_in));
      setAddress(await getMyAddress());
      setChecking(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function openEditName() {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setNameError(null);
    setEditingName(true);
  }

  async function handleSaveName(event: React.FormEvent) {
    event.preventDefault();
    if (!editFirstName.trim()) {
      setNameError("Digite pelo menos o nome.");
      return;
    }
    setSavingName(true);
    setNameError(null);
    const fullName = `${editFirstName.trim()} ${editLastName.trim()}`.trim();
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    setSavingName(false);
    if (error) {
      setNameError("Não foi possível salvar agora. Tente de novo em instantes.");
      return;
    }
    setFirstName(editFirstName.trim());
    setLastName(editLastName.trim());
    setEditingName(false);
  }

  async function handleToggleMarketingEmail() {
    const next = !marketingEmailOptIn;
    setMarketingEmailOptIn(next);
    setSavingPreference(true);
    const { error } = await supabase.auth.updateUser({ data: { marketing_email_opt_in: next } });
    setSavingPreference(false);
    if (error) {
      // Não deu pra salvar: volta o toggle pro estado anterior.
      setMarketingEmailOptIn(!next);
    }
  }

  if (checking) return null;

  const initial = (firstName || email || "?").trim().charAt(0).toUpperCase();

  return (
    <main className="section-shell min-h-[70vh] max-w-xl py-10 sm:py-14">
      <div className="flex items-center justify-between gap-3 pb-6">
        <p className="font-heading text-xl font-semibold tracking-[-0.02em] text-brand-ink">Ótica Líder Brasil</p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-ink/15 bg-brand-paper font-body text-sm font-semibold text-brand-ink">
          {initial}
        </span>
      </div>

      <div className="flex gap-6 border-b border-brand-ink/10">
        <button
          type="button"
          onClick={() => setTab("pedidos")}
          className={`-mb-px border-b-2 px-1 pb-3 font-body text-[15px] font-medium transition-colors ${
            tab === "pedidos" ? "border-brand-ink text-brand-ink" : "border-transparent text-brand-ink/45 hover:text-brand-ink"
          }`}
        >
          Pedidos
        </button>
        <button
          type="button"
          onClick={() => setTab("perfil")}
          className={`-mb-px border-b-2 px-1 pb-3 font-body text-[15px] font-medium transition-colors ${
            tab === "perfil" ? "border-brand-ink text-brand-ink" : "border-transparent text-brand-ink/45 hover:text-brand-ink"
          }`}
        >
          Perfil
        </button>
      </div>

      {tab === "pedidos" ? (
        <div className="mt-6 rounded-2xl border border-brand-ink/10 bg-brand-paper p-6">
          <h2 className="font-heading text-xl font-semibold text-brand-ink">
            Boas-vindas, {(firstName || "por aqui").toUpperCase()}
          </h2>
          <p className="mt-1 font-body text-sm text-brand-ink/60">Tudo pronto para comprar?</p>
          <Link
            href="/produtos"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold text-brand-paper transition-colors hover:bg-brand-gold"
          >
            Comprar agora
          </Link>
          <p className="mt-6 border-t border-brand-ink/10 pt-4 font-body text-xs leading-5 text-brand-ink/50">
            Em breve você vai acompanhar seus pedidos direto por aqui. Por enquanto, qualquer dúvida sobre uma compra é só chamar no WhatsApp.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {/* Nome */}
          <div className="rounded-2xl border border-brand-ink/10 bg-brand-paper p-5">
            {editingName ? (
              <form onSubmit={handleSaveName} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">Nome</label>
                    <input
                      type="text"
                      required
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-brand-ink/15 px-3 py-2 font-body text-sm outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">Sobrenome</label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-brand-ink/15 px-3 py-2 font-body text-sm outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>
                {nameError && <p className="font-body text-xs text-red-600">{nameError}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingName}
                    className="rounded-lg bg-brand-ink px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.08em] text-brand-paper transition-colors hover:bg-brand-gold disabled:opacity-60"
                  >
                    {savingName ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingName(false)}
                    className="rounded-lg border border-brand-ink/15 px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink/60 transition-colors hover:border-brand-ink"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="font-body text-[15px] font-semibold uppercase tracking-[0.02em] text-brand-ink">
                  {firstName ? `${firstName} ${lastName}`.trim() : "Sem nome cadastrado"}
                </p>
                <button
                  type="button"
                  onClick={openEditName}
                  className="shrink-0 rounded-full border border-brand-ink/20 px-4 py-1.5 font-body text-xs font-semibold text-brand-ink transition-colors hover:border-brand-ink"
                >
                  Editar
                </button>
              </div>
            )}
          </div>

          {/* E-mail (somente leitura) */}
          <div className="rounded-2xl border border-brand-ink/10 bg-brand-paper p-5">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-ink/45">E-mail</p>
            <p className="mt-1 font-body text-[15px] text-brand-ink">{email}</p>
          </div>

          {/* Endereços */}
          <div className="rounded-2xl border border-brand-ink/10 bg-brand-paper p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-body text-[15px] font-semibold text-brand-ink">Endereços</p>
              <Link
                href="/conta/enderecos"
                className="shrink-0 rounded-full border border-brand-ink/20 px-4 py-1.5 font-body text-xs font-semibold text-brand-ink transition-colors hover:border-brand-ink"
              >
                {address ? "Editar" : "Adicionar"}
              </Link>
            </div>
            {address ? (
              <p className="mt-3 font-body text-sm leading-6 text-brand-ink/60">
                {address.logradouro}, {address.numero}
                {address.complemento ? ` — ${address.complemento}` : ""}
                <br />
                {address.bairro} · {address.cidade} - {address.estado} · CEP {address.cep}
              </p>
            ) : (
              <p className="mt-3 font-body text-sm text-brand-ink/45">Nenhum endereço adicionado</p>
            )}
          </div>

          {/* Preferências de marketing */}
          <div className="rounded-2xl border border-brand-ink/10 bg-brand-paper p-5">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span className="font-body text-[14px] text-brand-ink">Receber novidades e ofertas para mim por e-mail</span>
              <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                <input
                  type="checkbox"
                  checked={marketingEmailOptIn}
                  onChange={handleToggleMarketingEmail}
                  disabled={savingPreference}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-brand-ink/20 transition-colors peer-checked:bg-brand-ink" />
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-brand-ink/15 px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.08em] text-brand-ink/60 transition-colors hover:border-red-300 hover:text-red-600"
          >
            Sair
          </button>
        </div>
      )}
    </main>
  );
}
