"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { Testimonial } from "@/types/product";

export default function Testimonials({ testimonials, totalCount }: { testimonials: Testimonial[]; totalCount: number }) {
  const [start, setStart] = useState(0);
  if (!testimonials || testimonials.length === 0) return null;

  const canMove = testimonials.length > 3;
  const desktopTestimonials = Array.from({ length: Math.min(3, testimonials.length) }, (_, index) => testimonials[(start + index) % testimonials.length]);

  function move(direction: number) {
    setStart((current) => (current + direction + testimonials.length) % testimonials.length);
  }

  function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    const rating = testimonial.rating || 5;

    return (
      <article className="rounded-[1.25rem] bg-brand-paper p-5 shadow-card">
        <div className="flex items-center gap-3">
          {testimonial.image_url ? <img src={testimonial.image_url} alt={testimonial.author_name} className="h-11 w-11 rounded-full object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-sage font-heading text-lg font-semibold text-brand-moss">{testimonial.author_name.charAt(0).toUpperCase()}</div>}
          <div>
            <p className="font-heading text-base font-semibold text-brand-ink">{testimonial.author_name}</p>
            <div className="mt-1 flex gap-0.5 text-brand-gold" aria-label={`${rating} de 5 estrelas`}>
              {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < rating ? "currentColor" : "none"} />)}
            </div>
          </div>
        </div>
        {testimonial.content?.trim() && <p className="mt-5 font-body text-[14px] leading-6 text-brand-ink/70">“{testimonial.content}”</p>}
      </article>
    );
  }

  return (
    <section className="border-t border-brand-ink/10 bg-brand-cream px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Experiências reais</p>
            <h2 className="mt-2 whitespace-nowrap font-heading text-[clamp(1.65rem,8vw,2.25rem)] font-semibold tracking-[-0.04em] text-brand-ink sm:text-4xl">Avaliações de clientes</h2>
            <p className="mt-3 font-body text-xs font-semibold uppercase tracking-[0.12em] text-brand-moss">{totalCount} {totalCount === 1 ? "avaliação publicada" : "avaliações publicadas"}</p>
          </div>
          {canMove && <div className="hidden gap-2 md:flex"><button type="button" onClick={() => move(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-ink/15 text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper" aria-label="Avaliação anterior"><ChevronLeft size={18} /></button><button type="button" onClick={() => move(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-ink/15 text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-paper" aria-label="Próxima avaliação"><ChevronRight size={18} /></button></div>}
        </div>
        <div className="mt-8 md:grid md:grid-cols-3 md:gap-4">
          <div className="overflow-hidden md:hidden">
            <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${start * 100}%)` }}>
              {testimonials.map((testimonial) => <div key={testimonial.id} className="min-w-full"><TestimonialCard testimonial={testimonial} /></div>)}
            </div>
            {canMove && <div className="mt-4 flex justify-center gap-3"><button type="button" onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-ink/15 bg-brand-paper text-brand-ink shadow-card transition-colors hover:bg-brand-ink hover:text-brand-paper" aria-label="Avaliação anterior"><ChevronLeft size={19} /></button><button type="button" onClick={() => move(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-ink/15 bg-brand-paper text-brand-ink shadow-card transition-colors hover:bg-brand-ink hover:text-brand-paper" aria-label="Próxima avaliação"><ChevronRight size={19} /></button></div>}
          </div>
          <div className="hidden md:contents">{desktopTestimonials.map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}</div>
        </div>
      </div>
    </section>
  );
}
