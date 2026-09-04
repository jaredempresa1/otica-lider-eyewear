"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function GenderFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("genero") ?? "";

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("genero", value);
    } else {
      params.delete("genero");
    }
    const query = params.toString();
    router.push(`/${query ? `?${query}` : ""}#catalogo`, { scroll: false });
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      aria-label="Filtrar óculos por público"
      className="rounded-full border border-brand-ink/10 bg-brand-paper px-3 py-1.5 font-body text-[10px] font-medium uppercase tracking-[0.1em] text-brand-ink/55 transition-colors hover:border-brand-gold focus:border-brand-gold focus:outline-none"
    >
      <option value="">Todos</option>
      <option value="masculino">Óculos masculino</option>
      <option value="feminino">Óculos feminino</option>
    </select>
  );
}
