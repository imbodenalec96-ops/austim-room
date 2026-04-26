-- =========================================================================
-- 009_more_boards.sql — 20 more matching activity boards
--
-- Run AFTER 002_boards.sql. Idempotent (on conflict (id) do nothing).
-- All new IDs use the cccc001x..cccc002x range; no collision with the
-- 6 boards seeded in 002_boards.sql (cccc0001..cccc0006).
-- =========================================================================

insert into public.boards (id, classroom_id, title, kind, background, layout) values

-- ---------- 7. Count to 10 (extend) -------------------------------------
('cccc0010-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Count to 10', 'count', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"1"},{"id":"z2","label":"2"},{"id":"z3","label":"3"},
    {"id":"z4","label":"4"},{"id":"z5","label":"5"},{"id":"z6","label":"6"},
    {"id":"z7","label":"7"},{"id":"z8","label":"8"},{"id":"z9","label":"9"},
    {"id":"z10","label":"10"}
  ],
  "tiles": [
    {"id":"t1","label":"1","emoji":"⭐","correctZoneId":"z1"},
    {"id":"t2","label":"2","emoji":"⭐⭐","correctZoneId":"z2"},
    {"id":"t3","label":"3","emoji":"⭐⭐⭐","correctZoneId":"z3"},
    {"id":"t4","label":"4","emoji":"⭐⭐⭐⭐","correctZoneId":"z4"},
    {"id":"t5","label":"5","emoji":"⭐⭐⭐⭐⭐","correctZoneId":"z5"},
    {"id":"t6","label":"6","emoji":"⭐⭐⭐⭐⭐⭐","correctZoneId":"z6"},
    {"id":"t7","label":"7","emoji":"⭐⭐⭐⭐⭐⭐⭐","correctZoneId":"z7"},
    {"id":"t8","label":"8","emoji":"⭐⭐⭐⭐⭐⭐⭐⭐","correctZoneId":"z8"},
    {"id":"t9","label":"9","emoji":"⭐⭐⭐⭐⭐⭐⭐⭐⭐","correctZoneId":"z9"},
    {"id":"t10","label":"10","emoji":"⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐","correctZoneId":"z10"}
  ]
}'::jsonb),

-- ---------- 8. Alphabet G–L --------------------------------------------
('cccc0011-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Alphabet G–L', 'alphabet', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"G"},{"id":"z2","label":"H"},{"id":"z3","label":"I"},
    {"id":"z4","label":"J"},{"id":"z5","label":"K"},{"id":"z6","label":"L"}
  ],
  "tiles": [
    {"id":"t1","label":"g","correctZoneId":"z1"},
    {"id":"t2","label":"h","correctZoneId":"z2"},
    {"id":"t3","label":"i","correctZoneId":"z3"},
    {"id":"t4","label":"j","correctZoneId":"z4"},
    {"id":"t5","label":"k","correctZoneId":"z5"},
    {"id":"t6","label":"l","correctZoneId":"z6"}
  ]
}'::jsonb),

-- ---------- 9. Alphabet M–R --------------------------------------------
('cccc0012-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Alphabet M–R', 'alphabet', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"M"},{"id":"z2","label":"N"},{"id":"z3","label":"O"},
    {"id":"z4","label":"P"},{"id":"z5","label":"Q"},{"id":"z6","label":"R"}
  ],
  "tiles": [
    {"id":"t1","label":"m","correctZoneId":"z1"},
    {"id":"t2","label":"n","correctZoneId":"z2"},
    {"id":"t3","label":"o","correctZoneId":"z3"},
    {"id":"t4","label":"p","correctZoneId":"z4"},
    {"id":"t5","label":"q","correctZoneId":"z5"},
    {"id":"t6","label":"r","correctZoneId":"z6"}
  ]
}'::jsonb),

