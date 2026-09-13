"use client";

import { createContext, useContext, useState, FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import WhatsAppSignup from "@/components/WhatsAppSignup";

type ModalView = "closed" | "login" | "cadastro";

type AuthModalContextValue = {
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal precisa estar dentro de AuthModalProvider");
  return ctx;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ModalView>("closed");

  const value: AuthModalContextValue = {
    openLogin: () => setView("login"),
    openSignup: () => setView("cadastro"),
    close: () => setView("closed"),
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {view !== "closed" && <AuthModal view={view} onClose={() => setView("closed")} onSwitchView={setView} />}
    </AuthModalContext.Provider>
  );
}

function SecureBar() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-brand-ink/10 bg-brand-paper py-2.5">
      <Lock size={13} strokeWidth={2} className="text-brand-ink/50" />
      <span className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">Site seguro</span>
    </div>
  );
}

function AuthModal({ view, onClose, onSwitchView }: { view: Exclude<ModalView, "closed">; onClose: () => void; onSwitchView: (view: ModalView) => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="my-0 w-full overflow-hidden bg-brand-paper shadow-2xl sm:my-auto sm:max-w-md sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-brand-ink px-5 py-4">
          <span className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-brand-paper">
            {view === "login" ? "Identificação" : "Cadastro"}
          </span>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-brand-paper/80 transition-colors hover:text-brand-gold">
            <X size={20} />
          </button>
        </div>

        <SecureBar />

        {view === "login" ? <LoginForm onClose={onClose} onSwitchView={onSwitchView} /> : <CadastroForm onClose={onClose} onSwitchView={onSwitchView} />}
      </div>
    </div>
  );
}

function LoginForm({ onClose, onSwitchView }: { onClose: () => void; onSwitchView: (view: ModalView) => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    onClose();
    router.push("/conta");
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Digite seu e-mail acima para recuperar a senha.");
      return;
    }
    setError(null);
    await supabase.auth.resetPasswordForEmail(email.trim());
    setNotice("Se esse e-mail tiver uma conta, enviamos um link para redefinir a senha.");
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">E-mail</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
        </div>
        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Senha</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
        </div>

        <button type="button" onClick={handleForgotPassword} className="-mt-1 self-end font-body text-xs text-brand-ink/60 underline decoration-brand-ink/30 underline-offset-4 hover:text-brand-gold">
          Esqueci minha senha
        </button>

        {error && <p className="font-body text-sm text-red-600">{error}</p>}
        {notice && <p className="font-body text-sm text-green-700">{notice}</p>}

        <button type="submit" disabled={loading} className="mt-1 rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition-colors hover:bg-brand-gold disabled:opacity-60">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-6 border-t border-brand-ink/10 pt-5 text-center">
        <p className="font-body text-sm text-brand-ink/60">Novo por aqui?</p>
        <button type="button" onClick={() => onSwitchView("cadastro")} className="mt-3 w-full rounded-xl border border-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper">
          Quero me cadastrar
        </button>
      </div>
    </div>
  );
}

function CadastroForm({ onClose, onSwitchView }: { onClose: () => void; onSwitchView: (view: ModalView) => void }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!acceptedPrivacy) {
      setError("Você precisa estar ciente da Política de Privacidade para continuar.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });

    setLoading(false);

    if (error) {
      setError(error.message.includes("already registered") ? "Esse e-mail já tem uma conta. Tente entrar." : "Não deu pra criar sua conta agora. Tente de novo em instantes.");
      return;
    }

    if (data.session) {
      onClose();
      router.push("/conta");
      return;
    }

    setSuccess("Conta criada! Verifique seu e-mail (" + email + ") e clique no link de confirmação para poder entrar.");
  }

  return (
    <div className="p-6">
      {success ? (
        <div className="rounded-xl border border-green-600/20 bg-green-50 p-4 text-center font-body text-sm text-green-700">{success}</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Nome</label>
              <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Sobrenome</label>
              <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
            </div>
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-brand-ink/60">Senha</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-brand-ink/15 px-3.5 py-2.5 font-body text-sm outline-none focus:border-brand-gold" />
          </div>

          <label className="flex items-start gap-2.5 font-body text-xs leading-5 text-brand-ink/70">
            <input type="checkbox" checked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-ink" />
            <span>
              Estou ciente da{" "}
              <Link href="/politica-de-privacidade" onClick={onClose} className="font-semibold text-brand-ink underline decoration-brand-gold underline-offset-4">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>

          {error && <p className="font-body text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="mt-1 rounded-xl bg-brand-ink px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-brand-paper transition-colors hover:bg-brand-gold disabled:opacity-60">
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center font-body text-sm text-brand-ink/60">
        Já tem conta?{" "}
        <button type="button" onClick={() => onSwitchView("login")} className="font-semibold text-brand-ink underline decoration-brand-gold underline-offset-4">
          Entrar
        </button>
      </p>

      {!success && (
        <div className="-mx-6 -mb-6 mt-8">
          <WhatsAppSignup />
        </div>
      )}
    </div>
  );
}
