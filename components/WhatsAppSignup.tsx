"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User, Phone } from "lucide-react";
import { hasSupabaseConfig } from "@/lib/supabaseClient";

type Gender = "masculino" | "feminino";
type Status = "idle" | "loading" | "success" | "error";

function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function WhatsAppSignup() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState(Date.now());
  useEffect(() => setStartedAt(Date.now()), []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (website || Date.now() - startedAt < 1800) return;
    const last = Number(localStorage.getItem("otica-lead-last-submit") || 0);
    if (Date.now() - last < 30000) { setStatus("error"); setErrorMessage("Aguarde alguns segundos e tente novamente."); return; }
    const digits = whatsapp.replace(/\D/g, "");

    if (!name.trim()) {
      setStatus("error");
      setErrorMessage("Digite o seu nome.");
      return;
    }

    if (digits.length < 10) {
      setStatus("error");
      setErrorMessage("Digite um WhatsApp válido, com DDD.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    if (!hasSupabaseConfig) {
      setStatus("error");
      setErrorMessage("Cadastro indisponível no momento. Tente novamente mais tarde.");
      return;
    }

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), whatsapp: digits, gender }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setStatus("error");
      setErrorMessage(data.error || "Não foi possível concluir o cadastro. Tente novamente.");
      return;
    }

    localStorage.setItem("otica-lead-last-submit", String(Date.now()));
    setStatus("success");
    setName("")
    setWhatsapp("");
    setGender(null);
  }

  if (status === "success") {
    return (
      <section className="border-t border-brand-logo-orange-dark bg-brand-logo-orange">
        <div className="section-shell py-14 text-center sm:py-20">
          <h2 className="font-heading text-2xl font-semibold uppercase tracking-[-0.01em] text-white sm:text-3xl">
            Cadastro confirmado!
          </h2>
          <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-white/80">
            Em breve você recebe novidades e promoções exclusivas direto no seu WhatsApp.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-brand-logo-orange-dark bg-brand-logo-orange">
      <div className="section-shell py-14 text-center sm:py-20">
        <h2 className="mx-auto max-w-2xl font-heading text-lg font-bold uppercase leading-tight tracking-[-0.01em] text-white sm:text-xl">
          Cadastre-se e receba lançamentos e ofertas!
        </h2>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 text-left">
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} className="hidden" aria-hidden="true" />
          <div className="relative">
            <User size={18} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-logo-orange/70" aria-hidden="true" />
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-transparent bg-white py-3.5 pl-12 pr-4 font-body text-[15px] text-brand-ink outline-none placeholder:text-brand-ink/40 focus:border-brand-ink/30"
            />
          </div>
          <div className="relative">
            <Phone size={18} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-logo-orange/70" aria-hidden="true" />
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Número de WhatsApp"
              value={whatsapp}
              onChange={(event) => setWhatsapp(formatWhatsApp(event.target.value))}
              className="w-full rounded-lg border border-transparent bg-white py-3.5 pl-12 pr-4 font-body text-[15px] text-brand-ink outline-none placeholder:text-brand-ink/40 focus:border-brand-ink/30"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full shrink-0 rounded-lg border-2 border-white bg-transparent px-8 py-3.5 font-body text-[15px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-white hover:text-brand-logo-orange disabled:opacity-60"
          >
            {status === "loading" ? "Enviando..." : "Cadastrar"}
          </button>
        </form>

        {errorMessage && <p className="mt-2 font-body text-sm text-white">{errorMessage}</p>}

        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {(["masculino", "feminino"] as Gender[]).map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                  gender === option ? "border-white" : "border-white/40"
                }`}
              >
                {gender === option && <span className="h-3 w-3 rounded-full bg-white" />}
              </span>
              <input
                type="radio"
                name="gender"
                value={option}
                checked={gender === option}
                onChange={() => setGender(option)}
                className="sr-only"
              />
              <span className="font-body text-[15px] text-white">
                {option === "masculino" ? "Masculino" : "Feminino"}
              </span>
            </label>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl font-body text-xs leading-5 text-white/80">
          Ao se cadastrar, você concorda em receber comunicações nos termos da nossa{" "}
          <Link href="/politica-de-privacidade" className="underline decoration-white/40 underline-offset-2 hover:text-white hover:decoration-white">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
