-- =========================================================================
-- 008_pecs_full_library.sql
-- Full PECS library expansion: 110+ new icons across pronouns, verbs,
-- feelings, social, people, school places, subjects, sensory tools,
-- hygiene, body parts, clothing, weather, more foods, time, and reinforcers.
--
-- Run AFTER 007_carrier.sql. Idempotent (on conflict (id) do nothing).
--
-- All new IDs use the 'dddd####' prefix so there is zero collision risk
-- with the existing 'bbbb####' icon IDs.
--
-- image_url is set to a placeholder URL for now. Swap real PECS images
-- in later via:
--   update public.pecs_icons set image_url = 'https://...' where label = 'eat';
-- =========================================================================

insert into public.pecs_icons (id, label, category, emoji, image_url, sort_order) values

  -- ---------- Pronouns ---------------------------------------------------
  ('dddd0001-dddd-dddd-dddd-dddddddddddd', 'I',              'pronouns', '🙋',   'https://placehold.co/256x256?text=I',         100),
  ('dddd0002-dddd-dddd-dddd-dddddddddddd', 'you',            'pronouns', '👉',   'https://placehold.co/256x256?text=you',       101),
  ('dddd0003-dddd-dddd-dddd-dddddddddddd', 'we',             'pronouns', '👥',   'https://placehold.co/256x256?text=we',        102),
  ('dddd0004-dddd-dddd-dddd-dddddddddddd', 'he',             'pronouns', '👦',   'https://placehold.co/256x256?text=he',        103),
  ('dddd0005-dddd-dddd-dddd-dddddddddddd', 'she',            'pronouns', '👧',   'https://placehold.co/256x256?text=she',       104),
  ('dddd0006-dddd-dddd-dddd-dddddddddddd', 'they',           'pronouns', '👫',   'https://placehold.co/256x256?text=they',      105),
  ('dddd0007-dddd-dddd-dddd-dddddddddddd', 'me',             'pronouns', '🫵',   'https://placehold.co/256x256?text=me',        106),
  ('dddd0008-dddd-dddd-dddd-dddddddddddd', 'my',             'pronouns', '🫳',   'https://placehold.co/256x256?text=my',        107),

  -- ---------- Actions / verbs (extend) ----------------------------------
  ('dddd0010-dddd-dddd-dddd-dddddddddddd', 'go',             'actions',  '➡️',   'https://placehold.co/256x256?text=go',        110),
  ('dddd0011-dddd-dddd-dddd-dddddddddddd', 'open',           'actions',  '📂',   'https://placehold.co/256x256?text=open',      111),
  ('dddd0012-dddd-dddd-dddd-dddddddddddd', 'close',          'actions',  '📁',   'https://placehold.co/256x256?text=close',     112),
  ('dddd0013-dddd-dddd-dddd-dddddddddddd', 'sit',            'actions',  '🪑',   'https://placehold.co/256x256?text=sit',       113),
  ('dddd0014-dddd-dddd-dddd-dddddddddddd', 'stand',          'actions',  '🧍',   'https://placehold.co/256x256?text=stand',     114),
  ('dddd0015-dddd-dddd-dddd-dddddddddddd', 'give',           'actions',  '🫴',   'https://placehold.co/256x256?text=give',      115),
  ('dddd0016-dddd-dddd-dddd-dddddddddddd', 'take',           'actions',  '🤏',   'https://placehold.co/256x256?text=take',      116),
  ('dddd0017-dddd-dddd-dddd-dddddddddddd', 'push',           'actions',  '👋',   'https://placehold.co/256x256?text=push',      117),
  ('dddd0018-dddd-dddd-dddd-dddddddddddd', 'pull',           'actions',  '🤜',   'https://placehold.co/256x256?text=pull',      118),
  ('dddd0019-dddd-dddd-dddd-dddddddddddd', 'throw',          'actions',  '🤾',   'https://placehold.co/256x256?text=throw',     119),
  ('dddd0020-dddd-dddd-dddd-dddddddddddd', 'catch',          'actions',  '🧤',   'https://placehold.co/256x256?text=catch',     120),
  ('dddd0021-dddd-dddd-dddd-dddddddddddd', 'watch',          'actions',  '📺',   'https://placehold.co/256x256?text=watch',     121),
  ('dddd0022-dddd-dddd-dddd-dddddddddddd', 'clean up',       'actions',  '🧹',   'https://placehold.co/256x256?text=clean+up',  122),
  ('dddd0023-dddd-dddd-dddd-dddddddddddd', 'line up',        'actions',  '🚸',   'https://placehold.co/256x256?text=line+up',   123),
  ('dddd0024-dddd-dddd-dddd-dddddddddddd', 'sit criss cross','actions',  '🧘',   'https://placehold.co/256x256?text=criss+cross',124),
  ('dddd0025-dddd-dddd-dddd-dddddddddddd', 'raise hand',     'actions',  '✋',   'https://placehold.co/256x256?text=raise+hand',125),

  -- ---------- Feelings (extend) -----------------------------------------
  ('dddd0030-dddd-dddd-dddd-dddddddddddd', 'surprised',      'feelings', '😲',   'https://placehold.co/256x256?text=surprised', 130),
  ('dddd0031-dddd-dddd-dddd-dddddddddddd', 'confused',       'feelings', '😕',   'https://placehold.co/256x256?text=confused',  131),
  ('dddd0032-dddd-dddd-dddd-dddddddddddd', 'proud',          'feelings', '😎',   'https://placehold.co/256x256?text=proud',     132),
  ('dddd0033-dddd-dddd-dddd-dddddddddddd', 'shy',            'feelings', '🙈',   'https://placehold.co/256x256?text=shy',       133),
  ('dddd0034-dddd-dddd-dddd-dddddddddddd', 'worried',        'feelings', '😟',   'https://placehold.co/256x256?text=worried',   134),
  ('dddd0035-dddd-dddd-dddd-dddddddddddd', 'bored',          'feelings', '😑',   'https://placehold.co/256x256?text=bored',     135),
  ('dddd0036-dddd-dddd-dddd-dddddddddddd', 'love',           'feelings', '❤️',   'https://placehold.co/256x256?text=love',      136),
  ('dddd0037-dddd-dddd-dddd-dddddddddddd', 'okay',           'feelings', '👌',   'https://placehold.co/256x256?text=okay',      137),

  -- ---------- Social (extend) -------------------------------------------
  ('dddd0040-dddd-dddd-dddd-dddddddddddd', 'hi',             'social',   '👋',   'https://placehold.co/256x256?text=hi',        140),
  ('dddd0041-dddd-dddd-dddd-dddddddddddd', 'bye',            'social',   '👋',   'https://placehold.co/256x256?text=bye',       141),
  ('dddd0042-dddd-dddd-dddd-dddddddddddd', 'sorry',          'social',   '🙇',   'https://placehold.co/256x256?text=sorry',     142),
  ('dddd0043-dddd-dddd-dddd-dddddddddddd', 'my turn',        'social',   '☝️',   'https://placehold.co/256x256?text=my+turn',   143),
  ('dddd0044-dddd-dddd-dddd-dddddddddddd', 'your turn',      'social',   '👉',   'https://placehold.co/256x256?text=your+turn', 144),
  ('dddd0045-dddd-dddd-dddd-dddddddddddd', 'again',          'social',   '🔁',   'https://placehold.co/256x256?text=again',     145),
  ('dddd0046-dddd-dddd-dddd-dddddddddddd', 'different',      'social',   '🔀',   'https://placehold.co/256x256?text=different', 146),
  ('dddd0047-dddd-dddd-dddd-dddddddddddd', 'good job',       'social',   '🎉',   'https://placehold.co/256x256?text=good+job',  147),
  ('dddd0048-dddd-dddd-dddd-dddddddddddd', 'high five',      'social',   '🙏',   'https://placehold.co/256x256?text=high+five', 148),

  -- ---------- People (extend) -------------------------------------------
  ('dddd0050-dddd-dddd-dddd-dddddddddddd', 'sub',            'people',   '🧑‍🏫', 'https://placehold.co/256x256?text=sub',       150),
  ('dddd0051-dddd-dddd-dddd-dddddddddddd', 'classmate',      'people',   '🧑',   'https://placehold.co/256x256?text=classmate', 151),
  ('dddd0052-dddd-dddd-dddd-dddddddddddd', 'brother',        'people',   '👦',   'https://placehold.co/256x256?text=brother',   152),
  ('dddd0053-dddd-dddd-dddd-dddddddddddd', 'sister',         'people',   '👧',   'https://placehold.co/256x256?text=sister',    153),
  ('dddd0054-dddd-dddd-dddd-dddddddddddd', 'baby',           'people',   '👶',   'https://placehold.co/256x256?text=baby',      154),
  ('dddd0055-dddd-dddd-dddd-dddddddddddd', 'grandma',        'people',   '👵',   'https://placehold.co/256x256?text=grandma',   155),
  ('dddd0056-dddd-dddd-dddd-dddddddddddd', 'grandpa',        'people',   '👴',   'https://placehold.co/256x256?text=grandpa',   156),
  ('dddd0057-dddd-dddd-dddd-dddddddddddd', 'aide',           'people',   '🧑‍🏫', 'https://placehold.co/256x256?text=aide',      157),

  -- ---------- Places (extend) -------------------------------------------
  ('dddd0060-dddd-dddd-dddd-dddddddddddd', 'cafeteria',      'places',   '🍽️',   'https://placehold.co/256x256?text=cafeteria', 160),
  ('dddd0061-dddd-dddd-dddd-dddddddddddd', 'office',         'places',   '🏢',   'https://placehold.co/256x256?text=office',    161),
  ('dddd0062-dddd-dddd-dddd-dddddddddddd', 'STAR room',      'places',   '⭐',   'https://placehold.co/256x256?text=STAR+room', 162),
  ('dddd0063-dddd-dddd-dddd-dddddddddddd', 'hallway',        'places',   '🚪',   'https://placehold.co/256x256?text=hallway',   163),
  ('dddd0064-dddd-dddd-dddd-dddddddddddd', 'bus stop',       'places',   '🚏',   'https://placehold.co/256x256?text=bus+stop',  164),
  ('dddd0065-dddd-dddd-dddd-dddddddddddd', 'park',           'places',   '🌲',   'https://placehold.co/256x256?text=park',      165),
  ('dddd0066-dddd-dddd-dddd-dddddddddddd', 'store',          'places',   '🏪',   'https://placehold.co/256x256?text=store',     166),

  -- ---------- Subjects ---------------------------------------------------
  ('dddd0070-dddd-dddd-dddd-dddddddddddd', 'reading',        'subjects', '📖',   'https://placehold.co/256x256?text=reading',   170),
  ('dddd0071-dddd-dddd-dddd-dddddddddddd', 'math',           'subjects', '🔢',   'https://placehold.co/256x256?text=math',      171),
  ('dddd0072-dddd-dddd-dddd-dddddddddddd', 'writing',        'subjects', '✍️',   'https://placehold.co/256x256?text=writing',   172),
  ('dddd0073-dddd-dddd-dddd-dddddddddddd', 'science',        'subjects', '🔬',   'https://placehold.co/256x256?text=science',   173),
  ('dddd0074-dddd-dddd-dddd-dddddddddddd', 'art',            'subjects', '🎨',   'https://placehold.co/256x256?text=art',       174),
  ('dddd0075-dddd-dddd-dddd-dddddddddddd', 'PE',             'subjects', '⚽',   'https://placehold.co/256x256?text=PE',        175),
  ('dddd0076-dddd-dddd-dddd-dddddddddddd', 'music class',    'subjects', '🎶',   'https://placehold.co/256x256?text=music',     176),
  ('dddd0077-dddd-dddd-dddd-dddddddddddd', 'recess',         'subjects', '🛝',   'https://placehold.co/256x256?text=recess',    177),
  ('dddd0078-dddd-dddd-dddd-dddddddddddd', 'circle time',    'subjects', '⭕',   'https://placehold.co/256x256?text=circle',    178),
  ('dddd0079-dddd-dddd-dddd-dddddddddddd', 'centers',        'subjects', '🎯',   'https://placehold.co/256x256?text=centers',   179),
  ('dddd0080-dddd-dddd-dddd-dddddddddddd', 'speech',         'subjects', '🗣️',   'https://placehold.co/256x256?text=speech',    180),
  ('dddd0081-dddd-dddd-dddd-dddddddddddd', 'OT',             'subjects', '✋',   'https://placehold.co/256x256?text=OT',        181),

  -- ---------- Sensory / coping tools ------------------------------------
  ('dddd0090-dddd-dddd-dddd-dddddddddddd', 'putty',          'sensory',  '🟢',   'https://placehold.co/256x256?text=putty',     190),
  ('dddd0091-dddd-dddd-dddd-dddddddddddd', 'weighted blanket','sensory', '🛌',   'https://placehold.co/256x256?text=blanket',   191),
  ('dddd0092-dddd-dddd-dddd-dddddddddddd', 'squeeze ball',   'sensory',  '🎾',   'https://placehold.co/256x256?text=squeeze',   192),
  ('dddd0093-dddd-dddd-dddd-dddddddddddd', 'deep breaths',   'sensory',  '🌬️',   'https://placehold.co/256x256?text=breaths',   193),
  ('dddd0094-dddd-dddd-dddd-dddddddddddd', 'count to 10',    'sensory',  '🔟',   'https://placehold.co/256x256?text=count+10',  194),
  ('dddd0095-dddd-dddd-dddd-dddddddddddd', 'sensory bin',    'sensory',  '🪣',   'https://placehold.co/256x256?text=bin',       195),
  ('dddd0096-dddd-dddd-dddd-dddddddddddd', 'lap pad',        'sensory',  '🟦',   'https://placehold.co/256x256?text=lap+pad',   196),
  ('dddd0097-dddd-dddd-dddd-dddddddddddd', 'rocking chair',  'sensory',  '🪑',   'https://placehold.co/256x256?text=rocking',   197),

  -- ---------- Hygiene / body --------------------------------------------
  ('dddd0100-dddd-dddd-dddd-dddddddddddd', 'soap',           'care',     '🧼',   'https://placehold.co/256x256?text=soap',      200),
  ('dddd0101-dddd-dddd-dddd-dddddddddddd', 'hand sanitizer', 'care',     '🧴',   'https://placehold.co/256x256?text=sanitizer', 201),
  ('dddd0102-dddd-dddd-dddd-dddddddddddd', 'cough',          'care',     '🤧',   'https://placehold.co/256x256?text=cough',     202),
  ('dddd0103-dddd-dddd-dddd-dddddddddddd', 'blow nose',      'care',     '🤧',   'https://placehold.co/256x256?text=blow+nose', 203),
  ('dddd0104-dddd-dddd-dddd-dddddddddddd', 'bandaid',        'care',     '🩹',   'https://placehold.co/256x256?text=bandaid',   204),
  ('dddd0105-dddd-dddd-dddd-dddddddddddd', 'medicine',       'care',     '💊',   'https://placehold.co/256x256?text=medicine',  205),

  -- ---------- Body parts -------------------------------------------------
  ('dddd0110-dddd-dddd-dddd-dddddddddddd', 'head',           'body',     '👤',   'https://placehold.co/256x256?text=head',      210),
  ('dddd0111-dddd-dddd-dddd-dddddddddddd', 'eyes',           'body',     '👀',   'https://placehold.co/256x256?text=eyes',      211),
  ('dddd0112-dddd-dddd-dddd-dddddddddddd', 'ears',           'body',     '👂',   'https://placehold.co/256x256?text=ears',      212),
  ('dddd0113-dddd-dddd-dddd-dddddddddddd', 'nose',           'body',     '👃',   'https://placehold.co/256x256?text=nose',      213),
  ('dddd0114-dddd-dddd-dddd-dddddddddddd', 'mouth',          'body',     '👄',   'https://placehold.co/256x256?text=mouth',     214),
  ('dddd0115-dddd-dddd-dddd-dddddddddddd', 'hands',          'body',     '✋',   'https://placehold.co/256x256?text=hands',     215),
  ('dddd0116-dddd-dddd-dddd-dddddddddddd', 'feet',           'body',     '🦶',   'https://placehold.co/256x256?text=feet',      216),
  ('dddd0117-dddd-dddd-dddd-dddddddddddd', 'tummy',          'body',     '🫃',   'https://placehold.co/256x256?text=tummy',     217),
  ('dddd0118-dddd-dddd-dddd-dddddddddddd', 'arms',           'body',     '💪',   'https://placehold.co/256x256?text=arms',      218),
  ('dddd0119-dddd-dddd-dddd-dddddddddddd', 'legs',           'body',     '🦵',   'https://placehold.co/256x256?text=legs',      219),

  -- ---------- Clothing ---------------------------------------------------
  ('dddd0130-dddd-dddd-dddd-dddddddddddd', 'shoes',          'clothing', '👟',   'https://placehold.co/256x256?text=shoes',     230),
  ('dddd0131-dddd-dddd-dddd-dddddddddddd', 'socks',          'clothing', '🧦',   'https://placehold.co/256x256?text=socks',     231),
  ('dddd0132-dddd-dddd-dddd-dddddddddddd', 'jacket',         'clothing', '🧥',   'https://placehold.co/256x256?text=jacket',    232),
  ('dddd0133-dddd-dddd-dddd-dddddddddddd', 'hat',            'clothing', '🧢',   'https://placehold.co/256x256?text=hat',       233),
  ('dddd0134-dddd-dddd-dddd-dddddddddddd', 'pants',          'clothing', '👖',   'https://placehold.co/256x256?text=pants',     234),
  ('dddd0135-dddd-dddd-dddd-dddddddddddd', 'shirt',          'clothing', '👕',   'https://placehold.co/256x256?text=shirt',     235),
  ('dddd0136-dddd-dddd-dddd-dddddddddddd', 'gloves',         'clothing', '🧤',   'https://placehold.co/256x256?text=gloves',    236),

  -- ---------- Weather ----------------------------------------------------
  ('dddd0140-dddd-dddd-dddd-dddddddddddd', 'sunny',          'weather',  '☀️',   'https://placehold.co/256x256?text=sunny',     240),
  ('dddd0141-dddd-dddd-dddd-dddddddddddd', 'cloudy',         'weather',  '☁️',   'https://placehold.co/256x256?text=cloudy',    241),
  ('dddd0142-dddd-dddd-dddd-dddddddddddd', 'rainy',          'weather',  '🌧️',   'https://placehold.co/256x256?text=rainy',     242),
  ('dddd0143-dddd-dddd-dddd-dddddddddddd', 'snowy',          'weather',  '❄️',   'https://placehold.co/256x256?text=snowy',     243),
  ('dddd0144-dddd-dddd-dddd-dddddddddddd', 'windy',          'weather',  '💨',   'https://placehold.co/256x256?text=windy',     244),
  ('dddd0145-dddd-dddd-dddd-dddddddddddd', 'hot',            'weather',  '🥵',   'https://placehold.co/256x256?text=hot',       245),
  ('dddd0146-dddd-dddd-dddd-dddddddddddd', 'cold',           'weather',  '🥶',   'https://placehold.co/256x256?text=cold',      246),
  ('dddd0147-dddd-dddd-dddd-dddddddddddd', 'rainbow',        'weather',  '🌈',   'https://placehold.co/256x256?text=rainbow',   247),

  -- ---------- More foods -------------------------------------------------
  ('dddd0150-dddd-dddd-dddd-dddddddddddd', 'chicken',        'food',     '🍗',   'https://placehold.co/256x256?text=chicken',   250),
  ('dddd0151-dddd-dddd-dddd-dddddddddddd', 'rice',           'food',     '🍚',   'https://placehold.co/256x256?text=rice',      251),
  ('dddd0152-dddd-dddd-dddd-dddddddddddd', 'vegetables',     'food',     '🥦',   'https://placehold.co/256x256?text=vegetables',252),
  ('dddd0153-dddd-dddd-dddd-dddddddddddd', 'hot dog',        'food',     '🌭',   'https://placehold.co/256x256?text=hot+dog',   253),
  ('dddd0154-dddd-dddd-dddd-dddddddddddd', 'hamburger',      'food',     '🍔',   'https://placehold.co/256x256?text=hamburger', 254),
  ('dddd0155-dddd-dddd-dddd-dddddddddddd', 'french fries',   'food',     '🍟',   'https://placehold.co/256x256?text=fries',     255),
  ('dddd0156-dddd-dddd-dddd-dddddddddddd', 'ice cream',      'food',     '🍦',   'https://placehold.co/256x256?text=ice+cream', 256),
  ('dddd0157-dddd-dddd-dddd-dddddddddddd', 'grapes',         'food',     '🍇',   'https://placehold.co/256x256?text=grapes',    257),
  ('dddd0158-dddd-dddd-dddd-dddddddddddd', 'orange',         'food',     '🍊',   'https://placehold.co/256x256?text=orange',    258),
  ('dddd0159-dddd-dddd-dddd-dddddddddddd', 'strawberry',     'food',     '🍓',   'https://placehold.co/256x256?text=strawberry',259),
  ('dddd0160-dddd-dddd-dddd-dddddddddddd', 'popcorn',        'food',     '🍿',   'https://placehold.co/256x256?text=popcorn',   260),
  ('dddd0161-dddd-dddd-dddd-dddddddddddd', 'pretzels',       'food',     '🥨',   'https://placehold.co/256x256?text=pretzels',  261),

  -- ---------- Time / transitions ----------------------------------------
  ('dddd0170-dddd-dddd-dddd-dddddddddddd', 'now',            'time',     '👇',   'https://placehold.co/256x256?text=now',       270),
  ('dddd0171-dddd-dddd-dddd-dddddddddddd', 'later',          'time',     '⏰',   'https://placehold.co/256x256?text=later',     271),
  ('dddd0172-dddd-dddd-dddd-dddddddddddd', 'first',          'time',     '1️⃣',   'https://placehold.co/256x256?text=first',     272),
  ('dddd0173-dddd-dddd-dddd-dddddddddddd', 'then',           'time',     '2️⃣',   'https://placehold.co/256x256?text=then',      273),
  ('dddd0174-dddd-dddd-dddd-dddddddddddd', 'next',           'time',     '⏭️',   'https://placehold.co/256x256?text=next',      274),
  ('dddd0175-dddd-dddd-dddd-dddddddddddd', 'today',          'time',     '📅',   'https://placehold.co/256x256?text=today',     275),
  ('dddd0176-dddd-dddd-dddd-dddddddddddd', 'tomorrow',       'time',     '🌅',   'https://placehold.co/256x256?text=tomorrow',  276),
  ('dddd0177-dddd-dddd-dddd-dddddddddddd', 'morning',        'time',     '🌄',   'https://placehold.co/256x256?text=morning',   277),
  ('dddd0178-dddd-dddd-dddd-dddddddddddd', 'afternoon',      'time',     '🌞',   'https://placehold.co/256x256?text=afternoon', 278),
  ('dddd0179-dddd-dddd-dddd-dddddddddddd', 'night',          'time',     '🌙',   'https://placehold.co/256x256?text=night',     279),

  -- ---------- Reinforcers / rewards -------------------------------------
  ('dddd0190-dddd-dddd-dddd-dddddddddddd', 'sticker',        'rewards',  '⭐',   'https://placehold.co/256x256?text=sticker',   290),
  ('dddd0191-dddd-dddd-dddd-dddddddddddd', 'prize box',      'rewards',  '🎁',   'https://placehold.co/256x256?text=prize+box', 291),
  ('dddd0192-dddd-dddd-dddd-dddddddddddd', 'computer time',  'rewards',  '🖥️',   'https://placehold.co/256x256?text=computer',  292),
  ('dddd0193-dddd-dddd-dddd-dddddddddddd', 'free choice',    'rewards',  '🎲',   'https://placehold.co/256x256?text=free+choice',293),
  ('dddd0194-dddd-dddd-dddd-dddddddddddd', 'extra recess',   'rewards',  '🛝',   'https://placehold.co/256x256?text=extra+recess',294),
  ('dddd0195-dddd-dddd-dddd-dddddddddddd', 'celebrate',      'rewards',  '🙌',   'https://placehold.co/256x256?text=celebrate', 295),
  ('dddd0196-dddd-dddd-dddd-dddddddddddd', 'token',          'rewards',  '🪙',   'https://placehold.co/256x256?text=token',     296),
  ('dddd0197-dddd-dddd-dddd-dddddddddddd', 'puzzle',         'rewards',  '🧩',   'https://placehold.co/256x256?text=puzzle',    297),
  ('dddd0198-dddd-dddd-dddd-dddddddddddd', 'train toy',      'rewards',  '🚂',   'https://placehold.co/256x256?text=train+toy', 298),
  ('dddd0199-dddd-dddd-dddd-dddddddddddd', 'book reward',    'rewards',  '📚',   'https://placehold.co/256x256?text=book',      299)

on conflict (id) do nothing;
