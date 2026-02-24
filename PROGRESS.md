# Project Voortgang: bnwv_pmw_app

Laatste update: 2026-02-24
Actieve branch: develop

## Voltooide stappen
- [x] 1. Projectscaffold en Git Flow setup
- [x] 2. Linting en formatting (ESLint 8 + Prettier)
- [x] 3. Test setup (Vitest 4 + RTL + matchMedia mock)
- [x] 4. Utility functies en tests (27 tests, alle groen)
- [x] 5. Database migraties schrijven (3 SQL bestanden)
- [x] 6. Supabase client en authenticatie (login + TOTP 2FA + route guard)
- [x] 7. AppShell en routing (sidebar, dark/light toggle, uitlogknop)
- [x] 8. Dashboard (3 tegels: actief, verlopen, statusgrafiek + 10 tests)
- [x] 9. Alle Projecten pagina (zoeken, filteren, projectkaarten)
- [x] 10. Project Detail pagina (status, checklist, leden, SharePoint links)
- [x] 11. Project aanmaken/bewerken formulier (DateInput, auto einddatum)
- [x] 12. Instellingen pagina (profiel, 2FA status/reset)
- [x] 13. CI/CD pipeline (GitHub Actions: lint, test, audit, deploy)

## Openstaande stappen
- [ ] 14. Eerste release (release/1.0.0 branch, tag, merge naar main)

## Gemaakte keuzes & afwijkingen
- React 19 (i.p.v. 18) — geinstalleerd via create-vite, backward compatible
- Mantine v8 (valt onder v7+ eis)
- React Router v7 (backward compatible met v6 API)
- PostCSS config toegevoegd (vereist door Mantine)
- ESLint 8 (i.p.v. 9) — voor .eslintrc.cjs compatibiliteit
- Vitest pool: threads (i.p.v. forks) — forks timeout op Windows
- @mantine/dates + dayjs toegevoegd voor DateInput in formulier

## Wacht op developer
- [x] GitHub repo aangemaakt
- [x] Supabase project aangemaakt
- [x] Supabase TOTP MFA ingeschakeld
- [x] SQL migraties uitgevoerd
- [x] .env.local aangemaakt
- [ ] GitHub Secrets instellen: VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY (voor deploy)
- [ ] GitHub Pages inschakelen (branch: gh-pages) (voor deploy)

## Bekende problemen
- npm audit meldt high severity vulnerabilities (in eslint/vite dependencies)
- PieChart stderr warning in tests (jsdom heeft geen layout engine)
