# Projectinstructie: bnwv_pmw_app
## Bibliotheek Projectbeheer Webapp

---

## ⚠️ LEESWIJZER VOOR CLAUDE CODE — LEES DIT EERST

Dit document is de volledige bouwinstructie voor de bnwv_pmw_app. Voordat je ook maar één bestand aanmaakt:

1. **Lees dit document volledig door**
2. **Controleer of `PROGRESS.md` bestaat** in de projectroot
   - Bestaat het: lees het en hervat vanaf de openstaande stappen
   - Bestaat het niet: dit is een nieuwe start, maak het aan als eerste actie
3. **Stel een plan op** voor de huidige sessie op basis van wat er nog open staat
4. **Wacht niet op bevestiging** — werk de stappen af in volgorde, maar pauzeer bij elke stap die menselijke actie vereist (zie hieronder)

### Wat Claude Code zelf doet
Alle code schrijven, bestanden aanmaken, Git-commando's uitvoeren, tests draaien, linting configureren, migratiescripts schrijven, CI-pipeline opzetten.

### Wat JIJ als developer handmatig moet doen
Claude Code kan dit niet voor je doen. Doe deze stappen **voordat** je Claude Code opstart, of op het moment dat Claude Code hierom vraagt:

| # | Actie | Wanneer |
|---|-------|---------|
| 1 | GitHub repo aanmaken: `https://github.com/digilabbnwv/bnwv_pmw_app` | Voor de start |
| 2 | Portable Node.js downloaden en uitpakken in `node_bin/` in de projectroot | Voor de start |
| 3 | Supabase project aanmaken op supabase.com | Voor stap 6 |
| 4 | Supabase TOTP MFA inschakelen via dashboard (Authentication > MFA) | Voor stap 6 |
| 5 | SQL-migraties uitvoeren via Supabase SQL editor | Na stap 7 |
| 6 | `.env.local` aanmaken met jouw Supabase URL en anon key | Na stap 6 |
| 7 | GitHub Secrets instellen: `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` | Voor stap 16 |
| 8 | GitHub Pages inschakelen in repo settings (branch: `gh-pages`) | Voor stap 17 |

Claude Code geeft een expliciete melding wanneer jouw actie vereist is, met exacte instructies wat je moet doen.

---

## Sessiebeheer: PROGRESS.md

Claude Code houdt `PROGRESS.md` bij in de projectroot. Dit is het geheugen tussen sessies.

**Start elke nieuwe sessie met:**
> "Lees PROGRESS.md en hervat het project."

### Structuur van PROGRESS.md

```markdown
# Project Voortgang: bnwv_pmw_app

Laatste update: YYYY-MM-DD
Actieve branch: feature/naam

## Voltooide stappen
- [x] 1. Projectscaffold en Git Flow setup
- [x] 2. ESLint + Prettier
- [ ] 3. Vitest + RTL

## Openstaande stappen
(resterende stappen)

## Gemaakte keuzes & afwijkingen
- Mantine versie: 7.x
- [afwijkingen met reden]

## Wacht op developer
- [ ] Supabase project aanmaken (vereist voor stap 6)

## Bekende problemen
- (openstaande bugs of onafgemaakte zaken)
```

### Regels voor Claude Code rond PROGRESS.md
- Lees het als allereerste actie
- Werk het bij ná elke voltooide stap
- Noteer expliciet welke developer-acties nog openstaan
- Noteer afwijkingen van de instructie met reden
- Geen code in PROGRESS.md — puur statusdocument

---

## Tech Stack

| Onderdeel | Keuze |
|-----------|-------|
| Frontend | React 18 + Vite |
| UI Library | Mantine v7+ |
| Routing | React Router v6 |
| Icons | @tabler/icons-react |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Authenticatie | Supabase Auth + verplichte TOTP 2FA |
| Linting | ESLint + Prettier |
| Testing | Vitest + React Testing Library |
| Hosting | GitHub Pages |
| Repo | https://github.com/digilabbnwv/bnwv_pmw_app |

---

## Versiebeheer: Git Flow

Claude Code gebruikt Git Flow strikt. Nooit rechtstreeks committen op `main` of `develop`.

### Branch structuur
```
main        → productie, deploy naar GitHub Pages
develop     → integratie, alle features komen hier samen
feature/*   → één feature per stap
release/*   → voorbereiding release
hotfix/*    → urgente productiefix
```

### Initiële Git setup (stap 1)
```bash
git init
git checkout -b main
git add .
git commit -m "chore: initial project scaffold"
git checkout -b develop
```

