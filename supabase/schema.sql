-- =========================================================================
-- Autism Classroom Platform - Schema, RLS, and Seed Data
-- Run this entire file in the Supabase SQL editor.
-- =========================================================================

-- ---------- Tables ------------------------------------------------------

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid references public.classrooms on delete cascade,
  full_name text not null,
  photo_url text,
  grade text,
  communication_mode text,
  prompt_hierarchy jsonb,
  sensory_supports jsonb,
  reinforcers jsonb,
  triggers text,
  academic_levels jsonb,
  goals jsonb,
  created_at timestamptz default now()
);

create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid references public.classrooms on delete cascade,
  student_id uuid references public.students on delete cascade,
  title text not null,
  icon text,
  color text,
  starts_at time not null,
  ends_at time not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  slide_url text,
  notes text,
  staff text,
  sort_order int default 0
);

create table if not exists public.pecs_icons (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  category text not null,
  emoji text,
  image_url text,
  audio_url text,
  sort_order int default 0
);

create table if not exists public.pecs_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students on delete cascade not null,
  icon_id uuid references public.pecs_icons on delete restrict not null,
  status text default 'pending' not null check (status in ('pending','in_progress','completed','denied','redirected')),
  created_at timestamptz default now() not null,
  resolved_at timestamptz,
  resolved_by uuid,
  notes text
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students on delete cascade,
  title text not null,
  domain text,
  difficulty int,
  support_level text,
  payload jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_pecs_requests_status on public.pecs_requests (status, created_at desc);
create index if not exists idx_pecs_requests_student on public.pecs_requests (student_id, created_at desc);
create index if not exists idx_schedule_blocks_lookup on public.schedule_blocks (day_of_week, starts_at);

-- ---------- Realtime publication ----------------------------------------

alter publication supabase_realtime add table public.pecs_requests;
alter publication supabase_realtime add table public.schedule_blocks;

-- ---------- Row Level Security ------------------------------------------
-- This is a starter policy: open read, anon insert for pecs_requests so
-- the demo works without auth. Tighten before production: gate by JWT
-- claims (role = 'teacher' / 'student_device') and classroom_id match.

alter table public.classrooms       enable row level security;
alter table public.students         enable row level security;
alter table public.schedule_blocks  enable row level security;
alter table public.pecs_icons       enable row level security;
alter table public.pecs_requests    enable row level security;
alter table public.assignments      enable row level security;

-- Read for everyone (demo). Replace with auth-gated policies later.
create policy "read classrooms"      on public.classrooms      for select using (true);
create policy "read students"        on public.students        for select using (true);
create policy "read schedule_blocks" on public.schedule_blocks for select using (true);
create policy "read pecs_icons"      on public.pecs_icons      for select using (true);
create policy "read pecs_requests"   on public.pecs_requests   for select using (true);
create policy "read assignments"     on public.assignments     for select using (true);

-- Anon can create PECS requests (the student device path).
create policy "insert pecs_requests" on public.pecs_requests for insert with check (true);
-- Anon can update PECS request status (teacher dashboard demo).
create policy "update pecs_requests" on public.pecs_requests for update using (true) with check (true);

-- =========================================================================
-- Seed data
-- =========================================================================

