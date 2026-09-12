"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ContaPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/conta/entrar");
        return;
      }
      setName((data.user.user_metadata?.full_name as string) || "");
      setEmail(data.user.email ?? "");
      setChecking(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (checking) return null;

  return (
    <main className="section-shell min-h-[70vh] py-12 sm:py-16">
      <p className="eyebrow">Minha conta</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-brand-ink sm:text-4xl">
        Olá{name ? `, ${name.split(" ")[0]}` : ""}!
      </h1>
      <p className="mt-2 font-body text-sm text-brand-ink/60">{email}</p>

      <div className="mt-8 max-w-lg rounded-2xl border border-brand-ink/10 bg-brand-paper p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-ink">Meus pedidos</h2>
        <p className="mt-2 font-body text-sm leading-6 text-brand-ink/60">
          Em breve você vai acompanhar seus pedidos direto por aqui. Por enquanto, qualquer dúvida sobre uma compra é só chamar no WhatsApp.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/produtos" className="rounded-xl border border-brand-ink/15 px-5 py-2.5 font-body text-sm font-semibold uppercase tracking-[0.08em] text-brand-ink transition-colors hover:border-brand-gold">
          Ver catálogo
        </Link>
        <button onClick={handleLogout} className="rounded-xl border border-brand-ink/15 px-5 py-2.5 font-body text-sm font-semibold uppercase tracking-[0.08em] text-brand-ink/60 transition-colors hover:border-red-300 hover:text-red-600">
          Sair da conta
        </button>
      </div>
    </main>
  );
}
