"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { Testimonial } from "@/types/product";

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [start, setStart] = useState(0);
  if (!testimonials || testimonials.length === 0) return null;
  const visible = testimonials.slice(start, start + 3);
  const canMove = testimonials.length > 3;

  function move(direction: number) {
    setStart((current) => (current + direction + testimonials.length) % testimonials.length);
  }

  return (
    <section className="border-t border-brand-ink/10 bg-brand-cream px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Experiências reais</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em] text-brand-ink sm:text-4xl">Avaliações de clientes</h2>
            <p className="mt-2 font-body text-sm text-brand-ink/55">O que nossos clientes dizem no Google.</p>
          </div>
          {canMove && <div className="flex gap-2"><button type="button" onClick={() => move(-3)} className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-ink/15 text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper" aria-label="Avaliações anteriores"><ChevronLeft size={18} /></button><button type="button" onClick={() => move(3)} className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-ink/15 text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper" aria-label="Próximas avaliações"><ChevronRight size={18} /></button></div>}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {visible.map((testimonial) => <article key={testimonial.id} className="rounded-[1.25rem] bg-brand-paper p-5 shadow-card"><div className="flex items-center gap-3">{testimonial.image_url ? <img src={testimonial.image_url} alt={testimonial.author_name} className="h-11 w-11 rounded-full object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-sage font-heading text-lg font-semibold text-brand-moss">{testimonial.author_name.charAt(0).toUpperCase()}</div>}<div><p className="font-heading text-base font-semibold text-brand-ink">{testimonial.author_name}</p><div className="mt-1 flex gap-0.5 text-brand-gold" aria-label={`${testimonial.rating || 5} de 5 estrelas`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < (testimonial.rating || 5) ? "currentColor" : "none"} />)}</div></div></div><p className="mt-5 font-body text-[14px] leading-6 text-brand-ink/70">“{testimonial.content}”</p></article>)}
        </div>
      </div>
    </section>
  );
}
