"use client";

/**
 * Lista de desejos (favoritos): funciona sem login (guardado no navegador,
 * igual ao carrinho) e, se a pessoa estiver logada, também sincroniza com o
 * Supabase (tabela `wishlist_items`) para não perder a lista ao trocar de
 * aparelho. Ao fazer login com itens já favoritados sem conta, eles são
 * enviados para a conta automaticamente (merge).
 */
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";

type WishlistContextType = {
  ids: string[];
  isSaved: (productId: string) => boolean;
  toggle: (productId: string) => void;
  hydrated: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const STORAGE_KEY = "otica-lider-wishlist";

function readLocal(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Sem espaço/local storage bloqueado: segue só em memória nesta sessão.
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // Carrega o que já existe no navegador assim que a página abre.
  useEffect(() => {
    setIds(readLocal());
    setHydrated(true);
  }, []);

  // Ao logar: junta o que estava salvo só no navegador com o que já existe na conta,
  // manda a diferença para o Supabase e passa a refletir a lista completa da conta.
  useEffect(() => {
    if (!hasSupabaseConfig) return;

    async function syncForUser(userId: string | null) {
      userIdRef.current = userId;
      if (!userId) return;

      const localIds = readLocal();
      const { data: remoteRows } = await supabase.from("wishlist_items").select("product_id").eq("user_id", userId);
      const remoteIds = (remoteRows ?? []).map((row) => row.product_id as string);
      const missingOnRemote = localIds.filter((id) => !remoteIds.includes(id));

      if (missingOnRemote.length > 0) {
        await supabase.from("wishlist_items").insert(missingOnRemote.map((productId) => ({ user_id: userId, product_id: productId })));
      }

      const merged = Array.from(new Set([...remoteIds, ...localIds]));
      setIds(merged);
      writeLocal(merged);
    }

    supabase.auth.getUser().then(({ data }) => syncForUser(data.user?.id ?? null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => syncForUser(session?.user?.id ?? null));
    return () => subscription.subscription.unsubscribe();
  }, []);

  function isSaved(productId: string) {
    return ids.includes(productId);
  }

  function toggle(productId: string) {
    setIds((current) => {
      const next = current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId];
      writeLocal(next);

      if (hasSupabaseConfig && userIdRef.current) {
        const userId = userIdRef.current;
        if (current.includes(productId)) {
          void supabase.from("wishlist_items").delete().eq("user_id", userId).eq("product_id", productId);
        } else {
          void supabase.from("wishlist_items").insert({ user_id: userId, product_id: productId });
        }
      }
      return next;
    });
  }

  return <WishlistContext.Provider value={{ ids, isSaved, toggle, hydrated }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist precisa estar dentro de WishlistProvider");
  return context;
}
