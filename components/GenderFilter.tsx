"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const FILTERS = [
  { value: "", short: "Ó", label: "Óculos", desktopLabel: "Todos os óculos" },
  { value: "masculino", short: "M", label: "Masculino", desktopLabel: "Masculino" },
  { value: "feminino", short: "F", label: "Feminino", desktopLabel: "Feminino" },
];

export default function GenderFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const current = searchParams.get("genero") ?? "";
  const selected = FILTERS.find((filter) => filter.value === current) ?? FILTERS[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("genero", value);
    } else {
      params.delete("genero");
    }

    const query = params.toString();
    setIsOpen(false);
    router.replace(`${pathname}${query ? `?${query}` : ""}#catalogo`, { scroll: false });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Filtrar por público: ${selected.label}`}
        className="flex h-8 items-center gap-2 rounded-full border border-brand-ink/10 bg-brand-paper px-3 font-body text-[11px] font-medium normal-case tracking-[0.04em] text-brand-ink/65 transition-colors hover:border-brand-gold focus:border-brand-gold focus:outline-none"
      >
        <span className="font-semibold uppercase sm:hidden">{selected.short}</span>
        <span className="hidden normal-case sm:inline">{selected.desktopLabel}</span>
        <span aria-hidden="true" className={`text-brand-ink/45 transition-transform ${isOpen ? "rotate-180" : ""}`}>
         ⌄
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Filtrar óculos por público"
          className="absolute right-0 top-10 z-20 min-w-[168px] overflow-hidden rounded-2xl border border-brand-ink/10 bg-brand-cream p-1.5 shadow-soft"
        >
          {FILTERS.map((filter) => {
            const isSelected = filter.value === selected.value;
            return (
              <button
                key={filter.value || "todos"}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleChange(filter.value)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-body text-xs normal-case transition-colors ${
                  isSelected
                    ? "bg-brand-gold/10 font-semibold text-brand-ink"
                    : "text-brand-ink/65 hover:bg-brand-paper hover:text-brand-ink"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-ink/10 font-semibold uppercase text-[10px] text-brand-gold sm:hidden">
                  {filter.short}
                </span>
                <span className="hidden normal-case sm:inline">{filter.desktopLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
