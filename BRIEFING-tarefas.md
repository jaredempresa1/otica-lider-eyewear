# Briefing de tarefas — Ótica Líder Brasil

> ✅ **Status: as 3 tarefas abaixo já foram implementadas** no zip do projeto (`components/SocialProof.tsx`, `components/Header.tsx`, `app/page.tsx`). Este documento fica como registro do que foi pedido e do que foi feito.

> ⚠️ Regra geral pra todas as tarefas abaixo: **não alterar nenhuma outra lógica do site** — frete, carrinho, login/cadastro de conta, checkout, etc. devem continuar exatamente como estão. Só mexer no que está descrito aqui.

---

## Tarefa 1 — Nova seção "Prova social" (número animado + 3 cards)

### Onde entra
Na home, **entre a seção "Óculos Sport Vision" e a seção "Óculos de sol feminino"**.

### Comportamento
1. Um número que sobe animado de 0 até 22.000 quando a seção entra na tela (usar `IntersectionObserver` pra disparar a animação só quando visível, e `requestAnimationFrame` pra animar o valor — não usar `setInterval`). Abaixo do número, o texto: **"clientes satisfeitos desde 2001"**.
2. Logo abaixo, 3 blocos de imagem + texto: **Estilo**, **Lentes**, **Qualidade** (conteúdo completo abaixo).
3. **Efeito de scroll:** ao rolar a página, o bloco de imagem+texto fica "grudado" (sticky) numa posição fixa da tela, e o conteúdo troca (com fade) entre os 3 temas conforme o usuário continua rolando — só solta o sticky e libera o scroll normal da página depois que os 3 já passaram. (Padrão tipo página de produto da Apple.) Implementação sugerida: a seção ocupa uma faixa alta (ex.: 3× a altura da viewport), o card interno usa `position: sticky` no topo, e um `IntersectionObserver` (ou cálculo de scroll progress) detecta em qual dos 3 "trechos" da faixa o usuário está pra trocar o conteúdo ativo.
4. **Tamanho:** a seção não pode ocupar a tela inteira. O card visível (o que fica sticky) deve ocupar só cerca de **50–60% da altura da tela**, tanto no mobile quanto no desktop.

### Textos dos 3 cards

**Estilo**
> Acreditamos que óculos de sol devem deixar de ser só proteção e se tornar expressão da sua personalidade. Enquanto grande parte do mercado ainda entrega armações genéricas e sem graça, aqui você encontra design com identidade, atitude real e uma curadoria pensada com cuidado.

**Lentes**
> Todas as nossas lentes têm proteção UV400. Você recebe muito mais que um óculos bonito: recebe cuidado de verdade com a sua visão, em qualquer intensidade de sol.

**Qualidade**
> A qualidade é um dos pilares fundamentais dos nossos produtos, e nos orgulhamos de oferecer óculos que são sinônimo de excelência e originalidade.

### Direção das fotos (fotorrealismo extremo)

Estilo técnico a aplicar nos 3 prompts:
> fotografia profissional ultra-realista, DSLR, lente 85mm f/1.4, textura de pele real com poros visíveis, luz natural, profundidade de campo rasa, grão de filme sutil, 8k, sem aparência de renderização 3D ou pintura digital

- **Estilo** — Mulher de cabelo preto longo e bem cuidado, óculos de sol elegante, ambiente interno fechado e sofisticado (lobby de hotel boutique / restaurante com luz quente), roupa elegante, enquadramento fechado no rosto e óculos, expressão serena e confiante, luz ambiente quente, fundo desfocado em bokeh.
- **Lentes** — Homem negro, na praia, luz solar forte e direta, vestindo camisa leve (não sem camisa), óculos de sol de armação preta com lentes laranja/âmbar (modelo específico aprovado), de frente para a câmera e sorrindo, reflexo do sol na lente, mar e areia desfocados ao fundo.
- **Qualidade** — Mulher loira, roupa casual, óculos de sol com lente vermelha, fundo de montanhas ao ar livre, luz natural de dia claro, expressão descontraída e natural, cabelo levemente ao vento.

✅ **As 3 imagens já foram geradas, aprovadas e salvas** em `public/institucional/estilo.jpg`, `lentes.jpg` e `qualidade.jpg` (proporção 3:4, 1086×1448px). Não é preciso gerar nem trocar nada — só usar os arquivos que já estão nessa pasta.

---

## Tarefa 2 — Corrigir botão "Início" / clique na logo

**Problema relatado:** clicar no botão "Início" do menu ou na logo "Ótica Líder Brasil" não está levando pra tela de início de verdade — deveria mostrar a home completa, com todos os títulos de seção ("Óculos em destaque", "Óculos Sport Vision", "Óculos de sol feminino", "Óculos de sol masculino", "Óculos de sol infantil") e demais informações, do jeito que funcionava antes.

**Pista técnica:** em `components/Header.tsx`, o clique na logo tem uma lógica condicional que, quando o usuário está em `/produtos` com `secao=` na URL, faz `router.back()` em vez de navegar para `/`:

```tsx
onClick={(event) => {
  closeMenu();
  if (pathname === "/produtos" && window.location.search.includes("secao=")) {
    event.preventDefault();
    router.back();
  }
}}
```

Essa lógica existe em dois lugares no arquivo (logo do header desktop e logo do menu mobile). É provável que esse `router.back()` seja a causa do bug — ele pode levar pra um estado de histórico do navegador que não é a home real, ou pra uma versão da página sem os dados carregados corretamente. **Pedir pra revisar essa condição e garantir que o clique na logo e no link "Início" sempre levem para `/` renderizando a home completa (com todas as seções e produtos carregados normalmente), sem quebrar a navegação de "voltar" que essa lógica provavelmente tentava resolver originalmente.**

---

## Tarefa 3 — Reordenar seções da home

**Ordem atual** (em `app/page.tsx`):
1. Óculos em destaque
2. Óculos Sport Vision
3. Óculos de sol feminino
4. (banner promocional)
5. Óculos de sol masculino
6. Óculos de sol infantil

**Nova ordem desejada:**
1. Óculos em destaque
2. Óculos de sol feminino
3. Óculos de sol masculino
4. Óculos Sport Vision
5. Óculos de sol infantil

(A nova seção de "Prova social" da Tarefa 1 entra fixa entre "Óculos Sport Vision" e "Óculos de sol feminino" — então, com a nova ordem, ela vai aparecer entre "Óculos de sol masculino" e "Óculos Sport Vision", já que Sport Vision passou pra depois de masculino. Confirmar esse posicionamento relativo faz sentido antes de implementar.)

Manter o banner promocional e o restante da estrutura da home como estão, só mudando a ordem dos blocos listados acima.
