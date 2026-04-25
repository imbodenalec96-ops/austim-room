-- =========================================================================
-- pecs_requests.carrier — captures which carrier phrase the student picked
-- ("I want", "I see", "I have", "I hear", "I feel", "I need", …).
-- Defaults to "I want" so existing rows + clients that don't send it
-- continue to behave as before.
-- =========================================================================

alter table public.pecs_requests
  add column if not exists carrier text default 'I want';
