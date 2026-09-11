import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Garantia — Ótica Líder Eyewear",
  description: "Conheça as condições de garantia dos óculos de sol da Ótica Líder Brasil.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="font-heading text-xl font-semibold text-brand-ink sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 font-body text-sm leading-6 text-brand-ink/70">{children}</div>
    </div>
  );
}

export default function PoliticaDeGarantiaPage() {
  return (
    <main className="section-shell py-12 sm:py-16">
      <p className="eyebrow">Ótica Líder Brasil</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-brand-ink sm:text-4xl">
        Política de Garantia
      </h1>
      <p className="mt-4 max-w-2xl font-body text-sm leading-6 text-brand-ink/70">
        Na Ótica Líder Brasil, nosso compromisso é garantir a máxima qualidade dos seus óculos de sol e
        proteger a sua visão com estilo. Nossa Política de Garantia foi desenvolvida com base no Código
        de Defesa do Consumidor (CDC) para assegurar a transparência e a sua total satisfação.
      </p>

      <div className="mt-10 max-w-2xl divide-y divide-brand-ink/10">
        <Section title="1. Prazo de Garantia">
          <p>Todos os óculos de sol adquiridos na Ótica Líder Brasil possuem garantia contra defeitos de fabricação no prazo de:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>6 (seis) meses, contados a partir da data de recebimento do produto pelo cliente.</li>
          </ul>
        </Section>

        <Section title="2. O que a Garantia Cobre?">
          <ul className="list-disc space-y-1 pl-5">
            <li>Defeitos de solda, fixação de componentes (como plaquetas) ou descamação da pintura/verniz da armação.</li>
            <li>Soltura de parafusos originais ou falhas nas dobradiças sem sinais de força excessiva.</li>
            <li>Descolamento de películas de proteção (como a película de polarização) ou defeitos de fabricação na coloração das lentes.</li>
          </ul>
        </Section>

        <Section title="3. O que a Garantia NÃO Cobre?">
          <p>A garantia perde a validade em casos de desgaste natural pelo uso ou danos causados por acidentes e manuseio inadequado, tais como:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Riscos, arranhões, trincas ou quebras nas lentes decorrentes de quedas, atritos ou limpeza com materiais abrasivos (como roupas, papel ou produtos químicos).</li>
            <li>Armações tortas, quebradas ou deformadas por terem sido guardadas fora do estojo, pisadas, sentadas ou submetidas a calor excessivo (como esquecidas dentro do carro sob o sol).</li>
            <li>Ajustes, reparos ou modificações realizados por terceiros não autorizados.</li>
            <li>Oxidação das partes metálicas causada por excesso de suor, uso no mar/piscina ou contato direto com perfumes, cremes e protetores solares.</li>
          </ul>
        </Section>

        <Section title="4. Como Acionar a Garantia?">
          <p>Caso o seu produto apresente algum defeito de fabricação dentro do prazo de 6 meses, siga o passo a passo abaixo:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Entre em contato diretamente pelo nosso WhatsApp: (83) 99199-5221.</li>
            <li>Informe o número do pedido ou o CPF do comprador.</li>
            <li>Envie uma breve descrição do problema acompanhada de fotos ou vídeos nítidos mostrando o defeito.</li>
          </ol>
        </Section>

        <Section title="5. Prazos e Resolução">
          <p>Após o recebimento do seu contato, nossa equipe fará uma análise técnica do produto:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>O prazo máximo para avaliação e resolução do problema é de até 30 dias, conforme o CDC.</li>
            <li>Sendo constatado o defeito de fabricação, realizaremos o conserto ou a troca dos óculos por um modelo igual e novo.</li>
            <li>Caso o modelo tenha saído de linha, o cliente poderá escolher outro óculos de igual valor ou receber um vale-compras no mesmo valor do item.</li>
          </ul>
        </Section>

        <Section title="6. Custos de Envio">
          <ul className="list-disc space-y-1 pl-5">
            <li>Confirmado o defeito de fabricação pela análise, os custos de frete para envio e retorno do produto são de total responsabilidade da Ótica Líder Brasil.</li>
            <li>Caso a análise identifique que o dano foi causado por mau uso, o produto será devolvido no estado em que se encontra, e o frete de retorno será por conta do cliente.</li>
          </ul>
        </Section>
      </div>
    </main>
  );
}
