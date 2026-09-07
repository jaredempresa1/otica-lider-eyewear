# Ótica Líder Eyewear

Site de catálogo premium de óculos com sacola e finalização de pedido pelo WhatsApp (sem pagamento integrado no site). Feito com Next.js + Tailwind + Supabase.

## O que já vem pronto

- Home editorial premium com hero visual, catálogo completo visível logo abaixo, curadoria de destaques, mensagem institucional, selos de confiança e depoimentos.
- Catálogo `/produtos` e detalhe `/produtos/[modelo]` com bolinhas de cor clicáveis e galeria filtrada: ao escolher uma variação, são exibidos apenas os ângulos cadastrados para aquela cor.
- Produtos com identificação separada de **Marca** e **Modelo**, além de características da variação como **Armação** e **Lentes**.
- Galeria ampliada no detalhe do produto: clique para abrir sem o quadro de navegação, toque no celular para ampliar, arraste a imagem ampliada e navegue pelas miniaturas da mesma cor.
- Parcelamento opcional configurável por produto, exibido no formato `10x de R$ 99,90` abaixo do preço.
- Adição rápida pelo botão `+` em cada card, com feedback "Adicionado à sacola". Ao adicionar dentro do detalhe, o cliente é levado para `/sacola`.
- Sacola dedicada em `/sacola` com produtos, cores, quantidade, subtotal, CEP, frete grátis automático para **João Pessoa (58000-000 a 58099-999)** e **Goiana-PE (55900-000 a 55919-999)**, além da finalização pelo WhatsApp somente nessa página.
- Cotação de frete pago via Melhor Envio para fora da área grátis, com token renovado sozinho (ver seção 6) — só uma autorização manual, feita uma única vez.
- Produtos marcados como **Pedido especial** (sob encomenda) pulam o carrinho: o cliente vê "Fazer pedido" e cai direto numa mensagem pronta no WhatsApp, já com o prazo médio cadastrado no `/admin`.
- Painel administrativo em `/admin` e `/admin/dashboard`, protegido por login do Supabase, com preço atual/promocional, selo de mais vendido, destaque, estoque, fotos e materiais para download.
- Upload de fotos e documentos por arrastar e soltar via Supabase Storage; também é possível colar URLs públicas manualmente.
- Identidade visual com marfim, carvão, verde sálvia, dourado e tipografia Piazzolla + Instrument Sans.

## 1. Instalar as dependências

Com o Node.js instalado, abra a pasta do projeto no terminal do VS Code e
rode:

```
npm install
```

## 2. Configurar o Supabase

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com) (tem
   plano gratuito).
2. Vá em **SQL Editor** → **New query**, cole todo o conteúdo do arquivo
   `supabase/schema.sql` deste projeto e clique em **Run**. Isso cria as
   tabelas de produtos e depoimentos, já com as permissões corretas.
3. Vá em **Authentication → Users → Add user** e crie seu login de
   administrador (e-mail + senha). É esse e-mail/senha que você vai usar em
   `/admin` no site.
4. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**

## 3. Configurar as variáveis de ambiente

Duplique o arquivo `.env.example`, renomeie a cópia para `.env.local` e
preencha:

```
NEXT_PUBLIC_SUPABASE_URL=... (cole aqui a Project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=... (cole aqui a anon public key)
NEXT_PUBLIC_WHATSAPP_NUMBER=5583900000000 (seu número, só números, com 55 + DDD)
```

As variáveis do Melhor Envio (`SUPABASE_SERVICE_ROLE_KEY`,
`MELHOR_ENVIO_CLIENT_ID`, `MELHOR_ENVIO_CLIENT_SECRET`) ficam para a seção
6, mais abaixo — não são obrigatórias para rodar o site localmente.

## 4. Rodar localmente

