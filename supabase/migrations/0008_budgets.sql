create table budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category text not null,
  monthly_limit numeric not null check (monthly_limit > 0),
  currency text not null default 'CRC' check (currency in ('CRC', 'USD')),
  created_at timestamptz default now(),
  unique (user_id, category)
);

alter table budgets enable row level security;

create policy "Users can view their own budgets"
  on budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own budgets"
  on budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budgets"
  on budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own budgets"
  on budgets for delete
  using (auth.uid() = user_id);
