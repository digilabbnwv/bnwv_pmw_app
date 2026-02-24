-- Migration: 004_fix_rls_recursion
-- Description: Fix infinite recursion in RLS policies.
--   The project_members policy queried projects, and the projects
--   policy queried project_members, causing a circular dependency.
--   Solution: use SECURITY DEFINER helper functions that bypass RLS.

-- ============================================================
-- 1. Helper functions (SECURITY DEFINER = bypass RLS)
-- ============================================================

-- Check whether the current user has a given role in profiles
CREATE OR REPLACE FUNCTION public.auth_has_role(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = required_role
  );
$$;

-- Check whether the current user is a member of a given project
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members WHERE project_id = p_project_id AND profile_id = auth.uid()
  );
$$;

-- Check whether the current user owns a given project
CREATE OR REPLACE FUNCTION public.is_project_owner(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND owner_id = auth.uid()
  );
$$;

-- ============================================================
-- 2. Drop old policies
-- ============================================================

-- projects
DROP POLICY IF EXISTS "Projectleider beheert eigen projecten" ON projects;
DROP POLICY IF EXISTS "Manager leest alle projecten" ON projects;
DROP POLICY IF EXISTS "Projectlid leest toegewezen projecten" ON projects;

-- project_members
DROP POLICY IF EXISTS "Projectleider beheert leden van eigen projecten" ON project_members;
DROP POLICY IF EXISTS "Projectlid ziet medeleden" ON project_members;

-- quality_checks
DROP POLICY IF EXISTS "Projectleider beheert kwaliteitschecks eigen projecten" ON quality_checks;

-- ============================================================
-- 3. Recreate policies using helper functions
-- ============================================================

-- Projects ---------------------------------------------------

CREATE POLICY "Projectleider beheert eigen projecten"
  ON projects FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY "Manager leest alle projecten"
  ON projects FOR SELECT
  USING (public.auth_has_role('manager'));

CREATE POLICY "Projectlid leest toegewezen projecten"
  ON projects FOR SELECT
  USING (public.is_project_member(id));

-- Project members --------------------------------------------

CREATE POLICY "Projectleider beheert leden van eigen projecten"
  ON project_members FOR ALL
  USING (public.is_project_owner(project_id));

CREATE POLICY "Projectlid ziet medeleden"
  ON project_members FOR SELECT
  USING (profile_id = auth.uid());

-- Quality checks ---------------------------------------------

CREATE POLICY "Projectleider beheert kwaliteitschecks eigen projecten"
  ON quality_checks FOR ALL
  USING (public.is_project_owner(project_id));
