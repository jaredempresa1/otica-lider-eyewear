alter table products add column if not exists home_section text default '';
alter table products drop constraint if exists products_home_section_check;
alter table products add constraint products_home_section_check check (home_section in ('', 'destaque', 'sport-vision', 'feminino', 'masculino', 'infantil'));
