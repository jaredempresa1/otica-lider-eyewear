# Registro de verificação

Data da revisão: 04/09/2026.

## Checagens concluídas

- A compilação estática do TypeScript foi concluída sem erros com `npx tsc --noEmit`.
- A compilação de produção com `NODE_ENV=production npm run build` foi concluída sem erros, também após a integração da logo oficial.
- A sacola exibiu o valor do produto e a referência de parcelamento em até 10x logo abaixo dele.
- O painel **Resumo do pedido** apresentou as alternativas Pix e cartão de crédito.
- Ao selecionar cartão, o seletor mostrou as 10 opções de parcelamento, de 1x a 10x, com o valor correspondente em cada uma.
- Ao escolher 3x na sessão de revisão, o painel foi atualizado para “Cartão de crédito · 3x de R$ 199,97 sem juros”.
- O cabeçalho, sacola, menu mobile e filtro de público foram ampliados visualmente.
- A logo oficial enviada em PNG foi adicionada como `public/logo.png` e utilizada no cabeçalho em tamanho ampliado, com proporção preservada.

## Observação de ambiente

A primeira tentativa de compilação herdou uma variável `NODE_ENV` não padronizada do ambiente e foi interrompida durante a pré-renderização. Ao executar a mesma validação com `NODE_ENV=production`, a compilação foi concluída com sucesso. O catálogo não exibiu produtos nesta revisão porque as credenciais do Supabase não foram fornecidas no arquivo de ambiente local.

## Revisão tipográfica adicional

Os cards tiveram apenas a escala dos textos de marca/modelo, público, preço e parcelamento aumentada. Na sacola, foram ampliados apenas o valor do item, o parcelamento e os números/textos principais do resumo do pedido. A checagem de TypeScript e a compilação de produção passaram após esses ajustes. A sessão visual isolada não manteve o item de teste no armazenamento local durante esta revisão, então a conferência final da sacola foi feita pelo código renderizado e pela compilação, sem alterar outras áreas do layout.


## Home e prévia do link

As frases da hero foram ampliadas para 13/14px na linha de localização, 16/18px na descrição e 12/13px no frete, conforme a referência mobile enviada. A mensagem de frete combinada para CEP fora da área gratuita passou para 13/14px. A página servida confirmou as tags `og:title`, `og:description`, `og:url`, `og:image` e `twitter:image`, apontando para `https://otica-lider-eyewear.vercel.app/og-image.png`, imagem Open Graph existente com a logo oficial e fotos editoriais da coleção.

