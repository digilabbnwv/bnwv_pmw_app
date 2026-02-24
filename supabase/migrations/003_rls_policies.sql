-- Migration: 003_rls_policies
-- Description: RLS toegangsbeleid per rol

-- Profiles
CREATE POLICY "Gebruiker ziet eigen profiel"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Gebruiker bewerkt eigen profiel"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- Projects
CREATE POLICY "Projectleider beheert eigen projecten"
  ON projects FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Manager leest alle projecten"
  ON projects FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
  );

CREATE POLICY "Projectlid leest toegewezen projecten"
  ON projects FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND profile_id = auth.uid())
  );

-- Project members
CREATE POLICY "Projectleider beheert leden van eigen projecten"
  ON project_members FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );

CREATE POLICY "Projectlid ziet medeleden"
  ON project_members FOR SELECT USING (profile_id = auth.uid());

-- Quality checks
CREATE POLICY "Projectleider beheert kwaliteitschecks eigen projecten"
  ON quality_checks FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND owner_id = auth.uid())
  );