-- One classroom
insert into public.classrooms (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Room 12 - Autism Support')
on conflict (id) do nothing;

-- Four students
insert into public.students (id, classroom_id, full_name, grade, communication_mode, prompt_hierarchy, sensory_supports, reinforcers, goals) values
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Leo M.',     'K', 'PECS + verbal approximations', '["gestural","verbal","model","physical"]'::jsonb, '["weighted lap pad","noise-reducing headphones"]'::jsonb, '["bubbles","trains","iPad time"]'::jsonb, '["Request preferred items using 3-icon sentence","Tolerate 5 min of work with 1 break"]'::jsonb),
  ('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Maya R.',    '1', 'AAC device + verbal', '["independent","gestural","verbal"]'::jsonb, '["movement breaks","fidget"]'::jsonb, '["stickers","drawing","music"]'::jsonb, '["Match numbers 1-10","Identify colors with 80% accuracy"]'::jsonb),
  ('aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Jamal K.',   '2', 'Verbal',              '["verbal","model"]'::jsonb,                       '["calm corner access","sensory bin"]'::jsonb, '["puzzles","dinosaurs","trampoline"]'::jsonb, '["Read sight words list 1","Sort by category 90% accuracy"]'::jsonb),
  ('aaaa4444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Priya S.',   'K', 'PECS',                '["physical","model","gestural"]'::jsonb,          '["chewy","weighted vest"]'::jsonb,            '["bubbles","Mr. Potato Head"]'::jsonb, '["Request break using PECS","Tolerate transitions with countdown"]'::jsonb)
on conflict (id) do nothing;

-- PECS icons (using emoji for demo; swap for real PECS images later)
insert into public.pecs_icons (id, label, category, emoji, sort_order) values
  ('bbbb0001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'water',       'needs',   '💧', 1),
  ('bbbb0002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'snack',       'needs',   '🍎', 2),
  ('bbbb0003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bathroom',    'needs',   '🚻', 3),
  ('bbbb0004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'break',       'needs',   '⏸️', 4),
  ('bbbb0005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'help',        'needs',   '🙋', 5),
  ('bbbb0006-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'all done',    'actions', '✅', 6),
  ('bbbb0007-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'yes',         'social',  '👍', 7),
  ('bbbb0008-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'no',          'social',  '👎', 8),
  ('bbbb0009-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'happy',       'feelings','😊', 9),
  ('bbbb0010-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sad',         'feelings','😢', 10),
  ('bbbb0011-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'frustrated',  'feelings','😣', 11),
  ('bbbb0012-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'calm corner', 'sensory', '🧘', 12),
  ('bbbb0013-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'iPad',        'actions', '📱', 13),
  ('bbbb0014-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bubbles',     'actions', '🫧', 14),
  ('bbbb0015-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'music',       'actions', '🎵', 15),
  ('bbbb0016-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'teacher',     'people',  '👩‍🏫', 16)
on conflict (id) do nothing;

-- Class-wide schedule blocks for a typical day (day_of_week 1=Mon..5=Fri)
do $$
declare d int;
begin
  for d in 1..5 loop
    insert into public.schedule_blocks (classroom_id, title, icon, color, starts_at, ends_at, day_of_week, sort_order, staff, notes) values
      ('11111111-1111-1111-1111-111111111111', 'Arrival & Calm Greeting', '🌅', '#fde68a', '08:30', '09:00', d, 1,  'Ms. Carter', 'Hang up backpack, choose calm activity'),
      ('11111111-1111-1111-1111-111111111111', 'Morning Meeting',         '🌞', '#fdba74', '09:00', '09:20', d, 2,  'Ms. Carter', 'Calendar, weather, feelings check-in'),
      ('11111111-1111-1111-1111-111111111111', 'Reading Center',          '📖', '#bbf7d0', '09:20', '10:00', d, 3,  'Ms. Carter + Para', 'Differentiated by group'),
      ('11111111-1111-1111-1111-111111111111', 'Sensory Break',           '🧘', '#bae6fd', '10:00', '10:15', d, 4,  'Para',       'Movement room or calm corner'),
      ('11111111-1111-1111-1111-111111111111', 'Math Center',             '🔢', '#c7d2fe', '10:15', '11:00', d, 5,  'Ms. Carter', 'Number matching, counting'),
      ('11111111-1111-1111-1111-111111111111', 'Specials',                '🎨', '#fbcfe8', '11:00', '11:40', d, 6,  'Specials',   'Rotates: art / music / adapted PE'),
      ('11111111-1111-1111-1111-111111111111', 'Lunch',                   '🍱', '#fcd34d', '11:40', '12:15', d, 7,  'All',        'Visual menu posted'),
      ('11111111-1111-1111-1111-111111111111', 'Recess',                  '⚽', '#86efac', '12:15', '12:45', d, 8,  'Para',       'Outdoor or gym depending on weather'),
      ('11111111-1111-1111-1111-111111111111', 'Quiet Time',              '🌙', '#ddd6fe', '12:45', '13:05', d, 9,  'Para',       'Books or calm corner'),
      ('11111111-1111-1111-1111-111111111111', '1:1 Work',                '👤', '#a7f3d0', '13:05', '13:45', d, 10, 'Ms. Carter', 'Discrete trial, IEP goals'),
      ('11111111-1111-1111-1111-111111111111', 'Life Skills',             '🧺', '#fed7aa', '13:45', '14:15', d, 11, 'Para',       'Folding, sorting, snack prep'),
      ('11111111-1111-1111-1111-111111111111', 'Closing Circle',          '👋', '#fecaca', '14:15', '14:35', d, 12, 'Ms. Carter', 'Review day, pack up')
    on conflict do nothing;
  end loop;
end $$;

-- Sample assignments
insert into public.assignments (student_id, title, domain, difficulty, support_level, payload) values
  ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Color matching: red & blue', 'visual',  1, 'errorless',     '{"items":["red","blue"]}'::jsonb),
  ('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Number match 1-5',           'math',    1, 'gestural',      '{"range":[1,5]}'::jsonb),
  ('aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sight words list 1',         'reading', 2, 'verbal',        '{"words":["the","and","a","I","to"]}'::jsonb),
  ('aaaa4444-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Request break with PECS',    'comm',    1, 'physical',      '{"icon":"break"}'::jsonb)
on conflict do nothing;
