"use client";

import { useState } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";

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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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

    const { error } = await supabase.from("leads").insert({ name: name.trim(), whatsapp: digits, gender });

    if (error) {
      setStatus("error");
      setErrorMessage("Não foi possível concluir o cadastro. Tente novamente.");
      return;
    }

    setStatus("success");
    setName("");
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
      <div className="section-shell py-14 sm:py-20">
        <h2 className="max-w-2xl font-heading text-2xl font-bold uppercase leading-tight tracking-[-0.01em] text-brand-ink sm:text-3xl">
          Cadastre-se e receba novidades e promoções em primeira mão
        </h2>

        <form onSubmit={handleSubmit} className="mt-8 flex max-w-xl flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Digite o seu WhatsApp"
              value={whatsapp}
              onChange={(event) => setWhatsapp(formatWhatsApp(event.target.value))}
              className="w-full rounded-lg border border-brand-ink/15 bg-white px-4 py-3.5 font-body text-[15px] text-brand-ink outline-none placeholder:text-brand-ink/40 focus:border-brand-gold sm:flex-1"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 rounded-lg bg-brand-ink px-8 py-3.5 font-body text-[15px] font-medium text-brand-paper transition-colors hover:bg-brand-ink/85 disabled:opacity-60"
            >
              {status === "loading" ? "Enviando..." : "Enviar"}
            </button>
          </div>
          <input
            type="text"
            placeholder="Digite o seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-brand-ink/15 bg-white px-4 py-3.5 font-body text-[15px] text-brand-ink outline-none placeholder:text-brand-ink/40 focus:border-brand-gold"
          />
        </form>

        {errorMessage && <p className="mt-2 font-body text-sm text-red-600">{errorMessage}</p>}

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
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

        <p className="mt-8 max-w-2xl font-body text-sm leading-6 text-brand-ink/55">
          Ao cadastrar o seu WhatsApp, você concorda em receber novidades e promoções exclusivas,
          novas coleções e campanhas da Ótica Líder. Se mudar de ideia, você pode pedir para sair a
          qualquer momento.
        </p>
      </div>
    </section>
  );
}
