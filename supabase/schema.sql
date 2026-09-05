create extension if not exists "uuid-ossp";

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  brand text default '',
  model text default '',
  description text default '',
  price numeric(10, 2) not null default 0,
  compare_at_price numeric(10, 2),
  installments jsonb,
  category text default 'Óculos de Sol',
  images jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  downloads jsonb not null default '[]'::jsonb,
  stock integer not null default 0,
  sold_out boolean not null default false,
  featured boolean not null default false,
  more_sold boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Compatibilidade com instalações que já possuem a tabela products.
alter table products add column if not exists downloads jsonb not null default '[]'::jsonb;
alter table products add column if not exists more_sold boolean not null default false;
alter table products add column if not exists brand text default '';
alter table products add column if not exists model text default '';
alter table products add column if not exists installments jsonb;
alter table products add column if not exists sold_out boolean not null default false;

-- Coleções (marcas como Ray-Ban/Voogue e também recortes livres como "Ciclista", "HB").
-- Cada produto guarda a lista de slugs das coleções em que aparece, então o mesmo
-- óculos pode aparecer em várias vitrines (ex.: marca "HB" + categoria "Ciclista")
-- sem nunca duplicar na tabela products — a "coleção completa" continua sendo
-- simplesmente 1 linha por produto, então nunca repete.
alter table products add column if not exists collection_slugs jsonb not null default '[]'::jsonb;

-- Público do produto: masculino, feminino ou unissex (aparece nos dois filtros).
alter table products add column if not exists gender text not null default 'unissex';
alter table products drop constraint if exists products_gender_check;
alter table products add constraint products_gender_check check (gender in ('masculino', 'feminino', 'unissex'));

-- Segurança: qualquer visitante pode LER os produtos (catálogo público).
-- Só usuários autenticados (você, logado no /admin) podem criar/editar/apagar.
alter table products enable row level security;

drop policy if exists "Produtos são visíveis para todos" on products;
create policy "Produtos são visíveis para todos"
  on products for select
  using (true);

drop policy if exists "Somente logados podem inserir produtos" on products;
create policy "Somente logados podem inserir produtos"
  on products for insert
  to authenticated
  with check (true);

drop policy if exists "Somente logados podem editar produtos" on products;
create policy "Somente logados podem editar produtos"
  on products for update
  to authenticated
  using (true);

drop policy if exists "Somente logados podem apagar produtos" on products;
create policy "Somente logados podem apagar produtos"
  on products for delete
  to authenticated
  using (true);

-- Coleções/vitrines administráveis (marcas como Ray-Ban, Voogue, ou recortes
-- como "Ciclista", "HB"). Aparecem em retângulos na home e filtram /produtos.
create table if not exists collections (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  image_url text default '',
  sort_order integer not null default 0,
  created_at timestamp with time zone default now()
);

alter table collections enable row level security;

drop policy if exists "Coleções são visíveis para todos" on collections;
create policy "Coleções são visíveis para todos"
  on collections for select
  using (true);

drop policy if exists "Somente logados podem gerenciar coleções" on collections;
create policy "Somente logados podem gerenciar coleções"
  on collections for all
  to authenticated
  using (true)
  with check (true);

-- Depoimentos (opcional, usado na home)
create table if not exists testimonials (
  id uuid primary key default uuid_generate_v4(),
  author_name text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table testimonials enable row level security;

drop policy if exists "Depoimentos são visíveis para todos" on testimonials;
create policy "Depoimentos são visíveis para todos"
  on testimonials for select
  using (true);

drop policy if exists "Somente logados podem gerenciar depoimentos" on testimonials;
create policy "Somente logados podem gerenciar depoimentos"
  on testimonials for all
  to authenticated
  using (true)
  with check (true);

-- Depois de rodar isso, crie o usuário admin em:
-- Supabase > Authentication > Users > Add user (email + senha)
-- Esse email/senha é o login usado em /admin no site.
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Arquivos de produtos são públicos" on storage.objects;
create policy "Arquivos de produtos são públicos"
  on storage.objects for select
  using (bucket_id = 'product-media');

drop policy if exists "Logados podem enviar arquivos de produtos" on storage.objects;
create policy "Logados podem enviar arquivos de produtos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-media');

drop policy if exists "Logados podem atualizar arquivos de produtos" on storage.objects;
create policy "Logados podem atualizar arquivos de produtos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-media');

drop policy if exists "Logados podem apagar arquivos de produtos" on storage.objects;
create policy "Logados podem apagar arquivos de produtos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-media');

-- Cadastro de WhatsApp (formulário "Cadastre-se e receba novidades" no fim da home).
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  name text default '',
  whatsapp text not null,
  gender text check (gender in ('masculino', 'feminino')),
  created_at timestamp with time zone default now()
);

-- Compatibilidade com instalações que já tinham a tabela leads sem o campo nome.
alter table leads add column if not exists name text default '';

alter table leads enable row level security;

-- Qualquer visitante pode se cadastrar (enviar o formulário), mas ninguém
-- de fora consegue LER a lista — só você, logado no Supabase, visualiza os
-- contatos em Table Editor > leads.
drop policy if exists "Qualquer um pode se cadastrar" on leads;
create policy "Qualquer um pode se cadastrar"
  on leads for insert
  with check (true);

drop policy if exists "Somente logados podem ver os cadastros" on leads;
create policy "Somente logados podem ver os cadastros"
  on leads for select
  to authenticated
  using (true);

-- Especificações técnicas exibidas no acordeão da página do produto.
alter table products add column if not exists specifications jsonb not null default '{}'::jsonb;
