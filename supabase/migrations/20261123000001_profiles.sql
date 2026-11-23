create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._]{1,30}$'),
  name text not null check (char_length(name) between 1 and 40),
  bio text not null default '' check (char_length(bio) <= 160),
  created_at timestamptz not null default now()
);

-- Security: signed-in people can read profiles, and edit only their own.
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, update (username, name, bio) on public.profiles to authenticated;
grant all on public.profiles to service_role;

create policy "Signed-in people can read profiles" on public.profiles
  for select to authenticated using (true);
create policy "People can edit their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Creates a profile automatically whenever someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  new_name text := left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'New artist'), 40);
  base text := coalesce(nullif(left(regexp_replace(lower(new_name), '[^a-z0-9._]', '', 'g'), 22), ''), 'artist');
begin
  insert into public.profiles (id, username, name) values (new.id, base, new_name)
    on conflict (username) do nothing;
  if not found then -- username taken: add part of the id
    insert into public.profiles (id, username, name)
      values (new.id, base || '_' || left(new.id::text, 7), new_name);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
