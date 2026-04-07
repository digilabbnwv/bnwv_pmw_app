-- Migration: 007_medewerkers
-- Description: Uitbreiden profiles tabel met gestructureerde naamvelden, email, avatar en RLS

-- Nieuwe kolommen toevoegen aan profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS voornaam text,
  ADD COLUMN IF NOT EXISTS tussenvoegsel text,
  ADD COLUMN IF NOT EXISTS achternaam text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS avatar_id text,
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Backfill: splits bestaande full_name in voornaam + achternaam
UPDATE profiles
SET
  voornaam = split_part(full_name, ' ', 1),
  achternaam = CASE
    WHEN array_length(string_to_array(full_name, ' '), 1) > 1
    THEN substring(full_name FROM position(' ' IN full_name) + 1)
    ELSE full_name
  END
WHERE full_name IS NOT NULL AND voornaam IS NULL;

-- Trigger functie: houd full_name in sync met voornaam + tussenvoegsel + achternaam
CREATE OR REPLACE FUNCTION sync_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := TRIM(
    COALESCE(NEW.voornaam, '') || ' ' ||
    COALESCE(NEW.tussenvoegsel || ' ', '') ||
    COALESCE(NEW.achternaam, '')
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_full_name
  BEFORE INSERT OR UPDATE OF voornaam, tussenvoegsel, achternaam
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_full_name();

-- RLS policies voor medewerkers feature
-- Alle ingelogde gebruikers mogen profielen lezen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users read all profiles'
  ) THEN
    CREATE POLICY "Authenticated users read all profiles"
      ON profiles FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Projectleiders en managers mogen profielen aanmaken/bewerken
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Leaders manage profiles'
  ) THEN
    CREATE POLICY "Leaders manage profiles"
      ON profiles FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('manager', 'projectleider')
        )
      );
  END IF;
END $$;