-- ---------- 10. Alphabet S–Z -------------------------------------------
('cccc0013-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Alphabet S–Z', 'alphabet', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"S"},{"id":"z2","label":"T"},{"id":"z3","label":"U"},{"id":"z4","label":"V"},
    {"id":"z5","label":"W"},{"id":"z6","label":"X"},{"id":"z7","label":"Y"},{"id":"z8","label":"Z"}
  ],
  "tiles": [
    {"id":"t1","label":"s","correctZoneId":"z1"},
    {"id":"t2","label":"t","correctZoneId":"z2"},
    {"id":"t3","label":"u","correctZoneId":"z3"},
    {"id":"t4","label":"v","correctZoneId":"z4"},
    {"id":"t5","label":"w","correctZoneId":"z5"},
    {"id":"t6","label":"x","correctZoneId":"z6"},
    {"id":"t7","label":"y","correctZoneId":"z7"},
    {"id":"t8","label":"z","correctZoneId":"z8"}
  ]
}'::jsonb),

-- ---------- 11. More Shapes ---------------------------------------------
('cccc0014-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'More Shapes', 'shapes', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"hexagon","emoji":"⬡"},
    {"id":"z2","label":"pentagon","emoji":"⬠"},
    {"id":"z3","label":"oval","emoji":"⬭"},
    {"id":"z4","label":"diamond","emoji":"💎"},
    {"id":"z5","label":"heart","emoji":"❤️"},
    {"id":"z6","label":"crescent","emoji":"🌙"}
  ],
  "tiles": [
    {"id":"t1","label":"hexagon","emoji":"⬡","correctZoneId":"z1"},
    {"id":"t2","label":"pentagon","emoji":"⬠","correctZoneId":"z2"},
    {"id":"t3","label":"oval","emoji":"⬭","correctZoneId":"z3"},
    {"id":"t4","label":"diamond","emoji":"💎","correctZoneId":"z4"},
    {"id":"t5","label":"heart","emoji":"❤️","correctZoneId":"z5"},
    {"id":"t6","label":"crescent","emoji":"🌙","correctZoneId":"z6"}
  ]
}'::jsonb),

-- ---------- 12. All the Colors ------------------------------------------
('cccc0015-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'All the Colors', 'colors', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"red","color":"#dc2626"},
    {"id":"z2","label":"orange","color":"#f97316"},
    {"id":"z3","label":"yellow","color":"#facc15"},
    {"id":"z4","label":"green","color":"#16a34a"},
    {"id":"z5","label":"blue","color":"#2563eb"},
    {"id":"z6","label":"purple","color":"#9333ea"},
    {"id":"z7","label":"pink","color":"#ec4899"},
    {"id":"z8","label":"brown","color":"#78350f"},
    {"id":"z9","label":"black","color":"#111827"}
  ],
  "tiles": [
    {"id":"t1","label":"red","color":"#dc2626","correctZoneId":"z1"},
    {"id":"t2","label":"orange","color":"#f97316","correctZoneId":"z2"},
    {"id":"t3","label":"yellow","color":"#facc15","correctZoneId":"z3"},
    {"id":"t4","label":"green","color":"#16a34a","correctZoneId":"z4"},
    {"id":"t5","label":"blue","color":"#2563eb","correctZoneId":"z5"},
    {"id":"t6","label":"purple","color":"#9333ea","correctZoneId":"z6"},
    {"id":"t7","label":"pink","color":"#ec4899","correctZoneId":"z7"},
    {"id":"t8","label":"brown","color":"#78350f","correctZoneId":"z8"},
    {"id":"t9","label":"black","color":"#111827","correctZoneId":"z9"}
  ]
}'::jsonb),

