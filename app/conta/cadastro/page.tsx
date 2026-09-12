"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    setLoading(false);

    if (error) {
      setError(error.message.includes("already registered") ? "Esse e-mail já tem uma conta. Tente entrar." : "Não deu pra criar sua conta agora. Tente de novo em instantes.");
      return;
    }

    // Se já veio uma sessão ativa, a confirmação de e-mail está desligada
    // e o usuário já pode entrar direto.
    if (data.session) {
      router.push("/conta");
      return;
    }

    // Caso contrário, o Supabase exige confirmar o e-mail antes de logar.
    setSuccess("Conta criada! Verifique seu e-mail (" + email + ") e clique no link de confirmação para poder entrar.");
  }

  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-2xl border border-brand-ink/10 bg-brand-paper p-8 shadow-card">
        <p className="eyebrow text-center">Ótica Líder Eyewear</p>
        <h1 className="mt-2 text-center font-heading text-2xl font-semibold text-brand-ink">Criar minha conta</h1>

        {success ? (
          <div className="mt-6 rounded-xl border border-green-600/20 bg-green-50 p-4 text-center font-body text-sm text-green-700">
            {success}
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold"
            />
          </div>

          {error && <p className="font-body text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="mt-2 rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition-colors hover:bg-brand-gold disabled:opacity-60">
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
        )}

        <p className="mt-6 text-center font-body text-sm text-brand-ink/60">
          Já tem conta?{" "}
          <Link href="/conta/entrar" className="font-semibold text-brand-ink underline decoration-brand-gold underline-offset-4">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
