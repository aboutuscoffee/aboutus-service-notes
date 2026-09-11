create table if not exists service_notes (
  id uuid primary key default gen_random_uuid(),
  staff_names text[] not null default '{}',
  record_type text not null check (record_type in ('operation', 'roleplay')),
  products text[] not null default '{}',
  region text check (region in ('国内', '欧米系', 'アジア系', 'その他海外')),
  gender text check (gender in ('男性', '女性', '未回答')),
  age_group text check (age_group in ('〜20代', '30〜40代', '50代〜')),
  reaction text not null check (reaction in ('即決', '検討→購入', '見送り', '反応なし')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table service_notes enable row level security;

create policy "anon full access" on service_notes
  for all
  to anon
  using (true)
  with check (true);
