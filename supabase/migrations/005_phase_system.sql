-- Migration: 005_phase_system
-- Description: Add phase-based waterfall workflow, deliverables, tasks,
--              comments, activity log, ideas board, AI sessions, and notifications.

-- ============================================================
-- 1. Extend projects table
-- ============================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_phase text
  NOT NULL DEFAULT 'initiatief'
  CHECK (current_phase IN (
    'initiatief','definitie','ontwerp','voorbereiding','realisatie','nazorg','afgerond'
  ));

-- ============================================================
-- 2. project_phases – gate tracking per phase
-- ============================================================

CREATE TABLE project_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN (
    'initiatief','definitie','ontwerp','voorbereiding','realisatie','nazorg'
  )),
  started_at timestamptz,
  completed_at timestamptz,
  gate_approved boolean NOT NULL DEFAULT false,
  gate_approved_by uuid REFERENCES profiles(id),
  gate_approved_at timestamptz,
  gate_notes text,
  UNIQUE (project_id, phase)
);

ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages phases"
  ON project_phases FOR ALL
  USING (public.is_project_owner(project_id));

CREATE POLICY "Member reads phases"
  ON project_phases FOR SELECT
  USING (public.is_project_member(project_id));

CREATE POLICY "Manager reads phases"
  ON project_phases FOR SELECT
  USING (public.auth_has_role('manager'));

-- ============================================================
-- 3. project_deliverables – documents per phase
-- ============================================================

CREATE TABLE project_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'startnotitie','projectplan','definitief_ontwerp','voorbereidingsplan',
    'projectresultaat','evaluatierapport','beheersplan','onderhoudsplan','overig'
  )),
  title text NOT NULL,
  content jsonb DEFAULT '{}',
  sharepoint_url text,
  status text NOT NULL DEFAULT 'concept' CHECK (status IN ('concept','review','definitief')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages deliverables"
  ON project_deliverables FOR ALL
  USING (public.is_project_owner(project_id));

CREATE POLICY "Member reads deliverables"
  ON project_deliverables FOR SELECT
  USING (public.is_project_member(project_id));

CREATE POLICY "Manager reads deliverables"
  ON project_deliverables FOR SELECT
  USING (public.auth_has_role('manager'));

-- ============================================================
-- 4. success_indicators – measurable goals
-- ============================================================

CREATE TABLE success_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value text,
  measurement_method text,
  current_value text,
  status text NOT NULL DEFAULT 'niet_gemeten' CHECK (status IN (
    'niet_gemeten','op_schema','afwijkend','behaald','niet_behaald'
  )),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE success_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages indicators"
  ON success_indicators FOR ALL
  USING (public.is_project_owner(project_id));

CREATE POLICY "Member reads indicators"
  ON success_indicators FOR SELECT
  USING (public.is_project_member(project_id));

CREATE POLICY "Manager reads indicators"
  ON success_indicators FOR SELECT
  USING (public.auth_has_role('manager'));

-- ============================================================
-- 5. project_tasks – tasks per phase
-- ============================================================

CREATE TABLE project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase text NOT NULL,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES profiles(id),
  due_date date,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','bezig','afgerond','vervallen')),
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages tasks"
  ON project_tasks FOR ALL
  USING (public.is_project_owner(project_id));

CREATE POLICY "Member manages own tasks"
  ON project_tasks FOR ALL
  USING (public.is_project_member(project_id));

CREATE POLICY "Manager reads tasks"
  ON project_tasks FOR SELECT
  USING (public.auth_has_role('manager'));

-- ============================================================
-- 6. project_comments – discussion threads
-- ============================================================

CREATE TABLE project_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  deliverable_id uuid REFERENCES project_deliverables(id) ON DELETE CASCADE,
  phase text,
  author_id uuid NOT NULL REFERENCES profiles(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages comments"
  ON project_comments FOR ALL
  USING (public.is_project_owner(project_id));

CREATE POLICY "Member manages own comments"
  ON project_comments FOR ALL
  USING (author_id = auth.uid());

CREATE POLICY "Member reads comments"
  ON project_comments FOR SELECT
  USING (public.is_project_member(project_id));

CREATE POLICY "Manager reads comments"
  ON project_comments FOR SELECT
  USING (public.auth_has_role('manager'));

-- ============================================================
-- 7. activity_log – audit trail
-- ============================================================

CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads activity"
  ON activity_log FOR ALL
  USING (public.is_project_owner(project_id));

CREATE POLICY "Member reads activity"
  ON activity_log FOR SELECT
  USING (public.is_project_member(project_id));

CREATE POLICY "Manager reads activity"
  ON activity_log FOR SELECT
  USING (public.auth_has_role('manager'));

CREATE POLICY "Member inserts activity"
  ON activity_log FOR INSERT
  WITH CHECK (public.is_project_member(project_id) OR public.is_project_owner(project_id));

-- ============================================================
-- 8. ideas_board – communication/marketing ideas
-- ============================================================

CREATE TABLE ideas_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'overig' CHECK (category IN (
    'marketing','communicatie','evenement','social_media','pers','overig'
  )),
  status text NOT NULL DEFAULT 'idee' CHECK (status IN (
    'idee','goedgekeurd','in_uitvoering','afgerond','afgewezen'
  )),
  priority integer NOT NULL DEFAULT 0,
  assigned_to uuid REFERENCES profiles(id),
  target_date date,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ideas_board ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages ideas"
  ON ideas_board FOR ALL
  USING (public.is_project_owner(project_id));

CREATE POLICY "Member manages ideas"
  ON ideas_board FOR ALL
  USING (public.is_project_member(project_id));

CREATE POLICY "Manager reads ideas"
  ON ideas_board FOR SELECT
  USING (public.auth_has_role('manager'));

-- ============================================================
-- 9. ai_sessions – AI conversation tracking
-- ============================================================

CREATE TABLE ai_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  deliverable_id uuid REFERENCES project_deliverables(id) ON DELETE SET NULL,
  session_type text NOT NULL CHECK (session_type IN (
    'startnotitie','projectplan','evaluatie','ideas','chat'
  )),
  conversation jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages ai sessions"
  ON ai_sessions FOR ALL
  USING (public.is_project_owner(project_id));

CREATE POLICY "Member manages own ai sessions"
  ON ai_sessions FOR ALL
  USING (created_by = auth.uid());

CREATE POLICY "Manager reads ai sessions"
  ON ai_sessions FOR SELECT
  USING (public.auth_has_role('manager'));

-- ============================================================
-- 10. notifications
-- ============================================================

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manages own notifications"
  ON notifications FOR ALL
  USING (user_id = auth.uid());
