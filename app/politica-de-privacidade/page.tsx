import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Ótica Líder Eyewear",
  description: "Como a Ótica Líder Brasil coleta, usa e protege os seus dados pessoais, em conformidade com a LGPD.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="font-heading text-xl font-semibold text-brand-ink sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 font-body text-sm leading-6 text-brand-ink/70">{children}</div>
    </div>
  );
}

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="section-shell py-12 sm:py-16">
      <p className="eyebrow">Ótica Líder Brasil</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-brand-ink sm:text-4xl">
        Política de Privacidade
      </h1>
      <p className="mt-4 max-w-2xl font-body text-sm leading-6 text-brand-ink/70">
        Na Ótica Líder Brasil, a privacidade e a segurança dos dados dos nossos clientes são prioridades
        absolutas. Esta Política de Privacidade explica de forma clara e transparente como coletamos,
        usamos, armazenamos e protegemos as suas informações pessoais, em total conformidade com a Lei
        Geral de Proteção de Dados (LGPD — Lei nº 13.709/18).
      </p>

      <div className="mt-10 max-w-2xl divide-y divide-brand-ink/10">
        <Section title="1. Quais Dados Nós Coletamos?">
          <p>Para que você possa realizar suas compras e receber nossos óculos de sol com total comodidade, coletamos as seguintes informações:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><span className="font-semibold text-brand-ink/80">Dados de Cadastro:</span> Nome completo, CPF, data de nascimento e gênero.</li>
            <li><span className="font-semibold text-brand-ink/80">Dados de Contato:</span> E-mail, número de telefone e WhatsApp.</li>
            <li><span className="font-semibold text-brand-ink/80">Dados de Entrega:</span> Endereço residencial completo (rua, número, bairro, cidade, estado e CEP).</li>
            <li><span className="font-semibold text-brand-ink/80">Dados de Pagamento:</span> Informações do cartão de crédito ou dados do Pix (processados de forma criptografada e segura pelo nosso intermediador de pagamentos; nós não armazenamos os dados do seu cartão).</li>
          </ul>
        </Section>

        <Section title="2. Para Que Usamos os Seus Dados?">
          <p>A utilização dos seus dados pessoais ocorre estritamente para as seguintes finalidades:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Processar, faturar e enviar os seus pedidos de óculos de sol.</li>
            <li>Enviar atualizações sobre o status do seu pedido e rastreamento de entrega.</li>
            <li>Prestar suporte no atendimento ao cliente através do nosso WhatsApp.</li>
            <li>Enviar novidades, promoções e cupons de desconto exclusivos (caso você autorize).</li>
          </ul>
        </Section>

        <Section title="3. Com Quem Compartilhamos Seus Dados?">
          <p>A Ótica Líder Brasil não vende, aluga ou repassa os seus dados para terceiros. O compartilhamento ocorre apenas com parceiros essenciais para o funcionamento da loja:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><span className="font-semibold text-brand-ink/80">Empresas de Logística (Correios/Transportadoras):</span> Para que seus óculos de sol cheguem corretamente ao seu endereço.</li>
            <li><span className="font-semibold text-brand-ink/80">Intermediadores de Pagamento:</span> Para validar a transação financeira com total segurança.</li>
            <li><span className="font-semibold text-brand-ink/80">Ferramentas de Tecnologia:</span> Plataformas que hospedam nosso site e gerenciam o envio de mensagens de rastreio.</li>
          </ul>
        </Section>

        <Section title="4. Como Protegemos as Suas Informações?">
          <p>
            Utilizamos medidas de segurança tecnológicas para proteger seus dados contra acessos não
            autorizados e situações acidentais de destruição ou perda. O nosso site conta com o
            Certificado SSL (Cadeado na barra de endereço), que garante que todas as informações
            transmitidas entre o seu navegador e o nosso servidor sejam totalmente criptografadas.
          </p>
        </Section>

        <Section title="5. Seus Direitos (LGPD)">
          <p>Como titular dos dados, a legislação brasileira garante que você possa, a qualquer momento, entrar em contato conosco para:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Confirmar a existência do tratamento de seus dados.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a exclusão definitiva dos seus dados da nossa base (exceto os dados necessários para o cumprimento de obrigações legais de emissão de nota fiscal).</li>
            <li>Revogar o consentimento para o recebimento de mensagens de marketing.</li>
          </ul>
        </Section>

        <Section title="6. Uso de Cookies">
          <p>
            Utilizamos cookies para melhorar a sua experiência de navegação em nosso site, lembrar os
            itens que você adicionou ao carrinho de compras e entender como os visitantes interagem com
            a nossa página, permitindo constantes melhorias no site.
          </p>
        </Section>

        <Section title="7. Como Falar Conosco sobre Seus Dados">
          <p>
            Se tiver qualquer dúvida sobre esta política ou quiser exercer algum dos seus direitos
            previstos na LGPD, entre em contato direto com a nossa equipe pelo WhatsApp:{" "}
            <span className="font-semibold text-brand-ink/80">(83) 99199-5221</span>.
          </p>
        </Section>
      </div>
    </main>
  );
}
