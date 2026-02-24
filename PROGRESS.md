# Project Voortgang: bnwv_pmw_app

Laatste update: 2026-02-24
Actieve branch: develop

## Voltooide stappen
- [x] 1. Projectscaffold en Git Flow setup
- [x] 2. Linting en formatting (ESLint 8 + Prettier)
- [x] 3. Test setup (Vitest 4 + RTL + matchMedia mock)
- [x] 4. Utility functies en tests (27 tests, alle groen)
- [x] 5. Database migraties schrijven (3 SQL bestanden)

## Openstaande stappen
- [ ] 6. Supabase client en authenticatie
- [ ] 7. AppShell en routing
- [ ] 8. Dashboard
- [ ] 9. Alle Projecten pagina
- [ ] 10. Project Detail pagina
- [ ] 11. Project aanmaken/bewerken formulier
- [ ] 12. Instellingen pagina
- [ ] 13. CI/CD pipeline
- [ ] 14. Eerste release

## Gemaakte keuzes & afwijkingen
- React 19 (i.p.v. 18) — geinstalleerd via create-vite, backward compatible
- Mantine v8 (valt onder v7+ eis)
- React Router v7 (backward compatible met v6 API)
- PostCSS config toegevoegd (vereist door Mantine)
- ESLint 8 (i.p.v. 9) — voor .eslintrc.cjs compatibiliteit
- Vitest pool: threads (i.p.v. forks) — forks timeout op Windows

## Wacht op developer
- [x] GitHub repo aangemaakt
- [ ] Supabase project aanmaken (vereist voor stap 6)
- [ ] Supabase TOTP MFA inschakelen (vereist voor stap 6)
- [ ] SQL migraties uitvoeren via Supabase SQL editor (na stap 5)
- [ ] .env.local aanmaken met Supabase URL en anon key (na stap 5)

## Bekende problemen
- npm audit meldt high severity vulnerabilities (in eslint/vite dependencies)
