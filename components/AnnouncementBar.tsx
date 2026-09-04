"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Entregamos para todo o Brasil",
  "Frete grátis para João Pessoa e Goiana",
  "25 anos de experiência em ótica",
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
    <div className="w-full bg-brand-gold py-2 text-center font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-paper sm:text-xs">
      {MESSAGES[index]}
    </div>
  );
}
