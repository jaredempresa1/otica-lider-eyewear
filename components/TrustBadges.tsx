import { CreditCard, MessageCircle, ShieldCheck, Truck } from "lucide-react";

/** Inspirado em vitrines como a da Blox: ícone fino, título e descrição centralizados,
 * sem linhas dividindo os itens. Lado a lado a partir do sm; empilhado 2x2 no mobile. */
const BADGES = [
  { icon: Truck, title: "Frete grátis", description: "Para João Pessoa e Região, e também para compras acima de R$ 500,00." },
  { icon: CreditCard, title: "Pagamento facilitado", description: "Pix, cartão em até 10x sem juros." },
  { icon: MessageCircle, title: "Suporte ao cliente", description: "Segunda a Sábado, 09h às 18h." },
  { icon: ShieldCheck, title: "Compra segura", description: "Ambiente 100% seguro." },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-brand-ink/10 bg-brand-paper">
      <div className="section-shell grid grid-cols-2 gap-y-10 py-10 sm:grid-cols-4 sm:gap-x-6 sm:py-14">
        {BADGES.map((badge) => (
          <div key={badge.title} className="flex flex-col items-center gap-3 px-2 text-center">
            <badge.icon className="text-brand-ink" size={26} strokeWidth={1.3} />
            <div>
              <h3 className="font-heading text-[15px] font-semibold uppercase tracking-[0.02em] text-brand-ink sm:text-base">{badge.title}</h3>
              <p className="mx-auto mt-1.5 max-w-[15rem] font-body text-[12.5px] leading-5 text-brand-ink/55 sm:text-sm">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