### Werkwijze per feature (standaard patroon)
```bash
git checkout develop
git checkout -b feature/naam-van-feature
# ... werk ...
git add .
git commit -m "feat: beschrijving"
git checkout develop
git merge --no-ff feature/naam-van-feature
git branch -d feature/naam-van-feature
```

### Commit conventies
```
feat:      nieuwe functionaliteit
fix:       bugfix
chore:     tooling, dependencies, configuratie
test:      tests toevoegen of aanpassen
docs:      documentatie
security:  security-gerelateerde wijziging
refactor:  herstructurering zonder gedragswijziging
```

Voorbeelden:
```
feat: dashboard tegel voor verlopende documenten
fix: verloopdatumberekening bij schrikkeljaar
security: env var validatie bij opstarten toegevoegd
test: unit tests dateUtils afgerond
chore: ESLint en Prettier geconfigureerd
```

### Branch naamgeving
```
feature/project-scaffold
feature/lint-en-test-setup
feature/utility-functies
feature/supabase-migraties
feature/auth-login-totp
feature/appshell-routing
feature/dashboard
feature/alle-projecten
feature/project-detail
feature/project-formulier
feature/instellingen
feature/ci-pipeline
```

---

## Portable Node.js Setup

De developer heeft geen systeembrede Node.js. Er staat een portable Node.js in `node_bin/` in de projectroot.

### Detectie (controleer in deze volgorde)
```
node_bin/node.exe        → Windows, flat
node_bin/bin/node        → Linux/Mac structuur
node_bin/node            → flat alternatief

node_bin/npm.cmd         → Windows npm
node_bin/npm             → Linux/Mac npm
node_bin/bin/npm         → alternatief
```

### Aanmaken: dev.bat
```bat
@echo off
SET NODE_PATH=%~dp0node_bin
SET PATH=%NODE_PATH%;%NODE_PATH%\node_modules\.bin;%PATH%
%NODE_PATH%\npm.cmd %*
```

### Aanmaken: run.bat
```bat
@echo off
SET NODE_PATH=%~dp0node_bin
SET PATH=%NODE_PATH%;%NODE_PATH%\node_modules\.bin;%PATH%
IF "%1"=="dev"     %NODE_PATH%\npm.cmd run dev
IF "%1"=="build"   %NODE_PATH%\npm.cmd run build
IF "%1"=="test"    %NODE_PATH%\npm.cmd run test
IF "%1"=="lint"    %NODE_PATH%\npm.cmd run lint
IF "%1"=="preview" %NODE_PATH%\npm.cmd run preview
IF "%1"=="audit"   %NODE_PATH%\npm.cmd audit --audit-level=high
```

### package.json scripts
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "lint": "eslint src --ext .js,.jsx",
  "lint:fix": "eslint src --ext .js,.jsx --fix",
  "format": "prettier --write src/**/*.{js,jsx}"
}
```

---

## Projectstructuur

```
bnwv_pmw_app/
  node_bin/                   # Portable Node.js — NIET in git
  node_modules/               # NIET in git
  supabase/
    migrations/
      001_initial_schema.sql
      002_rls_enable.sql
      003_rls_policies.sql
  src/
    components/
      layout/
        AppShell.jsx
        Sidebar.jsx
      dashboard/
        ActiveProjectsTile.jsx
        DocumentsTile.jsx
        StatusChartTile.jsx
      projects/
        ProjectCard.jsx
        ProjectForm.jsx
        QualityChecklist.jsx
        ProjectMembersList.jsx
    pages/
      LoginPage.jsx
      SetupTOTPPage.jsx
      DashboardPage.jsx
      AllProjectsPage.jsx
      ProjectDetailPage.jsx
      ProjectFormPage.jsx
      SettingsPage.jsx
    lib/
      supabaseClient.js
      useAuth.js
      utils/
        dateUtils.js
        projectUtils.js
    __tests__/
      utils/
        dateUtils.test.js
        projectUtils.test.js
      components/
        ActiveProjectsTile.test.jsx
        DocumentsTile.test.jsx
        QualityChecklist.test.jsx
    setupTests.js
    App.jsx
    main.jsx
  .eslintrc.cjs
  .prettierrc
  .env.example                # WEL in git
  .env.local                  # NOOIT in git
  .gitignore
  vite.config.js
  vitest.config.js
  dev.bat
  run.bat
  PROGRESS.md
  README.md
  .github/
    workflows/
      ci.yml
