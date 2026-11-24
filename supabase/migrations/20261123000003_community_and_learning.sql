-- Likes, saved artworks, comments, bookmarks and lesson progress.
-- Artworks and lessons live in the site's code for now, so they are referred to by their text id.
-- Everything here is deleted along with the account.

-- Private to each person: what they liked, saved and bookmarked, and how far they got.
create table public.likes (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  work_id text not null check (char_length(work_id) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, work_id)
);
create index likes_work_id on public.likes (work_id);

create table public.saved_works (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  work_id text not null check (char_length(work_id) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, work_id)
);

create table public.bookmarks (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.lesson_progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 1 and 100),
  step int not null check (step between 0 and 1000),
  completed boolean not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Comments can be read by everyone who is signed in. Authors can add and delete their own.
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  work_id text not null check (char_length(work_id) between 1 and 100),
  author_id uuid not null default auth.uid() references public.profiles on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 300),
  created_at timestamptz not null default now()
);
create index comments_work_id on public.comments (work_id, created_at desc);
create index comments_author_id on public.comments (author_id);

-- Security. Nothing is open to visitors who aren't signed in.
alter table public.likes enable row level security;
alter table public.saved_works enable row level security;
alter table public.bookmarks enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.comments enable row level security;

revoke all on public.likes, public.saved_works, public.bookmarks, public.lesson_progress, public.comments from anon, authenticated;
grant select, delete, insert (work_id) on public.likes to authenticated;
grant select, delete, insert (work_id) on public.saved_works to authenticated;
grant select, delete, insert (lesson_id) on public.bookmarks to authenticated;
grant select, delete, insert (lesson_id, step, completed, updated_at), update (lesson_id, step, completed, updated_at) on public.lesson_progress to authenticated;
grant select, delete, insert (work_id, body) on public.comments to authenticated;
grant all on public.likes, public.saved_works, public.bookmarks, public.lesson_progress, public.comments to service_role;

create policy "Own likes" on public.likes for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own saved artworks" on public.saved_works for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own bookmarks" on public.bookmarks for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own lesson progress" on public.lesson_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Signed-in people can read comments" on public.comments for select to authenticated using (true);
create policy "People can write their own comments" on public.comments for insert to authenticated
  with check ((select auth.uid()) = author_id);
create policy "People can delete their own comments" on public.comments for delete to authenticated
  using ((select auth.uid()) = author_id);

-- How many likes and comments artworks have, without revealing who liked what.
create function public.work_stats(work_ids text[]) returns table (work_id text, likes bigint, comments bigint)
language sql stable security definer set search_path = '' as $$
  select w.id,
    (select count(*) from public.likes l where l.work_id = w.id),
    (select count(*) from public.comments c where c.work_id = w.id)
  from (select distinct unnest(work_ids[1:200]) as id) w;
$$;
revoke all on function public.work_stats(text[]) from public, anon;
grant execute on function public.work_stats(text[]) to authenticated;
