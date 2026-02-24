-- Migration: 001_initial_schema
-- Description: Aanmaken van alle basistabellen

CREATE TABLE profiles (
  id uuid references auth.users primary key,
  full_name text,
  role text check (role in ('projectleider', 'projectlid', 'manager')),
  created_at timestamptz default now()
);

CREATE TABLE projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text check (status in (
    'Niet gestart', 'In opstart', 'In uitvoering',
    'In afronding', 'Afgerond', 'Gearchiveerd'
  )) default 'Niet gestart',
  owner_id uuid references profiles(id),
  start_date date,
  end_date date,
  sharepoint_project_url text,
  sharepoint_actions_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  profile_id uuid references profiles(id),
  role text,
  created_at timestamptz default now()
);

CREATE TABLE quality_checks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  kickoff_done boolean default false,
  kickoff_date date,
  kickoff_url text,
  startnotitie_done boolean default false,
  startnotitie_date date,
  startnotitie_url text,
  projectplan_done boolean default false,
  projectplan_date date,
  projectplan_url text,
  evaluatie_done boolean default false,
  evaluatie_date date,
  evaluatie_url text
);
