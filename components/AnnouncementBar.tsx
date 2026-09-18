"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Entregamos para todo o Brasil",
  "Frete Grátis - João Pessoa e compras acima de R$500",
  "Parcelamento em até 10x no cartão",
  "Ótica Desde 1999",
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-brand-gold py-2.5 text-center font-body text-[9.5px] font-semibold uppercase tracking-[0.06em] text-brand-paper sm:py-3 sm:text-sm sm:tracking-[0.16em]">
      <span className="whitespace-nowrap px-3">{MESSAGES[index]}</span>
    </div>
  );
}