-- ---------- 13. Face Parts -----------------------------------------------
('cccc0016-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Face Parts', 'face-parts', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"eyes","emoji":"👀"},
    {"id":"z2","label":"nose","emoji":"👃"},
    {"id":"z3","label":"mouth","emoji":"👄"},
    {"id":"z4","label":"ears","emoji":"👂"},
    {"id":"z5","label":"hair","emoji":"💇"}
  ],
  "tiles": [
    {"id":"t1","label":"eyes","emoji":"👀","correctZoneId":"z1"},
    {"id":"t2","label":"nose","emoji":"👃","correctZoneId":"z2"},
    {"id":"t3","label":"mouth","emoji":"👄","correctZoneId":"z3"},
    {"id":"t4","label":"ears","emoji":"👂","correctZoneId":"z4"},
    {"id":"t5","label":"hair","emoji":"💇","correctZoneId":"z5"}
  ]
}'::jsonb),

-- ---------- 14. Days of the Week ----------------------------------------
('cccc0017-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Days of the Week', 'sort', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"Mon"},{"id":"z2","label":"Tue"},{"id":"z3","label":"Wed"},
    {"id":"z4","label":"Thu"},{"id":"z5","label":"Fri"},{"id":"z6","label":"Sat"},
    {"id":"z7","label":"Sun"}
  ],
  "tiles": [
    {"id":"t1","label":"Monday","emoji":"📅","correctZoneId":"z1"},
    {"id":"t2","label":"Tuesday","emoji":"📅","correctZoneId":"z2"},
    {"id":"t3","label":"Wednesday","emoji":"📅","correctZoneId":"z3"},
    {"id":"t4","label":"Thursday","emoji":"📅","correctZoneId":"z4"},
    {"id":"t5","label":"Friday","emoji":"📅","correctZoneId":"z5"},
    {"id":"t6","label":"Saturday","emoji":"🛝","correctZoneId":"z6"},
    {"id":"t7","label":"Sunday","emoji":"🛝","correctZoneId":"z7"}
  ]
}'::jsonb),

-- ---------- 15. Numbers to Words ----------------------------------------
('cccc0018-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Numbers to Words', 'count', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"one"},{"id":"z2","label":"two"},{"id":"z3","label":"three"},
    {"id":"z4","label":"four"},{"id":"z5","label":"five"},{"id":"z6","label":"six"},
    {"id":"z7","label":"seven"},{"id":"z8","label":"eight"}
  ],
  "tiles": [
    {"id":"t1","label":"1","correctZoneId":"z1"},
    {"id":"t2","label":"2","correctZoneId":"z2"},
    {"id":"t3","label":"3","correctZoneId":"z3"},
    {"id":"t4","label":"4","correctZoneId":"z4"},
    {"id":"t5","label":"5","correctZoneId":"z5"},
    {"id":"t6","label":"6","correctZoneId":"z6"},
    {"id":"t7","label":"7","correctZoneId":"z7"},
    {"id":"t8","label":"8","correctZoneId":"z8"}
  ]
}'::jsonb),

-- ---------- 16. Living vs Non-living ------------------------------------
('cccc0019-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Living or Not Living?', 'sort', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"Living","kind":"large","emoji":"🌿"},
    {"id":"z2","label":"Not Living","kind":"large","emoji":"🪨"}
  ],
  "tiles": [
    {"id":"t1","label":"dog","emoji":"🐕","correctZoneId":"z1"},
    {"id":"t2","label":"flower","emoji":"🌸","correctZoneId":"z1"},
    {"id":"t3","label":"tree","emoji":"🌳","correctZoneId":"z1"},
    {"id":"t4","label":"bird","emoji":"🐦","correctZoneId":"z1"},
    {"id":"t5","label":"rock","emoji":"🪨","correctZoneId":"z2"},
    {"id":"t6","label":"car","emoji":"🚗","correctZoneId":"z2"},
    {"id":"t7","label":"chair","emoji":"🪑","correctZoneId":"z2"},
    {"id":"t8","label":"book","emoji":"📕","correctZoneId":"z2"}
  ]
}'::jsonb),

