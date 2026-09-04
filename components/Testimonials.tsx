type Testimonial = {
  id: string;
  author_name: string;
  content: string;
};

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <h2 className="mb-10 text-center font-heading text-2xl font-bold text-brand-black">
        Depoimentos
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {testimonials.map((t) => (
          <blockquote
            key={t.id}
            className="rounded-sm border border-black/5 bg-brand-cream p-6"
          >
            <p className="font-body text-sm italic text-brand-black/80">
              &ldquo;{t.content}&rdquo;
            </p>
            <footer className="mt-4 font-heading text-sm font-semibold text-brand-black">
              {t.author_name}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
