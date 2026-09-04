"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QUICK_FILTERS } from "@/lib/filters";

export default function QuickFilters({ anchor }: { anchor?: string } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("ordenar") ?? "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const nextValue = value === current ? "" : value;
    if (nextValue) params.set("ordenar", nextValue);
    else params.delete("ordenar");

    const query = params.toString();
    const hash = anchor ? `#${anchor}` : "";
    router.replace(`${pathname}${query ? `?${query}` : ""}${hash}`, { scroll: false });
  }

  return (
    <div role="listbox" aria-label="Filtros rápidos" className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
      {QUICK_FILTERS.map((filter) => {
        const isSelected = filter.value === current;
        return (
          <button
            key={filter.value}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => handleChange(filter.value)}
            className={`shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
              isSelected
                ? "border-brand-gold bg-brand-gold text-brand-paper"
                : "border-brand-ink/15 bg-brand-paper text-brand-ink/60 hover:border-brand-gold hover:text-brand-ink"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
