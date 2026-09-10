"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
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

    router.push("/admin/dashboard");
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col justify-center px-5 py-24">
      <h1 className="mb-6 text-center font-heading text-2xl font-bold text-brand-black">
        Painel Ótica Líder
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-body text-xs font-medium text-brand-black/70">
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border border-black/15 px-3 py-2 font-body text-sm outline-none focus:border-brand-orange"
          />
        </div>
        <div>
          <label className="font-body text-xs font-medium text-brand-black/70">
            Senha
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-sm border border-black/15 px-3 py-2 font-body text-sm outline-none focus:border-brand-orange"
          />
        </div>

        {error && <p className="font-body text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-brand mt-2">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center font-body text-xs text-brand-black/50">
        Acesso restrito. O login é criado direto no painel do Supabase.
      </p>
    </main>
  );
}
