"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Quando o cliente clica no link do e-mail, o Supabase já cria uma
    // sessão temporária de recuperação nesta página. Só confirmamos que
    // essa sessão existe antes de deixar redefinir a senha.
    supabase.auth.getSession().then(({ data }) => {
      setReady(true);
      if (!data.session) setInvalidLink(true);
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas digitadas são diferentes.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Não deu pra atualizar a senha agora. Peça um novo link e tente de novo.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/conta"), 1800);
  }

  if (!ready) return null;

  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-2xl border border-brand-ink/10 bg-brand-paper p-8 shadow-card">
        <p className="eyebrow text-center">Ótica Líder Eyewear</p>
        <h1 className="mt-2 text-center font-heading text-2xl font-semibold text-brand-ink">Criar nova senha</h1>

        {invalidLink ? (
          <p className="mt-6 text-center font-body text-sm leading-6 text-brand-ink/60">
            Esse link de redefinição não é mais válido — pode já ter sido usado ou expirado. Peça um novo link na tela de login.
          </p>
        ) : success ? (
          <p className="mt-6 text-center font-body text-sm text-green-700">Senha atualizada! Levando você para a sua conta...</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Nova senha</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Confirme a nova senha</label>
              <input type="password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
            </div>

            {error && <p className="font-body text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className="mt-2 rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition-colors hover:bg-brand-gold disabled:opacity-60">
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
