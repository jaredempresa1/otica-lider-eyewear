import { CreditCard, ShieldCheck, Truck } from "lucide-react";

const BADGES = [
  { icon: Truck, title: "Frete grátis", description: "João Pessoa e Região. Demais regiões, frete combinado." },
  { icon: CreditCard, title: "Pagamento facilitado", description: "Pix, cartão em até 10x sem juros." },
  { icon: ShieldCheck, title: "Compra segura", description: "Atendimento dedicado do pedido até a sua entrega." },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-brand-ink/10 bg-brand-paper">
      <div className="section-shell grid gap-0 sm:grid-cols-3">
        {BADGES.map((badge, index) => (
          <div key={badge.title} className={`flex gap-4 py-6 sm:flex-col sm:py-10 ${index > 0 ? "border-t border-brand-ink/10 sm:border-l sm:border-t-0 sm:pl-8" : ""}`}>
            <badge.icon className="shrink-0 text-brand-gold" size={25} strokeWidth={1.4} />
            <div><h3 className="font-heading text-xl font-semibold text-brand-ink">{badge.title}</h3><p className="mt-1 max-w-xs font-body text-sm leading-5 text-brand-ink/55">{badge.description}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
