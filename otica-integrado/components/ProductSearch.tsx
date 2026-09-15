"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductSearch({ anchor }: { anchor?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const nextValue = value.trim();
    if (nextValue) params.set("q", nextValue);
    else params.delete("q");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}${anchor ? `#${anchor}` : ""}`, { scroll: false });
  }

  function clear() {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}${anchor ? `#${anchor}` : ""}`, { scroll: false });
  }

  return (
    <form onSubmit={submit} className="relative w-full sm:max-w-xs">
      <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/45" aria-hidden="true" />
      <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Pesquisar óculos" aria-label="Pesquisar óculos" className="input-premium h-10 rounded-full py-2.5 pl-11 pr-10 text-[13px]" />
      {value && <button type="button" onClick={clear} className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-brand-ink/45 hover:text-brand-ink" aria-label="Limpar pesquisa"><X size={15} /></button>}
    </form>
  );
}
