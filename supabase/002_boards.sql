-- =========================================================================
-- Matching Boards: schema, RLS, attempts logging, and 6 seeded boards
-- Run this AFTER schema.sql in the Supabase SQL editor.
-- =========================================================================

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid references public.classrooms on delete cascade,
  title text not null,
  kind text not null,
  background text,
  layout jsonb not null,
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists public.board_attempts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references public.boards on delete cascade not null,
  student_id uuid references public.students on delete cascade not null,
  completed boolean default false,
  correct_count int default 0,
  incorrect_count int default 0,
  duration_sec int default 0,
  prompt_level text,
  independence_level int,
  errorless boolean default false,
  audio_used boolean default false,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_board_attempts_student on public.board_attempts (student_id, created_at desc);
create index if not exists idx_board_attempts_board   on public.board_attempts (board_id, created_at desc);

alter publication supabase_realtime add table public.board_attempts;

alter table public.boards enable row level security;
alter table public.board_attempts enable row level security;

create policy "read boards"             on public.boards          for select using (true);
create policy "read board_attempts"     on public.board_attempts  for select using (true);
create policy "insert board_attempts"   on public.board_attempts  for insert with check (true);
create policy "update board_attempts"   on public.board_attempts  for update using (true) with check (true);

-- =========================================================================
-- Seed boards. Each layout has the shape:
--   {
--     "settings": { "errorless": bool, "audioOnTap": bool, "soundOnCorrect": bool,
--                   "feedbackOn": "instant"|"delayed"|"none", "showLabels": bool },
--     "zones":  [ {id, label, kind?, color?, emoji?} ],
--     "tiles":  [ {id, label, color?, emoji?, image_url?, audio_url?, correctZoneId} ]
--   }
-- The component renders zones and tiles automatically from `kind` + colors/emoji.
-- =========================================================================

insert into public.boards (id, classroom_id, title, kind, background, layout) values
-- ---------- 1. Colors ----------------------------------------------------
('cccc0001-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Colors', 'colors', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"red","color":"#dc2626"},
    {"id":"z2","label":"blue","color":"#2563eb"},
    {"id":"z3","label":"yellow","color":"#facc15"},
    {"id":"z4","label":"green","color":"#16a34a"},
    {"id":"z5","label":"orange","color":"#f97316"},
    {"id":"z6","label":"purple","color":"#9333ea"}
  ],
  "tiles": [
    {"id":"t1","label":"red","color":"#dc2626","correctZoneId":"z1"},
    {"id":"t2","label":"blue","color":"#2563eb","correctZoneId":"z2"},
    {"id":"t3","label":"yellow","color":"#facc15","correctZoneId":"z3"},
    {"id":"t4","label":"green","color":"#16a34a","correctZoneId":"z4"},
    {"id":"t5","label":"orange","color":"#f97316","correctZoneId":"z5"},
    {"id":"t6","label":"purple","color":"#9333ea","correctZoneId":"z6"}
  ]
}'::jsonb),

-- ---------- 2. Shapes ----------------------------------------------------
('cccc0002-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Shapes', 'shapes', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"circle","emoji":"⭕"},
    {"id":"z2","label":"square","emoji":"⬛"},
    {"id":"z3","label":"triangle","emoji":"🔺"},
    {"id":"z4","label":"rectangle","emoji":"▭"},
    {"id":"z5","label":"star","emoji":"⭐"}
  ],
  "tiles": [
    {"id":"t1","label":"circle","emoji":"⭕","correctZoneId":"z1"},
    {"id":"t2","label":"square","emoji":"⬛","correctZoneId":"z2"},
    {"id":"t3","label":"triangle","emoji":"🔺","correctZoneId":"z3"},
    {"id":"t4","label":"rectangle","emoji":"▭","correctZoneId":"z4"},
    {"id":"t5","label":"star","emoji":"⭐","correctZoneId":"z5"}
  ]
}'::jsonb),

-- ---------- 3. Count to 5 -------------------------------------------------
('cccc0003-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Count to 5', 'count', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"1"},
    {"id":"z2","label":"2"},
    {"id":"z3","label":"3"},
    {"id":"z4","label":"4"},
    {"id":"z5","label":"5"}
  ],
  "tiles": [
    {"id":"t1","label":"one","emoji":"🍎","correctZoneId":"z1","count":1},
    {"id":"t2","label":"two","emoji":"🍎🍎","correctZoneId":"z2","count":2},
    {"id":"t3","label":"three","emoji":"🍎🍎🍎","correctZoneId":"z3","count":3},
    {"id":"t4","label":"four","emoji":"🍎🍎🍎🍎","correctZoneId":"z4","count":4},
    {"id":"t5","label":"five","emoji":"🍎🍎🍎🍎🍎","correctZoneId":"z5","count":5}
  ]
}'::jsonb),

-- ---------- 4. Alphabet (A-F) -------------------------------------------
('cccc0004-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Alphabet A–F', 'alphabet', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"A"},
    {"id":"z2","label":"B"},
    {"id":"z3","label":"C"},
    {"id":"z4","label":"D"},
    {"id":"z5","label":"E"},
    {"id":"z6","label":"F"}
  ],
  "tiles": [
    {"id":"t1","label":"a","correctZoneId":"z1"},
    {"id":"t2","label":"b","correctZoneId":"z2"},
    {"id":"t3","label":"c","correctZoneId":"z3"},
    {"id":"t4","label":"d","correctZoneId":"z4"},
    {"id":"t5","label":"e","correctZoneId":"z5"},
    {"id":"t6","label":"f","correctZoneId":"z6"}
  ]
}'::jsonb),

-- ---------- 5. Weather --------------------------------------------------
('cccc0005-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Weather', 'weather', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"sunny","emoji":"☀️"},
    {"id":"z2","label":"rainy","emoji":"🌧️"},
    {"id":"z3","label":"cloudy","emoji":"☁️"},
    {"id":"z4","label":"snowy","emoji":"❄️"}
  ],
  "tiles": [
    {"id":"t1","label":"sunny","emoji":"☀️","correctZoneId":"z1"},
    {"id":"t2","label":"rainy","emoji":"🌧️","correctZoneId":"z2"},
    {"id":"t3","label":"cloudy","emoji":"☁️","correctZoneId":"z3"},
    {"id":"t4","label":"snowy","emoji":"❄️","correctZoneId":"z4"}
  ]
}'::jsonb),

-- ---------- 6. Animals: Farm vs Wild ------------------------------------
('cccc0006-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Animals: Farm or Wild', 'sort', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"Farm","kind":"large","emoji":"🚜"},
    {"id":"z2","label":"Wild","kind":"large","emoji":"🌳"}
  ],
  "tiles": [
    {"id":"t1","label":"cow",     "emoji":"🐄","correctZoneId":"z1"},
    {"id":"t2","label":"pig",     "emoji":"🐖","correctZoneId":"z1"},
    {"id":"t3","label":"chicken", "emoji":"🐔","correctZoneId":"z1"},
    {"id":"t4","label":"lion",    "emoji":"🦁","correctZoneId":"z2"},
    {"id":"t5","label":"tiger",   "emoji":"🐅","correctZoneId":"z2"},
    {"id":"t6","label":"elephant","emoji":"🐘","correctZoneId":"z2"}
  ]
}'::jsonb)
on conflict (id) do nothing;