```
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O catálogo vai
aparecer vazio até você cadastrar produtos pelo `/admin`.

## 5. Cadastrar produtos e enviar arquivos

Acesse `/admin`, faça login e use **Novo produto**. O formulário está organizado em cinco blocos:

1. **Identidade:** marca, modelo, URL amigável, categoria e descrição. A marca aparece maior e o modelo logo abaixo na vitrine.
2. **Preço e presença:** preço promocional/atual, preço anterior, opção de exibir parcelamento, número e valor de cada parcela, estoque, destaque e mais vendido.
3. **Fotos:** arraste JPG, PNG ou WebP para a área de upload ou cole URLs públicas, uma por linha.
4. **Cores e variações:** clique em cada chip de cor para editar nome, tom, armação, lentes e uma galeria própria de imagens. Arraste vários ângulos ou cole várias URLs, uma por linha; cada galeria fica vinculada somente àquela cor.
5. **Materiais para download:** arraste PDF, DOC, DOCX, ZIP ou TXT para anexar ficha técnica, manual ou certificado ao produto.

O `supabase/schema.sql` já cria a coluna `more_sold`, a coluna `downloads` e o bucket público `product-media`. Rode o SQL completo no Supabase antes de usar os novos campos.

## 6. Configurar o frete automático (Melhor Envio)

O site calcula o frete pago sozinho pela API do Melhor Envio para quem
está fora da área de frete grátis. Depois da configuração abaixo, o token
de acesso se renova sozinho para sempre — você não precisa voltar aqui.

1. Copie a chave **service_role** do seu projeto Supabase: **Project
   Settings → API → Project API keys → service_role**. Adicione essa chave
   como `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (e depois na Vercel).
   É ela que permite ao site guardar e renovar o token sozinho — sem essa
   chave, a renovação automática fica desativada.
2. Crie uma conta em [melhorenvio.com.br](https://melhorenvio.com.br) (ou
   use a que já tiver) e cadastre um aplicativo em **Gerenciar
   aplicações → Criar novo aplicativo**. Use como URL de redirecionamento
   `https://SEU-DOMINIO/api/melhor-envio/callback` (troque pelo domínio
   real do site já publicado na Vercel).
3. Copie o **Client ID** e o **Client Secret** do aplicativo criado e
   preencha `MELHOR_ENVIO_CLIENT_ID` e `MELHOR_ENVIO_CLIENT_SECRET` no
   `.env.local` (e depois na Vercel).
4. Publique o site na Vercel com essas variáveis já configuradas (ver
   seção 7 abaixo).
5. Com o site no ar, acesse **uma única vez**
   `https://SEU-DOMINIO/api/melhor-envio/callback` — na verdade acesse
   `https://SEU-DOMINIO/api/melhor-envio/authorize`, faça login no Melhor
   Envio e autorize o aplicativo. Essa é a única etapa manual de todo o
   processo: depois dela, o token é salvo e renovado sozinho, para sempre.

Se você pular esta seção, o site continua funcionando normalmente — só
a cotação automática de frete fica indisponível, e o cliente é orientado
a combinar o frete por WhatsApp.

## 7. Ver a versão mobile

O layout foi feito mobile-first. Para testar no computador, abra o site no Chrome, pressione `F12` (ou `Ctrl + Shift + I`), clique no ícone de celular/tablet e escolha um modelo como iPhone 12 Pro. Para testar no aparelho real na mesma rede, rode `npm run dev -- -H 0.0.0.0` e abra no celular o endereço local exibido pelo seu ambiente, usando a mesma rede Wi-Fi.

## 8. Colocar no ar (deploy)

1. Suba este projeto para um repositório no GitHub.
2. Crie uma conta em [vercel.com](https://vercel.com) e importe o
   repositório.
3. Nas configurações do projeto na Vercel, adicione as mesmas variáveis de
   ambiente do `.env.local` (Settings → Environment Variables).
4. Clique em Deploy. Em poucos minutos o site estará no ar em um link
   `.vercel.app`.
5. Depois, em **Settings → Domains**, adicione o domínio
   `oticalider.com.br` (ou o que você registrar) e siga as instruções da
   Vercel para apontar o DNS.

## Ajustes que ainda valem a pena fazer

- Trocar o CNPJ de exemplo no rodapé (`components/Footer.tsx`) pelo CNPJ
  real da loja.
- Trocar `NEXT_PUBLIC_WHATSAPP_NUMBER` pelo número oficial da loja quando
  estiver pronto para divulgar (hoje está configurado para o seu número
  pessoal, como combinado).
- Cadastrar depoimentos reais na tabela `testimonials` do Supabase (pelo SQL
  Editor ou criando uma tela de admin extra, se quiser).
- Trocar as cores em `tailwind.config.ts` (`brand.gold`, `brand.ink`, `brand.sage`) se quiser ajustar o tom exato da identidade visual.
- Substituir `public/hero-eyewear.jpg` por uma imagem editorial própria da loja, mantendo o mesmo nome ou atualizando o caminho em `components/Hero.tsx`.
