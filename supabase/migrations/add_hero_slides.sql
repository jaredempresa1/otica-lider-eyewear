-- Rode este arquivo no SQL Editor do Supabase (Project > SQL Editor > New query)
-- para ativar o carrossel administrável da home. Ele também já está incluído
-- no final de supabase/schema.sql, então se você aplica o schema.sql inteiro
-- em algum processo automatizado, não precisa rodar este arquivo de novo.

create table if not exists hero_slides (
  id uuid primary key default uuid_generate_v4(),
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  image_url text not null default '',
  image_url_desktop text not null default '',
  video_url text not null default '',
  alt_text text not null default '',
  eyebrow text not null default '',
  title text not null default '',
  focus text not null default 'center 30%',
  href text not null default '',
  destination_type text not null default 'none' check (destination_type in ('none', 'collection', 'product', 'filter')),
  destination_id text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table hero_slides enable row level security;

drop policy if exists "Slides ativos são visíveis para todos" on hero_slides;
create policy "Slides ativos são visíveis para todos"
  on hero_slides for select
  using (active = true);

drop policy if exists "Somente logados podem gerenciar slides" on hero_slides;
create policy "Somente logados podem gerenciar slides"
  on hero_slides for all
  to authenticated
  using (is_admin())
  with check (is_admin());
