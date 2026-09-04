"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Collection, Product } from "@/types/product";
import {
  EMPTY_FILTER_STATE,
  ProductFilterState,
  countActiveFilters,
  filterProducts,
  getBrandCollections,
  getColorNames,
  getPriceBounds,
  parseFilterState,
} from "@/lib/filters";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const GENDER_OPTIONS = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
];

export default function FilterDrawer({
  products,
  collections,
  anchor,
}: {
  /** Produtos do recorte atual (usados só para calcular as opções e a contagem ao vivo). */
  products: Product[];
  collections: Collection[];
  anchor?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ProductFilterState>(EMPTY_FILTER_STATE);

  const appliedState = useMemo(
    () =>
      parseFilterState({
        genero: searchParams.get("genero") ?? undefined,
        marca: searchParams.get("marca") ?? undefined,
        cor: searchParams.get("cor") ?? undefined,
        precoMin: searchParams.get("precoMin") ?? undefined,
        precoMax: searchParams.get("precoMax") ?? undefined,
      }),
    [searchParams]
  );

  const priceBounds = useMemo(() => getPriceBounds(products), [products]);
  const colorNames = useMemo(() => getColorNames(products), [products]);
  const brandCollections = useMemo(() => getBrandCollections(products, collections), [products, collections]);
  const activeCount = countActiveFilters(appliedState, priceBounds);

  const minValue = draft.precoMin ?? priceBounds.min;
  const maxValue = draft.precoMax ?? priceBounds.max;
  const hasPriceRange = priceBounds.max > priceBounds.min;
  const liveCount = useMemo(() => filterProducts(products, draft).length, [products, draft]);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(appliedState);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function toggleValue(field: "genero" | "marca" | "cor", value: string) {
    setDraft((current) => {
      const list = current[field];
      const has = list.includes(value);
      return { ...current, [field]: has ? list.filter((item) => item !== value) : [...list, value] };
    });
  }

  function handleMinChange(value: number) {
    const clamped = Math.min(value, maxValue);
    setDraft((current) => ({ ...current, precoMin: clamped <= priceBounds.min ? null : clamped }));
  }

  function handleMaxChange(value: number) {
    const clamped = Math.max(value, minValue);
    setDraft((current) => ({ ...current, precoMax: clamped >= priceBounds.max ? null : clamped }));
  }

  function clearAll() {
    setDraft(EMPTY_FILTER_STATE);
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());

    if (draft.genero.length > 0) params.set("genero", draft.genero.join(","));
    else params.delete("genero");

    if (draft.marca.length > 0) params.set("marca", draft.marca.join(","));
    else params.delete("marca");

    if (draft.cor.length > 0) params.set("cor", draft.cor.join(","));
    else params.delete("cor");

    if (draft.precoMin !== null) params.set("precoMin", String(draft.precoMin));
    else params.delete("precoMin");

    if (draft.precoMax !== null) params.set("precoMax", String(draft.precoMax));
    else params.delete("precoMax");

    const query = params.toString();
    const hash = anchor ? `#${anchor}` : "";
    setIsOpen(false);
    router.replace(`${pathname}${query ? `?${query}` : ""}${hash}`, { scroll: false });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-10 items-center gap-2 rounded-full border border-brand-ink/10 bg-brand-paper px-4 font-body text-[13px] font-medium normal-case tracking-[0.04em] text-brand-ink/65 transition-colors hover:border-brand-gold focus:border-brand-gold focus:outline-none"
      >
        <SlidersHorizontal size={15} className="text-brand-ink/45" />
        Filtrar{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-brand-ink/50 backdrop-blur-[1px]"
          />

          <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-brand-paper shadow-soft sm:max-w-lg sm:rounded-3xl">
            <div className="flex shrink-0 items-center justify-between gap-3 bg-brand-ink px-5 py-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-paper/70 transition-colors hover:text-brand-paper"
              >
                Cancelar
              </button>
              <p className="font-body text-[13px] font-semibold uppercase tracking-[0.12em] text-brand-paper">Filtrar</p>
              <button
                type="button"
                onClick={clearAll}
                className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-gold transition-colors hover:text-brand-paper"
              >
                Limpar tudo
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <section className="border-b border-brand-ink/8 px-5 py-5">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/45">Gênero</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map((option) => {
                    const isSelected = draft.genero.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleValue("genero", option.value)}
                        className={`rounded-xl border px-4 py-2.5 font-body text-[13px] font-medium transition-colors ${
                          isSelected ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/15 text-brand-ink/65 hover:border-brand-gold"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {brandCollections.length > 0 && (
                <section className="border-b border-brand-ink/8 px-5 py-5">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/45">Marca</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {brandCollections.map((collection) => {
                      const isSelected = draft.marca.includes(collection.slug);
                      return (
                        <button
                          key={collection.id}
                          type="button"
                          onClick={() => toggleValue("marca", collection.slug)}
                          className={`rounded-xl border px-4 py-2.5 font-body text-[13px] font-medium transition-colors ${
                            isSelected ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/15 text-brand-ink/65 hover:border-brand-gold"
                          }`}
                        >
                          {collection.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {colorNames.length > 0 && (
                <section className="border-b border-brand-ink/8 px-5 py-5">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/45">Cor principal</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {colorNames.map((name) => {
                      const isSelected = draft.cor.includes(name);
                      const swatch = products.flatMap((product) => product.colors ?? []).find((color) => color.name === name)?.hex ?? "#DCE2D2";
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleValue("cor", name)}
                          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 font-body text-[13px] font-medium transition-colors ${
                            isSelected ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/15 text-brand-ink/65 hover:border-brand-gold"
                          }`}
                        >
                          <span className="h-4 w-4 shrink-0 rounded-full border border-brand-ink/10" style={{ backgroundColor: swatch }} />
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {hasPriceRange && (
                <section className="px-5 py-5">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-ink/45">Preço</p>
                  <div className="relative mt-6 h-4">
                    <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-brand-ink/10" />
                    <div
                      className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-gold"
                      style={{
                        left: `${((minValue - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%`,
                        right: `${100 - ((maxValue - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={minValue}
                      onChange={(event) => handleMinChange(Number(event.target.value))}
                      aria-label="Preço mínimo"
                      className="dual-range"
                    />
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={maxValue}
                      onChange={(event) => handleMaxChange(Number(event.target.value))}
                      aria-label="Preço máximo"
                      className="dual-range"
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <label className="block">
                      <input
                        type="number"
                        min={priceBounds.min}
                        max={maxValue}
                        value={Math.round(minValue)}
                        onChange={(event) => handleMinChange(Number(event.target.value))}
                        className="input-premium text-[14px]"
                      />
                      <span className="mt-1.5 block font-body text-[11px] text-brand-ink/45">Mínimo · {formatBRL(minValue)}</span>
                    </label>
                    <label className="block">
                      <input
                        type="number"
                        min={minValue}
                        max={priceBounds.max}
                        value={Math.round(maxValue)}
                        onChange={(event) => handleMaxChange(Number(event.target.value))}
                        className="input-premium text-[14px]"
                      />
                      <span className="mt-1.5 block font-body text-[11px] text-brand-ink/45">Máximo · {formatBRL(maxValue)}</span>
                    </label>
                  </div>
                </section>
              )}
            </div>

            <div className="shrink-0 border-t border-brand-ink/8 bg-brand-paper px-5 py-4">
              <button type="button" onClick={applyFilters} className="btn-brand w-full py-4 text-[13px]">
                Ver {liveCount} produto{liveCount === 1 ? "" : "s"} encontrado{liveCount === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
