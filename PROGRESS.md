# Project Voortgang: bnwv_pmw_app

Laatste update: 2026-02-24
Actieve branch: develop

## Voltooide stappen
- [x] 1. Projectscaffold en Git Flow setup

## Openstaande stappen
- [ ] 2. Linting en formatting
- [ ] 3. Test setup
- [ ] 4. Utility functies en tests
- [ ] 5. Database migraties schrijven
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

## Wacht op developer
- [ ] GitHub repo aanmaken: https://github.com/digilabbnwv/bnwv_pmw_app (voor push)
- [ ] Supabase project aanmaken (vereist voor stap 6)
- [ ] Supabase TOTP MFA inschakelen (vereist voor stap 6)

## Bekende problemen
- npm audit meldt 4 high severity vulnerabilities (in eslint dependencies van vite scaffold)