-- ---------- 17. Hot vs Cold ---------------------------------------------
('cccc001a-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Hot or Cold?', 'sort', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"Hot","kind":"large","emoji":"🔥","color":"#dc2626"},
    {"id":"z2","label":"Cold","kind":"large","emoji":"❄️","color":"#2563eb"}
  ],
  "tiles": [
    {"id":"t1","label":"fire",     "emoji":"🔥","correctZoneId":"z1"},
    {"id":"t2","label":"sun",      "emoji":"☀️","correctZoneId":"z1"},
    {"id":"t3","label":"hot cocoa","emoji":"☕","correctZoneId":"z1"},
    {"id":"t4","label":"soup",     "emoji":"🍲","correctZoneId":"z1"},
    {"id":"t5","label":"snow",     "emoji":"⛄","correctZoneId":"z2"},
    {"id":"t6","label":"ice",      "emoji":"🧊","correctZoneId":"z2"},
    {"id":"t7","label":"ice cream","emoji":"🍦","correctZoneId":"z2"},
    {"id":"t8","label":"snowflake","emoji":"❄️","correctZoneId":"z2"}
  ]
}'::jsonb),

-- ---------- 18. Big vs Small --------------------------------------------
('cccc001b-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Big or Small?', 'sort', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"Big","kind":"large","emoji":"🐘"},
    {"id":"z2","label":"Small","kind":"large","emoji":"🐜"}
  ],
  "tiles": [
    {"id":"t1","label":"elephant","emoji":"🐘","correctZoneId":"z1"},
    {"id":"t2","label":"whale","emoji":"🐋","correctZoneId":"z1"},
    {"id":"t3","label":"truck","emoji":"🚛","correctZoneId":"z1"},
    {"id":"t4","label":"house","emoji":"🏠","correctZoneId":"z1"},
    {"id":"t5","label":"ant","emoji":"🐜","correctZoneId":"z2"},
    {"id":"t6","label":"mouse","emoji":"🐁","correctZoneId":"z2"},
    {"id":"t7","label":"button","emoji":"🔘","correctZoneId":"z2"},
    {"id":"t8","label":"key","emoji":"🔑","correctZoneId":"z2"}
  ]
}'::jsonb),

-- ---------- 19. Healthy Foods vs Treats ---------------------------------
('cccc001c-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Healthy Foods or Treats?', 'sort', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"Healthy","kind":"large","emoji":"🥗","color":"#16a34a"},
    {"id":"z2","label":"Treats","kind":"large","emoji":"🍭","color":"#ec4899"}
  ],
  "tiles": [
    {"id":"t1","label":"apple","emoji":"🍎","correctZoneId":"z1"},
    {"id":"t2","label":"broccoli","emoji":"🥦","correctZoneId":"z1"},
    {"id":"t3","label":"carrot","emoji":"🥕","correctZoneId":"z1"},
    {"id":"t4","label":"banana","emoji":"🍌","correctZoneId":"z1"},
    {"id":"t5","label":"candy","emoji":"🍬","correctZoneId":"z2"},
    {"id":"t6","label":"cake","emoji":"🍰","correctZoneId":"z2"},
    {"id":"t7","label":"donut","emoji":"🍩","correctZoneId":"z2"},
    {"id":"t8","label":"ice cream","emoji":"🍦","correctZoneId":"z2"}
  ]
}'::jsonb),

