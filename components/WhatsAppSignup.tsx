"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      <section className="border-t border-brand-ink/10 bg-brand-paper">
        <div className="section-shell py-14 text-center sm:py-20">
          <h2 className="font-heading text-2xl font-semibold uppercase tracking-[-0.01em] text-brand-ink sm:text-3xl">
            Cadastro confirmado!
          </h2>
          <p className="mx-auto mt-3 max-w-md font-body text-sm leading-6 text-brand-ink/60">
            Em breve você recebe novidades e promoções exclusivas direto no seu WhatsApp.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-brand-ink/10 bg-brand-paper">
      <div className="section-shell py-14 text-center sm:py-20">
        <h2 className="mx-auto max-w-2xl font-heading text-lg font-bold uppercase leading-tight tracking-[-0.01em] text-brand-orange sm:text-xl">
          Cadastre-se e receba novidades e promoções em primeira mão
        </h2>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 text-left">
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} className="hidden" aria-hidden="true" />
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Digite o seu WhatsApp"
            value={whatsapp}
            onChange={(event) => setWhatsapp(formatWhatsApp(event.target.value))}
            className="w-full rounded-lg border border-brand-ink/15 bg-white px-4 py-3.5 font-body text-[15px] text-brand-ink outline-none placeholder:text-brand-ink/40 focus:border-brand-gold"
          />
          <input
            type="text"
            placeholder="Digite o seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-brand-ink/15 bg-white px-4 py-3.5 font-body text-[15px] text-brand-ink outline-none placeholder:text-brand-ink/40 focus:border-brand-gold"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full shrink-0 rounded-lg bg-brand-ink px-8 py-3.5 font-body text-[15px] font-medium text-brand-paper transition-colors hover:bg-brand-ink/85 disabled:opacity-60 sm:w-fit"
          >
            {status === "loading" ? "Enviando..." : "Enviar"}
          </button>
        </form>

        {errorMessage && <p className="mt-2 font-body text-sm text-red-600">{errorMessage}</p>}

        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {(["masculino", "feminino"] as Gender[]).map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                  gender === option ? "border-brand-ink" : "border-brand-ink/25"
                }`}
              >
                {gender === option && <span className="h-3 w-3 rounded-full bg-brand-ink" />}
              </span>
              <input
                type="radio"
                name="gender"
                value={option}
                checked={gender === option}
                onChange={() => setGender(option)}
                className="sr-only"
              />
              <span className="font-body text-[15px] text-brand-ink">
                {option === "masculino" ? "Masculino" : "Feminino"}
              </span>
            </label>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl font-body text-xs leading-5 text-brand-ink/55">
          Ao se cadastrar, você concorda em receber comunicações nos termos da nossa{" "}
          <Link href="/politica-de-privacidade" className="underline decoration-brand-ink/30 underline-offset-2 hover:text-brand-ink hover:decoration-brand-orange">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
