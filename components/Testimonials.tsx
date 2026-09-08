"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Testimonial } from "@/types/product";

export default function Testimonials({ testimonials, totalCount = testimonials.length }: { testimonials: Testimonial[]; totalCount?: number }) {
  const [start, setStart] = useState(0);
  const randomizedTestimonials = useMemo(() => {
    if (!testimonials) return [];
    const shuffled = [...testimonials];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
  }, [testimonials]);
  if (!testimonials || testimonials.length === 0) return null;

  const canMove = randomizedTestimonials.length > 1;
  const currentTestimonial = randomizedTestimonials[start % randomizedTestimonials.length];
  const desktopTestimonials = Array.from({ length: Math.min(3, randomizedTestimonials.length) }, (_, index) => randomizedTestimonials[(start + index) % randomizedTestimonials.length]);

  function move(direction: number) {
    setStart((current) => (current + direction + randomizedTestimonials.length) % randomizedTestimonials.length);
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
          <div className="relative overflow-hidden md:hidden">
            <TestimonialCard testimonial={currentTestimonial} />
            {canMove && <><button type="button" onClick={() => move(-1)} className="absolute left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand-paper/45 text-brand-ink/65 transition-colors hover:bg-brand-paper/80 hover:text-brand-ink" aria-label="Avaliação anterior"><ChevronLeft size={15} /></button><button type="button" onClick={() => move(1)} className="absolute right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand-paper/45 text-brand-ink/65 transition-colors hover:bg-brand-paper/80 hover:text-brand-ink" aria-label="Próxima avaliação"><ChevronRight size={15} /></button></>}
          </div>
          <div className="hidden md:contents">{desktopTestimonials.map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}</div>
        </div>
      </div>
    </section>
  );
}