-- ---------- 20. Land / Air / Water (transportation) --------------------
('cccc001d-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'How Does It Move? (Land · Air · Water)', 'transportation', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"Land","kind":"large","emoji":"🛣️"},
    {"id":"z2","label":"Air","kind":"large","emoji":"☁️"},
    {"id":"z3","label":"Water","kind":"large","emoji":"🌊"}
  ],
  "tiles": [
    {"id":"t1","label":"car","emoji":"🚗","correctZoneId":"z1"},
    {"id":"t2","label":"bus","emoji":"🚌","correctZoneId":"z1"},
    {"id":"t3","label":"bike","emoji":"🚲","correctZoneId":"z1"},
    {"id":"t4","label":"airplane","emoji":"✈️","correctZoneId":"z2"},
    {"id":"t5","label":"helicopter","emoji":"🚁","correctZoneId":"z2"},
    {"id":"t6","label":"hot-air balloon","emoji":"🎈","correctZoneId":"z2"},
    {"id":"t7","label":"boat","emoji":"⛵","correctZoneId":"z3"},
    {"id":"t8","label":"ship","emoji":"🚢","correctZoneId":"z3"},
    {"id":"t9","label":"submarine","emoji":"🛥️","correctZoneId":"z3"}
  ]
}'::jsonb),

-- ---------- 21. Animal Babies -------------------------------------------
('cccc001e-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Animal Babies', 'picture-word', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"cow","emoji":"🐄"},
    {"id":"z2","label":"dog","emoji":"🐕"},
    {"id":"z3","label":"cat","emoji":"🐈"},
    {"id":"z4","label":"horse","emoji":"🐎"},
    {"id":"z5","label":"sheep","emoji":"🐑"},
    {"id":"z6","label":"chicken","emoji":"🐔"}
  ],
  "tiles": [
    {"id":"t1","label":"calf","emoji":"🐮","correctZoneId":"z1"},
    {"id":"t2","label":"puppy","emoji":"🐶","correctZoneId":"z2"},
    {"id":"t3","label":"kitten","emoji":"🐱","correctZoneId":"z3"},
    {"id":"t4","label":"foal","emoji":"🐴","correctZoneId":"z4"},
    {"id":"t5","label":"lamb","emoji":"🐑","correctZoneId":"z5"},
    {"id":"t6","label":"chick","emoji":"🐤","correctZoneId":"z6"}
  ]
}'::jsonb),

-- ---------- 22. Animal Homes --------------------------------------------
('cccc001f-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Where Do They Live?', 'picture-word', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"nest","emoji":"🪺"},
    {"id":"z2","label":"doghouse","emoji":"🏠"},
    {"id":"z3","label":"barn","emoji":"🚜"},
    {"id":"z4","label":"ocean","emoji":"🌊"},
    {"id":"z5","label":"jungle","emoji":"🌴"},
    {"id":"z6","label":"web","emoji":"🕸️"}
  ],
  "tiles": [
    {"id":"t1","label":"bird","emoji":"🐦","correctZoneId":"z1"},
    {"id":"t2","label":"dog","emoji":"🐕","correctZoneId":"z2"},
    {"id":"t3","label":"cow","emoji":"🐄","correctZoneId":"z3"},
    {"id":"t4","label":"fish","emoji":"🐟","correctZoneId":"z4"},
    {"id":"t5","label":"monkey","emoji":"🐒","correctZoneId":"z5"},
    {"id":"t6","label":"spider","emoji":"🕷️","correctZoneId":"z6"}
  ]
}'::jsonb),

-- ---------- 23. First Letter Match (picture → letter) ------------------
('cccc0020-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'First Letter Match', 'alphabet', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"A"},{"id":"z2","label":"B"},{"id":"z3","label":"C"},
    {"id":"z4","label":"D"},{"id":"z5","label":"E"},{"id":"z6","label":"F"}
  ],
  "tiles": [
    {"id":"t1","label":"apple","emoji":"🍎","correctZoneId":"z1"},
    {"id":"t2","label":"ball","emoji":"⚽","correctZoneId":"z2"},
    {"id":"t3","label":"cat","emoji":"🐈","correctZoneId":"z3"},
    {"id":"t4","label":"dog","emoji":"🐕","correctZoneId":"z4"},
    {"id":"t5","label":"egg","emoji":"🥚","correctZoneId":"z5"},
    {"id":"t6","label":"fish","emoji":"🐟","correctZoneId":"z6"}
  ]
}'::jsonb),

