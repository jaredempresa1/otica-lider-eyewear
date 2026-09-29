-- Lista de desejos (favoritos) de quem tem conta. Quem não está logado usa só o
-- navegador (localStorage); ao logar, o app sincroniza automaticamente com esta tabela.
create table if not exists wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table wishlist_items enable row level security;

create policy "Cada pessoa só vê seus próprios favoritos"
  on wishlist_items for select
  using (auth.uid() = user_id);

create policy "Cada pessoa só adiciona favoritos para si mesma"
  on wishlist_items for insert
  with check (auth.uid() = user_id);

create policy "Cada pessoa só remove seus próprios favoritos"
  on wishlist_items for delete
  using (auth.uid() = user_id);
