-- =========================================================
-- 1) OCULTAR / PUBLICAR PRODUTO (rascunho)
-- =========================================================
alter table products add column if not exists hidden boolean not null default false;

-- Produtos ocultos só são visíveis para o admin. Visitantes (e o site) nunca os
-- recebem — nem pela home, nem pela busca, nem pelo sitemap, nem pela API.
drop policy if exists "Produtos são visíveis para todos" on products;
create policy "Produtos são visíveis para todos"
  on products for select
  using (hidden = false or is_admin());

-- =========================================================
-- 2) FIM DA "SEÇÃO DA PÁGINA INICIAL"
-- =========================================================
-- As vitrines agora vêm só de Público + Destaque + Esportivo. Para nenhum
-- produto sumir de onde já aparecia, copiamos o que estava na antiga seção
-- para os campos que passam a valer:
update products set featured = true where home_section = 'destaque' and featured is not true;
update products set sportivo = true where home_section = 'sport-vision' and sportivo is not true;
update products set gender = 'infantil' where home_section = 'infantil' and gender is distinct from 'infantil';
update products set gender = home_section where home_section in ('masculino', 'feminino') and (gender is null or gender = '');

-- (A coluna home_section continua existindo, só não é mais usada. Pode ficar.)
