-- Dibil Messenger - Supabase Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  status text default 'Hey there! I am using Dibil.',
  last_seen timestamptz default now(),
  is_online boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat types: 'direct' | 'group' | 'channel'
create type chat_type as enum ('direct', 'group', 'channel');

create table public.chats (
  id uuid primary key default uuid_generate_v4(),
  type chat_type not null default 'direct',
  title text,
  description text,
  avatar_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Topics for group chats (like Telegram)
create table public.chat_topics (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  title text not null,
  icon_emoji text default '💬',
  created_at timestamptz default now()
);

-- Chat members
create type member_role as enum ('member', 'admin', 'owner');

create table public.chat_members (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role default 'member',
  joined_at timestamptz default now(),
  last_read_at timestamptz,
  unique(chat_id, user_id)
);

-- Messages
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  topic_id uuid references public.chat_topics(id) on delete set null,
  sender_id uuid not null references auth.users(id) on delete cascade,
  reply_to_id uuid references public.messages(id) on delete set null,
  forwarded_from_id uuid references public.messages(id) on delete set null,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_edited boolean default false,
  is_deleted boolean default false
);

-- Message reactions (emoji -> user_ids stored as array or separate table)
create table public.message_reactions (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now(),
  unique(message_id, user_id, emoji)
);

-- File attachments
create table public.file_uploads (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid references public.messages(id) on delete cascade,
  bucket text not null,
  path text not null,
  name text not null,
  mime_type text,
  size bigint,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Typing indicators (ephemeral, can use Realtime presence instead - this is optional backup)
create table public.typing_indicators (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz default now(),
  unique(chat_id, user_id)
);

-- Indexes
create index idx_chat_members_chat on public.chat_members(chat_id);
create index idx_chat_members_user on public.chat_members(user_id);
create index idx_messages_chat on public.messages(chat_id);
create index idx_messages_chat_created on public.messages(chat_id, created_at desc);
create index idx_messages_topic on public.messages(topic_id);
create index idx_message_reactions_message on public.message_reactions(message_id);
create index idx_profiles_username on public.profiles(username);
create index idx_chat_topics_chat on public.chat_topics(chat_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.chat_topics enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;
alter table public.file_uploads enable row level security;
alter table public.typing_indicators enable row level security;

-- Profiles: users can read all (for search), update own
create policy "Profiles read" on public.profiles for select using (true);
create policy "Profiles update own" on public.profiles for update using (auth.uid() = id);
create policy "Profiles insert own" on public.profiles for insert with check (auth.uid() = id);

-- Chats: members can read
create policy "Chats read" on public.chats for select using (
  exists (select 1 from public.chat_members where chat_id = chats.id and user_id = auth.uid())
);
create policy "Chats insert" on public.chats for insert with check (auth.uid() = created_by);
create policy "Chats update" on public.chats for update using (
  exists (select 1 from public.chat_members where chat_id = chats.id and user_id = auth.uid() and role in ('admin', 'owner'))
);

-- Chat members
create policy "Chat members read" on public.chat_members for select using (
  chat_id in (select chat_id from public.chat_members where user_id = auth.uid())
);
create policy "Chat members insert" on public.chat_members for insert with check (
  auth.uid() = user_id or exists (select 1 from public.chat_members cm where cm.chat_id = chat_members.chat_id and cm.user_id = auth.uid() and cm.role in ('admin', 'owner'))
);
create policy "Chat members delete" on public.chat_members for delete using (auth.uid() = user_id);

-- Messages
create policy "Messages read" on public.messages for select using (
  exists (select 1 from public.chat_members where chat_id = messages.chat_id and user_id = auth.uid())
);
create policy "Messages insert" on public.messages for insert with check (
  auth.uid() = sender_id and exists (select 1 from public.chat_members where chat_id = messages.chat_id and user_id = auth.uid())
);
create policy "Messages update" on public.messages for update using (auth.uid() = sender_id);
create policy "Messages delete" on public.messages for delete using (auth.uid() = sender_id);

-- Reactions
create policy "Reactions read" on public.message_reactions for select using (true);
create policy "Reactions insert" on public.message_reactions for insert with check (auth.uid() = user_id);
create policy "Reactions delete" on public.message_reactions for delete using (auth.uid() = user_id);

-- File uploads
create policy "File uploads read" on public.file_uploads for select using (true);
create policy "File uploads insert" on public.file_uploads for insert with check (auth.uid() is not null);
create policy "File uploads delete" on public.file_uploads for delete using (auth.uid() is not null);

-- Typing indicators
create policy "Typing read" on public.typing_indicators for select using (
  exists (select 1 from public.chat_members where chat_id = typing_indicators.chat_id and user_id = auth.uid())
);
create policy "Typing insert" on public.typing_indicators for insert with check (auth.uid() = user_id);
create policy "Typing update" on public.typing_indicators for update using (auth.uid() = user_id);
create policy "Typing delete" on public.typing_indicators for delete using (auth.uid() = user_id);

-- Chat topics
create policy "Topics read" on public.chat_topics for select using (
  exists (select 1 from public.chat_members where chat_id = chat_topics.chat_id and user_id = auth.uid())
);
create policy "Topics insert" on public.chat_topics for insert with check (
  exists (select 1 from public.chat_members where chat_id = chat_topics.chat_id and user_id = auth.uid() and role in ('admin', 'owner'))
);

-- Realtime: enable for messages
alter publication supabase_realtime add table public.messages;

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'username', lower(split_part(new.email, '@', 1)) || '_' || substr(new.id::text, 1, 6))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: update chat updated_at on new message
create or replace function public.update_chat_updated_at()
returns trigger as $$
begin
  update public.chats set updated_at = now() where id = new.chat_id;
  return new;
end;
$$ language plpgsql;

create or replace trigger on_message_created
  after insert on public.messages
  for each row execute function public.update_chat_updated_at();
