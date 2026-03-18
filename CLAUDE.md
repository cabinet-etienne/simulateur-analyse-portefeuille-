# CLAUDE.md — Règles du Projet

## Identité

Plateforme patrimoniale modulaire pour cabinet de gestion de patrimoine premium.
Monorepo TypeScript (Turborepo) avec Next.js, tRPC, Prisma, PostgreSQL.

## Commandes

- `pnpm install` — Installer toutes les dépendances
- `pnpm dev` — Lancer les apps en mode développement
- `pnpm build` — Build complet du monorepo
- `pnpm lint` — Linter tout le projet
- `pnpm test` — Lancer tous les tests (Vitest)
- `pnpm test -- --run` — Tests sans watch mode
- `pnpm db:generate` — Générer le client Prisma
- `pnpm db:push` — Pousser le schéma vers la base
- `pnpm db:migrate` — Créer et appliquer une migration

## Conventions de code

### TypeScript
- **Strict mode obligatoire** : `strict: true`, pas de `any` explicite
- **Nommer en anglais** dans le code, commentaires métier en français acceptés
- **Enums** : utiliser des union types TS (`type X = "A" | "B"`) plutôt que `enum` TS
- **Imports** : chemins relatifs dans un package, alias `@repo/*` entre packages
- **Exports** : chaque package expose via `src/index.ts`, rien d'autre

### Architecture
- **Packages purs** : `core-domain`, `rules-engine`, `portfolio-engine`, `analysis` n'ont AUCUNE dépendance sur l'UI, la DB ou le framework web
- **Adapters** : toute logique spécifique à une classe d'actifs vit dans son adapter
- **Pas de logique métier dans les composants UI** : les composants appellent des hooks qui appellent tRPC qui appelle les moteurs
- **Pas de `console.log`** en production : utiliser le logger structuré

### Nommage
- Fichiers : `kebab-case.ts` pour les modules, `PascalCase.tsx` pour les composants React
- Types/Interfaces : `PascalCase`, préfixe `I` interdit
- Fonctions : `camelCase`
- Constantes : `UPPER_SNAKE_CASE` uniquement pour les vraies constantes globales
- Dossiers : `kebab-case`

### Base de données
- Toute modification de donnée produit doit passer par un service qui écrit dans `DataAuditLog`
- Les champs `created_at` et `updated_at` sont obligatoires sur toute table métier
- Pas de suppression physique : utiliser un champ `status` ou `archived_at`

### Tests
- Chaque formule financière doit avoir des tests unitaires avec des valeurs de référence connues
- Les tests de calcul incluent un commentaire avec la source de la valeur attendue
- Couverture cible : >90% sur `core-domain`, `rules-engine`, `portfolio-engine`

### Commentaires automatiques
- Les règles de commentaire sont déclaratives (données → conditions → texte)
- Aucun texte généré ne doit contenir de conseil d'investissement directif
- Vocabulaire : "suggère", "pourrait indiquer", "à considérer" — jamais "doit", "il faut"

### Git
- Commits en anglais, format conventionnel : `type(scope): message`
- Types : feat, fix, docs, refactor, test, chore, ci
- Scopes : core, db, web, admin, etf, bonds, structured, scpi, portfolio, reporting, rules

### Sécurité
- Pas de secrets dans le code, utiliser les variables d'environnement
- Valider toutes les entrées utilisateur avec Zod côté serveur
- Les liens partagés utilisent des tokens cryptographiques (crypto.randomBytes)

## Structure du monorepo

```
apps/web          → Application principale Next.js
apps/admin        → Console d'administration Next.js
packages/core-domain    → Types, enums, interfaces métier
packages/db             → Prisma schema, client, migrations
packages/data-ingestion → Parsers CSV/Excel, validation, mapping
packages/rules-engine   → Moteur de commentaires automatiques
packages/portfolio-engine → Calculs de consolidation portefeuille
packages/reporting      → Génération de rapports PDF
packages/adapters-etf   → Logique spécifique ETF
packages/adapters-bonds → Logique spécifique obligations
packages/adapters-structured → Logique spécifique produits structurés
packages/adapters-scpi  → Logique spécifique SCPI
packages/ui             → Design system et composants partagés
packages/guides         → Contenu des guides contextuels
tooling/                → Configs partagées (ESLint, TS, Tailwind)
```
