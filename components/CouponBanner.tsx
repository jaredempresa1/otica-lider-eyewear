"use client";

import { useEffect, useState } from "react";
import { Tag, X } from "lucide-react";

const STORAGE_KEY = "ol-coupon-dismissed";

export default function CouponBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function handleDismiss() {
    setVisible(false);
    window.localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div className="relative w-full border-b border-brand-gold/25 bg-brand-moss">
      <div className="section-shell flex items-center justify-center gap-2.5 py-2.5 pr-9 text-center sm:gap-3">
        <Tag size={15} className="shrink-0 text-brand-gold" strokeWidth={2} />
        <p className="font-body text-[11px] font-semibold uppercase leading-4 tracking-[0.06em] text-brand-paper sm:text-[12px]">
          <span className="block sm:inline">Cupom de desconto — primeira compra</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block text-brand-gold sm:inline">R$ 50 OFF</span>
        </p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fechar aviso de cupom"
        className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-brand-paper/60 transition-colors hover:bg-brand-paper/10 hover:text-brand-paper sm:right-6"
      >
        <X size={15} />
      </button>
    </div>
  );
}
