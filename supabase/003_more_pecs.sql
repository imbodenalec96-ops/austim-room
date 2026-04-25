-- =========================================================================
-- More PECS icons (30+) — classroom essentials beyond the original 16.
-- Run this in the Supabase SQL editor. Idempotent.
-- =========================================================================

insert into public.pecs_icons (id, label, category, emoji, sort_order) values
  -- Needs (extend)
  ('bbbb1001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'milk',           'needs',   '🥛', 20),
  ('bbbb1002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'juice',          'needs',   '🧃', 21),
  ('bbbb1003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'crackers',       'needs',   '🍪', 22),
  ('bbbb1004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'fruit',          'needs',   '🍌', 23),
  ('bbbb1005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'tissue',         'needs',   '🧻', 24),
  ('bbbb1006-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'more',           'needs',   '➕', 25),
  ('bbbb1007-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'stop',           'needs',   '✋', 26),
  ('bbbb1008-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'please',         'social',  '🙏', 27),
  ('bbbb1009-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'thank you',      'social',  '🤗', 28),

  -- Feelings (extend)
  ('bbbb1010-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'tired',          'feelings','😴', 30),
  ('bbbb1011-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'scared',         'feelings','😨', 31),
  ('bbbb1012-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mad',            'feelings','😠', 32),
  ('bbbb1013-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sick',           'feelings','🤒', 33),
  ('bbbb1014-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'hurt',           'feelings','🤕', 34),
  ('bbbb1015-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'excited',        'feelings','🤩', 35),
  ('bbbb1016-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'calm',           'feelings','😌', 36),
  ('bbbb1017-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'silly',          'feelings','🤪', 37),

  -- Actions / activities
  ('bbbb1020-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'read',           'actions', '📖', 40),
  ('bbbb1021-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'write',          'actions', '✏️', 41),
  ('bbbb1022-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'draw',           'actions', '🎨', 42),
  ('bbbb1023-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'play',           'actions', '🧸', 43),
  ('bbbb1024-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eat',            'actions', '🍽️', 44),
  ('bbbb1025-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'walk',           'actions', '🚶', 45),
  ('bbbb1026-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'jump',           'actions', '🤸', 46),
  ('bbbb1027-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sing',           'actions', '🎤', 47),
  ('bbbb1028-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'listen',         'actions', '👂', 48),
  ('bbbb1029-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'look',           'actions', '👀', 49),

  -- People
  ('bbbb1030-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mom',            'people',  '👩', 50),
  ('bbbb1031-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dad',            'people',  '👨', 51),
  ('bbbb1032-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'friend',         'people',  '🧒', 52),
  ('bbbb1033-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'nurse',          'people',  '🩺', 53),
  ('bbbb1034-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'principal',      'people',  '👔', 54),

  -- Places
  ('bbbb1040-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'home',           'places',  '🏠', 60),
  ('bbbb1041-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'gym',            'places',  '🏃', 61),
  ('bbbb1042-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'library',        'places',  '📚', 62),
  ('bbbb1043-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'playground',     'places',  '🛝', 63),
  ('bbbb1044-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'classroom',      'places',  '🏫', 64),

  -- Sensory
  ('bbbb1050-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'swing',          'sensory', '🎢', 70),
  ('bbbb1051-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'fidget',         'sensory', '🌀', 71),
  ('bbbb1052-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'headphones',     'sensory', '🎧', 72),
  ('bbbb1053-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'weighted vest',  'sensory', '🦺', 73),
  ('bbbb1054-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'chewy',          'sensory', '🦷', 74),
  ('bbbb1055-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'quiet',          'sensory', '🤫', 75)
on conflict (id) do nothing;
