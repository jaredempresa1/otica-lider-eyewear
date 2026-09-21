"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type SideMenuContextValue = {
  isMounted: boolean;
  isVisible: boolean;
  open: () => void;
  close: () => void;
};

const SideMenuContext = createContext<SideMenuContextValue | null>(null);

/** Estado do menu lateral (gaveta de navegação) compartilhado entre o Header
 * e outros componentes que precisam abri-lo, como o botão de hambúrguer
 * dentro do carrinho. */
export function useSideMenu() {
  const ctx = useContext(SideMenuContext);
  if (!ctx) throw new Error("useSideMenu precisa estar dentro de SideMenuProvider");
  return ctx;
}

export function SideMenuProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  function open() {
    setIsMounted(true);
  }

  function close() {
    setIsVisible(false);
    window.setTimeout(() => setIsMounted(false), 320);
  }

  useEffect(() => {
    if (!isMounted) return;
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [isMounted]);

  return <SideMenuContext.Provider value={{ isMounted, isVisible, open, close }}>{children}</SideMenuContext.Provider>;
}
