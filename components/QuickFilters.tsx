"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { QUICK_FILTERS } from "@/lib/filters";

export default function QuickFilters({ anchor }: { anchor?: string } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("ordenar") ?? "";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("ordenar", value);
    else params.delete("ordenar");

    const query = params.toString();
    const hash = anchor ? `#${anchor}` : "";
    router.replace(`${pathname}${query ? `?${query}` : ""}${hash}`, { scroll: false });
  }

  return (
    <div className="relative shrink-0">
      <select
        value={current}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="Ordenar por"
        className="h-10 shrink-0 appearance-none rounded-full border border-brand-ink/10 bg-brand-paper py-2 pl-4 pr-9 font-body text-[13px] font-medium normal-case tracking-[0.04em] text-brand-ink/65 transition-colors hover:border-brand-gold focus:border-brand-gold focus:outline-none"
      >
        <option value="">Ordenar</option>
        {QUICK_FILTERS.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-ink/45" aria-hidden="true" />
    </div>
  );
}
