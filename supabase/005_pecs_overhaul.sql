-- =========================================================================
-- PECS overhaul: carrier phrases, daily care, transportation, food, school.
-- Run AFTER 003_more_pecs.sql. Idempotent.
-- =========================================================================

insert into public.pecs_icons (id, label, category, emoji, sort_order) values
  -- ---------- Carrier phrases (sentence-starters) ------------------------
  ('bbbb2001-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'I want',          'carrier', '🙋', 1),
  ('bbbb2002-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'I see',            'carrier', '👁️', 2),
  ('bbbb2003-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'I have',           'carrier', '🤲', 3),
  ('bbbb2004-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'I hear',           'carrier', '👂', 4),
  ('bbbb2005-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'I feel',           'carrier', '💭', 5),
  ('bbbb2006-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'I need',           'carrier', '🆘', 6),
  ('bbbb2007-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'it''s',            'carrier', '👉', 7),
  ('bbbb2008-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'it''s not',        'carrier', '🚫', 8),

  -- ---------- Self-care --------------------------------------------------
  ('bbbb2010-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'drink',            'care',    '🥤', 10),
  ('bbbb2011-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'toilet',           'care',    '🚽', 11),
  ('bbbb2012-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sleep',            'care',    '😴', 12),
  ('bbbb2013-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'brush teeth',      'care',    '🪥', 13),
  ('bbbb2014-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'wash hands',       'care',    '🧼', 14),
  ('bbbb2015-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bath',             'care',    '🛁', 15),
  ('bbbb2016-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'get dressed',      'care',    '👕', 16),
  ('bbbb2017-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'brush hair',       'care',    '💇', 17),
  ('bbbb2018-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'wipe',             'care',    '🧻', 18),

  -- ---------- Activities (extend) ---------------------------------------
  ('bbbb2020-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'outside',          'actions', '🌳', 20),
  ('bbbb2021-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'inside',           'actions', '🏠', 21),
  ('bbbb2022-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'dance',            'actions', '💃', 22),
  ('bbbb2023-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'run',              'actions', '🏃', 23),
  ('bbbb2024-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'swim',             'actions', '🏊', 24),
  ('bbbb2025-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'climb',            'actions', '🧗', 25),
  ('bbbb2026-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'color',            'actions', '🖍️', 26),
  ('bbbb2027-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'paint',            'actions', '🖌️', 27),
  ('bbbb2028-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'build',            'actions', '🧱', 28),
  ('bbbb2029-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'share',            'actions', '🤝', 29),
  ('bbbb2030-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'wait',             'social',  '⏳', 30),
  ('bbbb2031-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'work',             'actions', '📋', 31),
  ('bbbb2032-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'finish',           'actions', '🏁', 32),

  -- ---------- Transportation --------------------------------------------
  ('bbbb2040-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'car',              'transportation', '🚗', 40),
  ('bbbb2041-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bus',              'transportation', '🚌', 41),
  ('bbbb2042-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'train',            'transportation', '🚂', 42),
  ('bbbb2043-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'airplane',         'transportation', '✈️', 43),
  ('bbbb2044-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ship',             'transportation', '🚢', 44),
  ('bbbb2045-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bicycle',          'transportation', '🚲', 45),
  ('bbbb2046-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'motorcycle',       'transportation', '🏍️', 46),
  ('bbbb2047-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'subway',           'transportation', '🚇', 47),
  ('bbbb2048-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'scooter',          'transportation', '🛴', 48),
  ('bbbb2049-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'taxi',             'transportation', '🚕', 49),

  -- ---------- Food -------------------------------------------------------
  ('bbbb2060-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pizza',            'food',    '🍕', 60),
  ('bbbb2061-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sandwich',         'food',    '🥪', 61),
  ('bbbb2062-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'apple',            'food',    '🍎', 62),
  ('bbbb2063-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'banana',           'food',    '🍌', 63),
  ('bbbb2064-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cookie',           'food',    '🍪', 64),
  ('bbbb2065-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'candy',            'food',    '🍬', 65),
  ('bbbb2066-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'soup',             'food',    '🍲', 66),
  ('bbbb2067-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pasta',            'food',    '🍝', 67),
  ('bbbb2068-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'yogurt',           'food',    '🥣', 68),
  ('bbbb2069-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cereal',           'food',    '🥣', 69),
  ('bbbb2070-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eggs',             'food',    '🍳', 70),
  ('bbbb2071-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cheese',           'food',    '🧀', 71),

  -- ---------- School supplies -------------------------------------------
  ('bbbb2080-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pencil',           'school',  '✏️', 80),
  ('bbbb2081-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'paper',            'school',  '📄', 81),
  ('bbbb2082-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'book',             'school',  '📕', 82),
  ('bbbb2083-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'scissors',         'school',  '✂️', 83),
  ('bbbb2084-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'glue',             'school',  '🧴', 84),
  ('bbbb2085-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'computer',         'school',  '💻', 85),
  ('bbbb2086-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'marker',           'school',  '🖊️', 86),
  ('bbbb2087-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eraser',           'school',  '🧽', 87),
  ('bbbb2088-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'backpack',         'school',  '🎒', 88)
on conflict (id) do nothing;
