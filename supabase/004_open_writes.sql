-- =========================================================================
-- Open INSERT/UPDATE/DELETE policies for the demo so the teacher UI can
-- create/edit/delete boards, students, and schedule blocks.
--
-- INTENTIONALLY PERMISSIVE for the demo. In production, gate by JWT
-- claims (role = 'teacher' / 'admin'). Run this AFTER 002_boards.sql.
-- =========================================================================

-- ---- boards ------------------------------------------------------------
drop policy if exists "insert boards" on public.boards;
drop policy if exists "update boards" on public.boards;
drop policy if exists "delete boards" on public.boards;
create policy "insert boards" on public.boards for insert with check (true);
create policy "update boards" on public.boards for update using (true) with check (true);
create policy "delete boards" on public.boards for delete using (true);

-- ---- students ----------------------------------------------------------
drop policy if exists "insert students" on public.students;
drop policy if exists "update students" on public.students;
drop policy if exists "delete students" on public.students;
create policy "insert students" on public.students for insert with check (true);
create policy "update students" on public.students for update using (true) with check (true);
create policy "delete students" on public.students for delete using (true);

-- ---- schedule_blocks ---------------------------------------------------
drop policy if exists "insert schedule_blocks" on public.schedule_blocks;
drop policy if exists "update schedule_blocks" on public.schedule_blocks;
drop policy if exists "delete schedule_blocks" on public.schedule_blocks;
create policy "insert schedule_blocks" on public.schedule_blocks for insert with check (true);
create policy "update schedule_blocks" on public.schedule_blocks for update using (true) with check (true);
create policy "delete schedule_blocks" on public.schedule_blocks for delete using (true);

-- ---- pecs_icons (so AddIcon flows can work later) ----------------------
drop policy if exists "insert pecs_icons" on public.pecs_icons;
drop policy if exists "update pecs_icons" on public.pecs_icons;
drop policy if exists "delete pecs_icons" on public.pecs_icons;
create policy "insert pecs_icons" on public.pecs_icons for insert with check (true);
create policy "update pecs_icons" on public.pecs_icons for update using (true) with check (true);
create policy "delete pecs_icons" on public.pecs_icons for delete using (true);