```

### .gitignore
```
node_modules/
node_bin/
dist/
.env
.env.local
.env.*.local
```

---

## Ontwikkelstappen

Elke stap = één feature branch. Na elke stap: merge naar develop, update PROGRESS.md.
Een stap is **klaar** als de definitie van klaar is gehaald.

---

### Stap 1 — Projectscaffold en Git Flow setup
**Branch:** `feature/project-scaffold`

- Vite + React project initialiseren
- Mantine v7 installeren (`@mantine/core`, `@mantine/hooks`, `@mantine/charts`)
- React Router v6 installeren
- `@tabler/icons-react` installeren
- `dev.bat` en `run.bat` aanmaken
- `.gitignore` aanmaken
- `.env.example` aanmaken
- `PROGRESS.md` aanmaken met alle stappen
- `vite.config.js` instellen met `base: '/bnwv_pmw_app/'`
- Git Flow branches aanmaken (`main`, `develop`)
- README aanmaken met lokale ontwikkelinstructies

**Klaar als:** `run.bat dev` start een lege Vite+React pagina op localhost

---

### Stap 2 — Linting en formatting
**Branch:** `feature/lint-en-formatting`

- ESLint installeren en configureren (`.eslintrc.cjs`)
- Prettier installeren en configureren (`.prettierrc`)
- `run.bat lint` geeft geen fouten op lege broncode

**ESLint configuratie:**
```js
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
}
```

**Prettier configuratie:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Klaar als:** `run.bat lint` slaagt zonder errors

---

### Stap 3 — Test setup
**Branch:** `feature/test-setup`

- Vitest installeren en configureren (`vitest.config.js`)
- React Testing Library installeren
- `setupTests.js` aanmaken
- Één smoke test schrijven die slaagt

**vitest.config.js:**
```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: false,
  },
})
```

**setupTests.js:**
```js
import '@testing-library/jest-dom'
```

**Klaar als:** `run.bat test` slaagt

---

### Stap 4 — Utility functies en tests
**Branch:** `feature/utility-functies`

Maak `src/lib/utils/dateUtils.js` aan met:
- `isExpiringSoon(date, days = 30)` → true als datum binnen X dagen valt
- `formatDate(date)` → Nederlandse datumstring DD-MM-YYYY
- `defaultEndDate(startDate)` → startDate + 1 jaar

Maak `src/lib/utils/projectUtils.js` aan met:
- `getActiveProjects(projects)` → filtert Afgerond en Gearchiveerd eruit
- `getStatusColor(status)` → kleurstring per status
- `getExpiringProjects(projects, days = 30)` → projecten waarvan end_date binnen X dagen valt
- `countByStatus(projects)` → tellingen per status voor PieChart

Schrijf tests voor alle functies in `src/__tests__/utils/`.

Supabase mock template voor gebruik in componenttests:
```js
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-id' } } }),
    },
  },
}))
```

**Klaar als:** `run.bat test` slaagt, alle utility functies zijn gedekt

---

### Stap 5 — Database migraties schrijven

**Branch:** `feature/supabase-migraties`

Schrijf de SQL migratiebestanden in `supabase/migrations/`. Claude Code schrijft de bestanden — de developer voert ze uit.

**001_initial_schema.sql:**
```sql
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
```

**002_rls_enable.sql:**
```sql
-- Migration: 002_rls_enable
-- Description: RLS inschakelen op alle tabellen

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
```

**003_rls_policies.sql:**
```sql
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
```

Na het schrijven van de migratiebestanden geeft Claude Code de volgende melding:

> **⏸ DEVELOPER ACTIE VEREIST**
> De migratiebestanden staan klaar in `supabase/migrations/`.
> Doe het volgende:
> 1. Ga naar jouw Supabase project → SQL Editor
> 2. Voer `001_initial_schema.sql` uit
> 3. Voer `002_rls_enable.sql` uit
> 4. Voer `003_rls_policies.sql` uit
> 5. Maak `.env.local` aan in de projectroot:
>    ```
>    VITE_SUPABASE_URL=https://jouw-project-id.supabase.co
>    VITE_SUPABASE_ANON_KEY=jouw-anon-key
>    ```
> Geef aan als dit klaar is, dan ga ik verder met stap 6.

**Klaar als:** developer bevestigt dat migraties zijn uitgevoerd en `.env.local` bestaat

---

### Stap 6 — Supabase client en authenticatie
**Branch:** `feature/auth-login-totp`

**supabaseClient.js** — met verplichte env validatie:
```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase omgevingsvariabelen ontbreken. Controleer je .env.local bestand.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**useAuth.js** — hook die sessie én MFA-niveau controleert:
```js
// Controleert ALTIJD zowel sessie als aal2 (2FA doorlopen)
const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
if (assuranceData.currentLevel !== 'aal2') {
  navigate('/setup-totp')
}
```

