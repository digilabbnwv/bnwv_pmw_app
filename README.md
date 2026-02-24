# BNWV Projectbeheer Webapp

Webapp voor het beheren van bibliotheekprojecten binnen BNWV.

## Tech Stack

- React + Vite
- Mantine UI
- Supabase (PostgreSQL + Auth + RLS)
- GitHub Pages hosting

## Lokale ontwikkeling

### Vereisten

- Portable Node.js in `node_bin/` (reeds aanwezig)
- `.env.local` met Supabase credentials (zie `.env.example`)

### Opstarten

```bash
# Dependencies installeren
dev.bat install

# Development server starten
run.bat dev

# Tests draaien
run.bat test

# Linting
run.bat lint

# Productie build
run.bat build

# Security audit
run.bat audit
```

### Project structuur

```
src/
  components/     # Herbruikbare UI componenten
  pages/          # Pagina componenten (routes)
  lib/            # Supabase client, hooks, utilities
  __tests__/      # Unit tests
supabase/
  migrations/     # SQL migratie bestanden
```