-- ---------- 24. Time of Day → Activity ---------------------------------
('cccc0021-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Time of Day', 'sort', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"Morning","kind":"large","emoji":"🌅"},
    {"id":"z2","label":"Noon","kind":"large","emoji":"☀️"},
    {"id":"z3","label":"Night","kind":"large","emoji":"🌙"}
  ],
  "tiles": [
    {"id":"t1","label":"breakfast","emoji":"🥞","correctZoneId":"z1"},
    {"id":"t2","label":"sunrise","emoji":"🌄","correctZoneId":"z1"},
    {"id":"t3","label":"brush teeth","emoji":"🪥","correctZoneId":"z1"},
    {"id":"t4","label":"lunch","emoji":"🥪","correctZoneId":"z2"},
    {"id":"t5","label":"recess","emoji":"⚽","correctZoneId":"z2"},
    {"id":"t6","label":"sun high","emoji":"🌞","correctZoneId":"z2"},
    {"id":"t7","label":"dinner","emoji":"🍝","correctZoneId":"z3"},
    {"id":"t8","label":"sleep","emoji":"😴","correctZoneId":"z3"},
    {"id":"t9","label":"stars","emoji":"⭐","correctZoneId":"z3"}
  ]
}'::jsonb),

-- ---------- 25. Seasons -------------------------------------------------
('cccc0022-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Seasons', 'sort', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"Spring","kind":"large","emoji":"🌸"},
    {"id":"z2","label":"Summer","kind":"large","emoji":"☀️"},
    {"id":"z3","label":"Fall","kind":"large","emoji":"🍂"},
    {"id":"z4","label":"Winter","kind":"large","emoji":"❄️"}
  ],
  "tiles": [
    {"id":"t1","label":"flowers","emoji":"🌷","correctZoneId":"z1"},
    {"id":"t2","label":"rain","emoji":"🌧️","correctZoneId":"z1"},
    {"id":"t3","label":"swimming","emoji":"🏊","correctZoneId":"z2"},
    {"id":"t4","label":"sun","emoji":"☀️","correctZoneId":"z2"},
    {"id":"t5","label":"leaves","emoji":"🍁","correctZoneId":"z3"},
    {"id":"t6","label":"pumpkin","emoji":"🎃","correctZoneId":"z3"},
    {"id":"t7","label":"snow","emoji":"⛄","correctZoneId":"z4"},
    {"id":"t8","label":"mittens","emoji":"🧤","correctZoneId":"z4"}
  ]
}'::jsonb),

-- ---------- 26. Tools and Jobs ------------------------------------------
('cccc0023-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Who Uses This?', 'picture-word', '#fffaf0',
 '{
  "settings": {"errorless": true, "audioOnTap": true, "soundOnCorrect": true, "feedbackOn": "instant", "showLabels": true},
  "zones": [
    {"id":"z1","label":"chef","emoji":"👨‍🍳"},
    {"id":"z2","label":"doctor","emoji":"🩺"},
    {"id":"z3","label":"firefighter","emoji":"🧑‍🚒"},
    {"id":"z4","label":"teacher","emoji":"👩‍🏫"},
    {"id":"z5","label":"farmer","emoji":"🧑‍🌾"},
    {"id":"z6","label":"artist","emoji":"🎨"}
  ],
  "tiles": [
    {"id":"t1","label":"pan","emoji":"🍳","correctZoneId":"z1"},
    {"id":"t2","label":"stethoscope","emoji":"🩺","correctZoneId":"z2"},
    {"id":"t3","label":"hose","emoji":"🚒","correctZoneId":"z3"},
    {"id":"t4","label":"book","emoji":"📚","correctZoneId":"z4"},
    {"id":"t5","label":"tractor","emoji":"🚜","correctZoneId":"z5"},
    {"id":"t6","label":"paint brush","emoji":"🖌️","correctZoneId":"z6"}
  ]
}'::jsonb)

on conflict (id) do nothing;