**LoginPage.jsx** — stappen:
1. Email + wachtwoord formulier (Mantine Paper)
2. Na succesvolle credentials: TOTP code invoer
3. Gebruikersvriendelijke foutmeldingen (geen technische details)

**SetupTOTPPage.jsx** — stappen:
1. QR code genereren via `supabase.auth.mfa.enroll()`
2. Geheime sleutel tonen als backup
3. Code verifiëren via `supabase.auth.mfa.challengeAndVerify()`
4. Na verificatie: redirect naar dashboard

**Foutmeldingen (altijd gebruikersvriendelijk):**
```js
// NOOIT: setError(error.message)
// ALTIJD:
const errorMessages = {
  login: 'E-mailadres of wachtwoord is onjuist',
  totp: 'De code is onjuist of verlopen. Probeer opnieuw.',
  save: 'Opslaan mislukt. Controleer je verbinding en probeer opnieuw.',
  generic: 'Er is iets misgegaan. Probeer het opnieuw.',
}
```

**Klaar als:** inloggen met email/wachtwoord + TOTP werkt end-to-end, route guard blokkeert zonder aal2

---

### Stap 7 — AppShell en routing
**Branch:** `feature/appshell-routing`

Mantine AppShell met sidebar links, header met dark/light toggle en uitlogknop. Beveiligde routes redirecten naar `/login` als niet ingelogd of aal2 ontbreekt.

**Sidebar navigatie:**
```
📊  Dashboard        /
📁  Alle Projecten   /projects
⚙️  Instellingen     /settings
```

**Klaar als:** navigatie werkt, niet-ingelogde gebruiker wordt doorgestuurd naar /login

---

### Stap 8 — Dashboard
**Branch:** `feature/dashboard`

Drie tegels in Mantine SimpleGrid (naast elkaar desktop, gestapeld mobiel):

**Tegel 1: Actieve Projecten**
- Max 5 projecten zonder status Afgerond/Gearchiveerd
- Naam, status badge (kleurgecodeerd), verloopdatum
- Link "Alle projecten bekijken"
- Lege state als er geen zijn

**Tegel 2: Documenten bijna verlopen**
- Projecten waarvan `end_date` binnen 30 dagen valt (via `getExpiringProjects`)
- Projectnaam, verloopdatum, doorkliklink
- Lege state als er geen zijn

