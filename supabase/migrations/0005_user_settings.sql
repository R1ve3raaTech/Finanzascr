create table user_settings (
  user_id uuid references auth.users primary key,
  default_currency text not null default 'CRC' check (default_currency in ('CRC', 'USD')),
  notifications_enabled boolean not null default true,
  updated_at timestamptz default now()
);

alter table user_settings enable row level security;

create policy "Users can view their own settings"
  on user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on user_settings for update
  using (auth.uid() = user_id);

create table user_categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null check (type in ('EXPENSE', 'INCOME')),
  created_at timestamptz default now(),
  unique (user_id, name, type)
);

alter table user_categories enable row level security;

create policy "Users can view their own categories"
  on user_categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on user_categories for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on user_categories for delete
  using (auth.uid() = user_id);
