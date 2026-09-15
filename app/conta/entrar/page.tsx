"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/conta");
  }

  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-2xl border border-brand-ink/10 bg-brand-paper p-8 shadow-card">
        <p className="eyebrow text-center">Ótica Líder Eyewear</p>
        <h1 className="mt-2 text-center font-heading text-2xl font-semibold text-brand-ink">Entrar na minha conta</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold"
            />
          </div>

          {error && <p className="font-body text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="mt-2 rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition-colors hover:bg-brand-gold disabled:opacity-60">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-sm text-brand-ink/60">
          Ainda não tem conta?{" "}
          <Link href="/conta/cadastro" className="font-semibold text-brand-ink underline decoration-brand-gold underline-offset-4">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