**Tegel 3: Statusverdeling**
- Mantine PieChart via `countByStatus`
- Kleuren per status:
  - Niet gestart → grijs
  - In opstart → blauw
  - In uitvoering → oranje (#F06418)
  - In afronding → geel
  - Afgerond → groen
  - Gearchiveerd → lichtgrijs

Schrijf componenttests voor alle drie tegels (lege state + gevulde state).

**Klaar als:** dashboard toont correcte data, tests slagen, `run.bat test` groen

---

### Stap 9 — Alle Projecten pagina
**Branch:** `feature/alle-projecten`

- Lijst/tabelweergave van alle eigen projecten
- Filter op status, zoeken op naam
- Knop "Nieuw project aanmaken"
- Doorklik naar project detail

**Klaar als:** pagina toont projecten, filteren en zoeken werken

---

### Stap 10 — Project Detail pagina
**Branch:** `feature/project-detail`

Secties:
1. Header: naam, status dropdown (inline bewerkbaar), start/einddatum, bewerken-knop
2. Omschrijving
3. Sharepoint links (projectmap + actielijst, openen in nieuw tabblad)
4. Kwaliteitschecklist: per document (Kickoff, Startnotitie, Projectplan, Evaluatie) een checkbox + datumveld + URL veld
5. Projectgroepleden: lijst met naam en rol, toevoegen/verwijderen

**Klaar als:** alle secties tonen en bewerkbaar zijn, wijzigingen worden opgeslagen in Supabase

---

### Stap 11 — Project aanmaken/bewerken formulier
**Branch:** `feature/project-formulier`

Mantine formulier voor `/projects/new` en `/projects/:id/edit`:
- Projectnaam (verplicht)
- Omschrijving
- Status
- Startdatum
- Einddatum (default: startdatum + 1 jaar via `defaultEndDate`, aanpasbaar)
- Sharepoint projectmap URL
- Sharepoint actielijst URL
- Opslaan / Annuleren

**Klaar als:** aanmaken en bewerken werken, einddatum wordt automatisch ingesteld

---

### Stap 12 — Instellingen pagina
**Branch:** `feature/instellingen`

- Profiel bewerken (naam)
- 2FA status tonen, opnieuw instellen

**Klaar als:** profielwijziging wordt opgeslagen

---

### Stap 13 — CI/CD pipeline
**Branch:** `feature/ci-pipeline`

Maak `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm audit --audit-level=high
      - run: npm run test

  deploy:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: write
      pages: write
      id-token: write

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Na aanmaken geeft Claude Code de melding:

> **⏸ DEVELOPER ACTIE VEREIST**
> Stel GitHub Secrets in voordat je naar main pusht:
> 1. Ga naar github.com/digilabbnwv/bnwv_pmw_app → Settings → Secrets → Actions
> 2. Voeg toe: `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY`
> 3. Schakel GitHub Pages in: Settings → Pages → Branch: `gh-pages`

**Klaar als:** pipeline bestand is aangemaakt en gecommit

---

### Stap 14 — Eerste release
**Branch:** `release/1.0.0`

```bash
git checkout develop
git checkout -b release/1.0.0
# versienummer bijwerken in package.json naar 1.0.0
git commit -m "chore: bump version to 1.0.0"
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin main --tags
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0
```

**Klaar als:** GitHub Actions pipeline slaagt, app is live op https://digilabbnwv.github.io/bnwv_pmw_app/

---

## Design & Stijl

- **Primaire kleur:** Mantine kleurenpallet gegenereerd op basis van `#F06418`, genaamd `brand`
- **Light & Dark mode:** via Mantine ColorSchemeProvider met toggle in header
- **Typografie:** Mantine standaard (Inter)
- **Afgeronde hoeken:** Mantine standaard (`md`)
- **Responsive:** Mobile-first, SimpleGrid met breakpoints
- **Status badges:** Mantine Badge per status met bijbehorende kleur

---

## Security Hardening — Verboden patronen

Claude Code controleert zichzelf actief op onderstaande fouten.

### Nooit schrijven
```js
// Hardcoded credentials
createClient('https://xyz.supabase.co', 'eyJhbGci...')

// Stille fallback (verbergt configuratiefouten)
const url = import.meta.env.VITE_SUPABASE_URL || 'https://xyz.supabase.co'

// Ruwe errors naar gebruiker
setError(error.message)

// Gevoelige data loggen
console.log(session)
console.log(user)

// Route guard zonder MFA check
if (!session) navigate('/login') // ONVOLDOENDE
```

### Altijd doen
```js
// Crash bij ontbrekende config
if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL ontbreekt')

// Gebruikersvriendelijke foutmeldingen
setError('E-mailadres of wachtwoord is onjuist')

// Route guard met MFA check
const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
if (data.currentLevel !== 'aal2') navigate('/setup-totp')
```

### Service role key
De Supabase `service_role` key bestaat niet in dit project. De anon key is veilig voor frontend gebruik mits RLS actief is. Als Claude Code ergens een service_role key ziet of genereert: dat is altijd een fout.

### Zelfcontrole checklist (uitvoeren voor elke merge naar develop)
- [ ] Geen hardcoded URLs, keys of tokens in broncode
- [ ] `.env.example` aanwezig en gedocumenteerd
- [ ] `.env.local` staat in `.gitignore`
- [ ] `supabaseClient.js` gooit error bij ontbrekende env vars
- [ ] RLS ingeschakeld op alle vier tabellen
- [ ] Route guards controleren `aal2`, niet alleen sessie
- [ ] Foutmeldingen zijn gebruikersvriendelijk
- [ ] Geen `console.log` met sessie of gebruikersdata
- [ ] `npm audit --audit-level=high` slaagt

---

## Extra ontwikkelprincipes

- Gebruik **altijd** Mantine componenten, geen custom CSS tenzij strikt noodzakelijk
- Gebruik `@mantine/notifications` voor feedback na acties
- Gebruik `@mantine/modals` voor bevestigingsdialogen bij verwijderen
- Datumweergave altijd in DD-MM-YYYY
- Laadstates tonen met Mantine `Skeleton` of `Loader`
- Lege states vriendelijk communiceren
- Logica in `lib/utils/`, componenten zo "dom" mogelijk
- Data ophalen in pages of custom hooks, niet in leaf components
- Supabase altijd mocken in tests
