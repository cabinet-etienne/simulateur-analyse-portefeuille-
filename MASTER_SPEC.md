# Master Spec — Plateforme Patrimoniale Modulaire

> Version 1.0 — 18 mars 2026
> Cabinet de gestion de patrimoine premium

---

## Table des matières

1. [A. Vision Produit](#a-vision-produit)
2. [B. Architecture Technique](#b-architecture-technique)
3. [C. Structure du Monorepo](#c-structure-du-monorepo)
4. [D. Choix Technologiques](#d-choix-technologiques)
5. [E. Modèle de Données](#e-modèle-de-données)
6. [F. Modules par Classe d'Actifs](#f-modules-par-classe-dactifs)
7. [G. Module Consolidation Portefeuille](#g-module-consolidation-portefeuille)
8. [H. Console Admin](#h-console-admin)
9. [I. Système de Guides Contextuels](#i-système-de-guides-contextuels)
10. [J. Risques Techniques et Métier](#j-risques-techniques-et-métier)
11. [K. Roadmap V1 / V2 / V3](#k-roadmap-v1--v2--v3)
12. [L. Cahier des Charges Fonctionnel et Technique](#l-cahier-des-charges-fonctionnel-et-technique)

---

## A. Vision Produit

### Positionnement

L'application est un **outil d'aide à la décision patrimoniale** destiné aux conseillers en gestion de patrimoine (CGP). Elle permet d'analyser, comparer et consolider des produits financiers de différentes classes d'actifs, puis de restituer une vision claire et pédagogique au client final.

### Utilisateurs cibles

| Rôle | Usage |
|------|-------|
| **CGP / Analyste** | Saisie, import, analyse, comparaison, construction de portefeuille, génération de rapports |
| **Administrateur** | Correction de données, gestion des référentiels, configuration des seuils et paramètres |
| **Client / Prospect** | Consultation en lecture seule d'un rapport partagé via lien sécurisé |

### Principes directeurs

1. **Fiabilité des données** — Chaque donnée affichée doit être traçable (source, date, saisie manuelle vs import).
2. **Modularité** — Chaque classe d'actifs est un module indépendant avec son propre cycle de vie.
3. **Pédagogie** — Commentaires automatiques contextuels, guides intégrés, aucune donnée brute sans explication.
4. **Sobriété premium** — Design épuré, typographie lisible, palette restreinte, aucun élément décoratif sans fonction.
5. **Extensibilité** — L'ajout d'une nouvelle classe d'actifs (ex. Private Equity) ne doit pas impacter les modules existants.

### Flux utilisateur principal

```
Saisie/Import produit → Analyse individuelle → Comparaison intra-classe
        ↓                                              ↓
  Sélection produits retenus ──────────────→ Consolidation portefeuille
                                                       ↓
                                            Rapport client PDF/Web
```

---

## B. Architecture Technique

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    Client (SPA)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Module    │ │ Module   │ │ Module   │ │ Module    │  │
│  │ ETF      │ │ Oblig.   │ │ Struct.  │ │ SCPI      │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬──────┘  │
│       └─────────────┼───────────┼─────────────┘         │
│              ┌──────┴───────────┴──────┐                │
│              │  Module Consolidation   │                │
│              └────────────┬────────────┘                │
│              ┌────────────┴────────────┐                │
│              │    Shell / Layout       │                │
│              │  (Navigation, Auth,     │                │
│              │   Guides contextuels)   │                │
│              └─────────────────────────┘                │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API / tRPC
┌───────────────────────┴─────────────────────────────────┐
│                    Serveur API                           │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ Moteur      │ │ Moteur       │ │ Génération       │  │
│  │ d'analyse   │ │ commentaires │ │ rapports (PDF)   │  │
│  └──────┬──────┘ └──────┬───────┘ └────────┬─────────┘  │
│         └───────────────┼──────────────────┘             │
│              ┌──────────┴──────────┐                     │
│              │   Base de données   │                     │
│              │   PostgreSQL        │                     │
│              └─────────────────────┘                     │
└──────────────────────────────────────────────────────────┘
```

### Principes architecturaux

| Principe | Décision |
|----------|----------|
| **Monorepo** | Un seul repo avec packages séparés (apps, packages, modules) |
| **API typée de bout en bout** | tRPC pour la communication client ↔ serveur, types partagés |
| **Séparation domaine / UI** | Le calcul et l'analyse sont dans des packages partagés, réutilisables côté serveur et client |
| **Moteur de commentaires** | Module dédié qui produit du texte structuré à partir de règles métier déclaratives |
| **Génération PDF** | Côté serveur, template-driven, mêmes composants que la vue web |
| **Auth simple** | Session-based auth, pas d'OAuth complexe en V1 |
| **Partage client** | Liens signés avec expiration, lecture seule, pas de compte client requis |

---

## C. Structure du Monorepo

```
simulateur-analyse-portefeuille/
├── apps/
│   ├── web/                          # Application Next.js (frontend + API routes)
│   │   ├── src/
│   │   │   ├── app/                  # App Router (pages, layouts)
│   │   │   │   ├── (auth)/           # Pages authentification
│   │   │   │   ├── (dashboard)/      # Shell principal
│   │   │   │   │   ├── etf/
│   │   │   │   │   ├── obligations/
│   │   │   │   │   ├── produits-structures/
│   │   │   │   │   ├── scpi/
│   │   │   │   │   ├── portefeuille/
│   │   │   │   │   └── admin/
│   │   │   │   └── partage/          # Vue lecture seule (lien partagé)
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Composants design system
│   │   │   │   ├── modules/          # Composants spécifiques par module
│   │   │   │   ├── charts/           # Composants graphiques
│   │   │   │   └── layout/           # Navigation, sidebar, header
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── public/
│   │
│   └── pdf-worker/                   # Service de génération PDF (optionnel, séparé si lourd)
│
├── packages/
│   ├── core/                         # Types et interfaces partagés
│   │   ├── src/
│   │   │   ├── models/               # Modèle de données (types TS)
│   │   │   ├── enums/                # Énumérations métier
│   │   │   └── interfaces/           # Contrats entre modules
│   │
│   ├── analysis/                     # Moteurs de calcul (pur TS, sans dépendance UI)
│   │   ├── src/
│   │   │   ├── etf/
│   │   │   ├── obligations/
│   │   │   ├── produits-structures/
│   │   │   ├── scpi/
│   │   │   ├── portfolio/            # Consolidation
│   │   │   └── shared/               # Fonctions de calcul partagées
│   │
│   ├── commentary/                   # Moteur de commentaires automatiques
│   │   ├── src/
│   │   │   ├── rules/                # Règles déclaratives par classe d'actifs
│   │   │   ├── templates/            # Templates de phrases
│   │   │   └── engine.ts             # Moteur d'évaluation
│   │
│   ├── pdf/                          # Génération de rapports PDF
│   │   ├── src/
│   │   │   ├── templates/
│   │   │   └── renderer.ts
│   │
│   ├── guides/                       # Système de guides contextuels
│   │   ├── src/
│   │   │   ├── content/              # Contenu des guides par champ/section
│   │   │   └── provider.ts
│   │
│   └── db/                           # Schéma Prisma + migrations + seed
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── src/
│           └── client.ts
│
├── tooling/
│   ├── eslint/                       # Config ESLint partagée
│   ├── typescript/                   # Config TS partagée
│   └── tailwind/                     # Config Tailwind partagée
│
├── turbo.json
├── package.json
├── tsconfig.json
├── MASTER_SPEC.md
└── CHANGELOG.md
```

---

## D. Choix Technologiques

### Stack retenue

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Framework** | Next.js 14+ (App Router) | SSR pour partage client, API routes intégrées, écosystème mature |
| **Langage** | TypeScript strict | Sécurité des types de bout en bout, maintenabilité |
| **UI** | React 18+ | Standard, large écosystème de composants |
| **Design System** | Tailwind CSS + shadcn/ui | Composants accessibles, personnalisables, pas de vendor lock-in |
| **Graphiques** | Recharts | Léger, déclaratif, bonne intégration React |
| **API** | tRPC | Typage de bout en bout sans génération de code, DX excellente |
| **ORM** | Prisma | Migrations typées, auto-complétion, introspection schema |
| **Base de données** | PostgreSQL | Robuste, JSON natif pour données flexibles, extensions analytiques |
| **Auth** | NextAuth.js (Auth.js) | Credentials provider en V1, extensible OAuth V2 |
| **Validation** | Zod | Validation runtime alignée avec les types TS, intégrée à tRPC |
| **PDF** | React-PDF (@react-pdf/renderer) | Mêmes composants React pour web et PDF |
| **Monorepo** | Turborepo | Build incrémental, cache, orchestration des packages |
| **Tests** | Vitest + Testing Library | Rapide, compatible TS natif, API Jest-compatible |
| **CI/CD** | GitHub Actions | Intégré au repo, gratuit pour projets privés |

### Choix écartés et raisons

| Alternative | Raison du rejet |
|-------------|-----------------|
| Angular | Trop verbeux pour une équipe réduite, écosystème CGP plus faible |
| GraphQL | Over-engineering pour une app mono-client, tRPC suffit |
| MongoDB | Données financières fortement relationnelles, besoin de contraintes |
| Micro-frontends | Complexité injustifiée, les modules partagent trop de contexte |
| Electron | Pas de besoin desktop, le web couvre tous les cas d'usage |

---

## E. Modèle de Données

### Entités communes (shared)

```
┌──────────────────────────────────────────────────────────┐
│                       Product                            │
├──────────────────────────────────────────────────────────┤
│ id              UUID                                     │
│ type            ENUM(ETF, BOND, STRUCTURED, SCPI, PE)    │
│ name            VARCHAR(255)                             │
│ isin            VARCHAR(12)          nullable            │
│ currency        ENUM(EUR, USD, GBP, CHF)                │
│ status          ENUM(DRAFT, VALIDATED, ARCHIVED)         │
│ created_by      → User                                  │
│ created_at      TIMESTAMP                               │
│ updated_at      TIMESTAMP                               │
│ data_sources    JSONB  (traçabilité: champ → source)    │
│ tags            VARCHAR[]                                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                       User                               │
├──────────────────────────────────────────────────────────┤
│ id              UUID                                     │
│ email           VARCHAR(255) UNIQUE                      │
│ name            VARCHAR(255)                             │
│ role            ENUM(ADMIN, ANALYST, VIEWER)             │
│ created_at      TIMESTAMP                               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                      Portfolio                           │
├──────────────────────────────────────────────────────────┤
│ id              UUID                                     │
│ name            VARCHAR(255)                             │
│ client_name     VARCHAR(255)                             │
│ risk_profile    ENUM(PRUDENT, EQUILIBRE, DYNAMIQUE,     │
│                      OFFENSIF)                           │
│ investment_horizon  INTEGER (mois)                       │
│ objectives      TEXT[]                                   │
│ constraints     JSONB                                    │
│ created_by      → User                                  │
│ created_at      TIMESTAMP                               │
│ updated_at      TIMESTAMP                               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  PortfolioAllocation                     │
├──────────────────────────────────────────────────────────┤
│ id              UUID                                     │
│ portfolio_id    → Portfolio                              │
│ product_id      → Product                               │
│ weight          DECIMAL(5,4)  (0.0000 → 1.0000)        │
│ amount          DECIMAL(15,2)                            │
│ rationale       TEXT (justification du choix)            │
│ added_at        TIMESTAMP                               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    SharedReport                          │
├──────────────────────────────────────────────────────────┤
│ id              UUID                                     │
│ portfolio_id    → Portfolio                              │
│ token           VARCHAR(64) UNIQUE                       │
│ expires_at      TIMESTAMP                               │
│ created_by      → User                                  │
│ accessed_count  INTEGER DEFAULT 0                        │
│ created_at      TIMESTAMP                               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    DataAuditLog                          │
├──────────────────────────────────────────────────────────┤
│ id              UUID                                     │
│ entity_type     VARCHAR(50)                              │
│ entity_id       UUID                                    │
│ field           VARCHAR(100)                             │
│ old_value       JSONB                                    │
│ new_value       JSONB                                    │
│ source          ENUM(MANUAL, IMPORT, COMPUTED, ADMIN)    │
│ changed_by      → User                                  │
│ changed_at      TIMESTAMP                               │
└──────────────────────────────────────────────────────────┘
```

### Entités spécifiques par classe d'actifs

```
┌──────────────────────────────────────────────────────────┐
│                     EtfData                              │
├──────────────────────────────────────────────────────────┤
│ product_id         → Product (1:1)                      │
│ index_tracked      VARCHAR(255)                          │
│ replication_method ENUM(PHYSICAL, SYNTHETIC, SAMPLING)   │
│ ter               DECIMAL(5,4)  (Total Expense Ratio)   │
│ aum               DECIMAL(15,2) (Actifs sous gestion)   │
│ distribution_policy ENUM(CAPITALIZING, DISTRIBUTING)    │
│ domicile          VARCHAR(50)                            │
│ inception_date    DATE                                   │
│ tracking_error    DECIMAL(5,4)                           │
│ volatility_1y     DECIMAL(5,4)                           │
│ volatility_3y     DECIMAL(5,4)                           │
│ return_ytd        DECIMAL(6,4)                           │
│ return_1y         DECIMAL(6,4)                           │
│ return_3y         DECIMAL(6,4)                           │
│ return_5y         DECIMAL(6,4)                           │
│ sharpe_ratio      DECIMAL(5,3)                           │
│ sector_exposure   JSONB                                  │
│ geo_exposure      JSONB                                  │
│ top_holdings      JSONB                                  │
│ pea_eligible      BOOLEAN                                │
│ sri_label         VARCHAR(50)  nullable                  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                     BondData                             │
├──────────────────────────────────────────────────────────┤
│ product_id          → Product (1:1)                     │
│ issuer              VARCHAR(255)                         │
│ issuer_type         ENUM(SOVEREIGN, CORPORATE,          │
│                          FINANCIAL, SUPRANATIONAL)       │
│ coupon_rate         DECIMAL(6,4)                         │
│ coupon_frequency    ENUM(ANNUAL, SEMI_ANNUAL,           │
│                          QUARTERLY, ZERO_COUPON)         │
│ maturity_date       DATE                                 │
│ issue_date          DATE                                 │
│ nominal_value       DECIMAL(15,2)                        │
│ purchase_price      DECIMAL(8,4) (en % du nominal)      │
│ current_price       DECIMAL(8,4)                         │
│ ytm                 DECIMAL(6,4) (Yield to Maturity)    │
│ duration            DECIMAL(6,3)                         │
│ modified_duration   DECIMAL(6,3)                         │
│ convexity           DECIMAL(8,3)                         │
│ credit_rating       VARCHAR(10) (ex: "AA+", "BBB-")     │
│ rating_agency       ENUM(SP, MOODYS, FITCH)             │
│ seniority           ENUM(SENIOR, SUBORDINATED, HYBRID)  │
│ callable            BOOLEAN                              │
│ call_date           DATE nullable                        │
│ call_price          DECIMAL(8,4) nullable                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  StructuredProductData                   │
├──────────────────────────────────────────────────────────┤
│ product_id              → Product (1:1)                 │
│ issuer                  VARCHAR(255)                     │
│ underlying              VARCHAR(255)                     │
│ underlying_type         ENUM(INDEX, STOCK, BASKET,      │
│                              RATE, FUND)                 │
│ product_subtype         ENUM(AUTOCALL, PHOENIX,         │
│                              REVERSE_CONVERTIBLE,        │
│                              CAPITAL_PROTECTED, OTHER)   │
│ strike_date             DATE                             │
│ maturity_date           DATE                             │
│ capital_protection      DECIMAL(5,4) (0=aucune,         │
│                              1=totale)                   │
│ barrier_level           DECIMAL(6,4) (en % du strike)   │
│ barrier_type            ENUM(EUROPEAN, AMERICAN,        │
│                              DAILY_CLOSE)                │
│ coupon_rate             DECIMAL(6,4) (coupon conditionnel│
│                              ou garanti)                 │
│ coupon_type             ENUM(GUARANTEED, CONDITIONAL,   │
│                              MEMORY)                     │
│ coupon_trigger_level    DECIMAL(6,4)                     │
│ autocall_trigger_level  DECIMAL(6,4) nullable            │
│ autocall_frequency      ENUM(QUARTERLY, SEMI_ANNUAL,    │
│                              ANNUAL) nullable            │
│ observation_dates       JSONB (DATE[])                   │
│ fees_entry              DECIMAL(5,4)                     │
│ fees_ongoing            DECIMAL(5,4)                     │
│ payoff_description      TEXT                             │
│ scenarios               JSONB                            │
│   /* { optimistic: {...}, median: {...},                 │
│        pessimistic: {...}, stress: {...} }  */           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                      ScpiData                            │
├──────────────────────────────────────────────────────────┤
│ product_id             → Product (1:1)                  │
│ management_company     VARCHAR(255)                      │
│ scpi_type              ENUM(YIELD, FISCAL, VALORISATION,│
│                             DIVERSIFIED)                 │
│ capital_type           ENUM(FIXED, VARIABLE)            │
│ share_price            DECIMAL(10,2)                     │
│ subscription_fee       DECIMAL(5,4)                      │
│ management_fee         DECIMAL(5,4)                      │
│ withdrawal_fee         DECIMAL(5,4) nullable             │
│ distribution_rate      DECIMAL(5,4) (TDVM / TD)         │
│ revaluation_rate       DECIMAL(6,4)                      │
│ occupancy_rate         DECIMAL(5,4) (TOF)               │
│ capitalization         DECIMAL(15,2)                     │
│ total_area             DECIMAL(12,2) (m²)               │
│ nb_properties          INTEGER                           │
│ nb_tenants             INTEGER                           │
│ debt_ratio             DECIMAL(5,4) (RAN/endettement)   │
│ sector_allocation      JSONB                             │
│   /* { bureau: 0.35, commerce: 0.25, ... } */           │
│ geo_allocation         JSONB                             │
│   /* { france: 0.60, allemagne: 0.20, ... } */          │
│ historical_returns     JSONB                             │
│   /* [{ year: 2023, distribution: 0.045,                │
│          revaluation: 0.012 }, ...] */                   │
│ minimum_subscription   DECIMAL(10,2)                     │
│ dismemberment_available BOOLEAN                          │
│ life_insurance_eligible BOOLEAN                          │
└──────────────────────────────────────────────────────────┘
```

### Diagramme relationnel simplifié

```
User ─────────┐
              │ 1:N
              ▼
         Portfolio ◄──── SharedReport
              │ 1:N
              ▼
     PortfolioAllocation
              │ N:1
              ▼
          Product ──────┬──── EtfData (1:1)
              │         ├──── BondData (1:1)
              │         ├──── StructuredProductData (1:1)
              │         └──── ScpiData (1:1)
              │
              ▼
        DataAuditLog
```

---

## F. Modules par Classe d'Actifs

### F.1 Module ETF

**Fonctionnalités d'analyse :**

| Analyse | Description |
|---------|-------------|
| Coût total | TER + spread estimé + coût de transaction |
| Performance ajustée | Rendements nets de frais, comparés à l'indice |
| Tracking quality | Tracking error, tracking difference |
| Risque | Volatilité, max drawdown, Sharpe, Sortino |
| Exposition | Répartition sectorielle, géographique, top holdings |
| Liquidité | AUM, volume moyen, spread bid-ask |
| Fiscalité | Éligibilité PEA, domicile fiscal, retenue à la source |

**Comparaison :** Tableau comparatif jusqu'à 5 ETF, radar chart multi-critères, classement pondéré configurable.

**Commentaires automatiques (exemples) :**
- "Le TER de 0.07% place cet ETF parmi les moins chers de sa catégorie."
- "Attention : tracking error de 0.45% supérieur à la moyenne de la catégorie (0.20%)."
- "Encours de 150M€ : liquidité correcte mais inférieure aux leaders du marché."

---

### F.2 Module Obligations

**Fonctionnalités d'analyse :**

| Analyse | Description |
|---------|-------------|
| Rendement | YTM, current yield, rendement au call |
| Sensibilité | Duration, duration modifiée, convexité |
| Crédit | Rating, spread vs taux sans risque, migration possible |
| Scénarios taux | Impact d'un choc de +/- 50, 100, 200 bps |
| Flux | Échéancier de coupons et remboursement |
| Risque de réinvestissement | Durée restante, fréquence de coupons |

**Comparaison :** Matrice rendement/risque crédit, courbe des taux avec positionnement, analyse de spread.

**Commentaires automatiques (exemples) :**
- "Avec une duration modifiée de 6.2, une hausse de 100bps des taux entraînerait une baisse de ~6.1% du prix."
- "Le spread de 180bps au-dessus du taux sans risque rémunère correctement le risque BBB."

---

### F.3 Module Produits Structurés

**Fonctionnalités d'analyse :**

| Analyse | Description |
|---------|-------------|
| Payoff | Schéma visuel du profil de gain/perte |
| Scénarios | 4 scénarios (optimiste, médian, pessimiste, stress) avec rendements annualisés |
| Protection du capital | Niveau de barrière, type, probabilité historique de franchissement |
| Coûts | Décomposition frais d'entrée, frais courants, marge structureur estimée |
| Sous-jacent | Analyse du sous-jacent (volatilité historique, niveau actuel vs strike) |
| Liquidité | Marché secondaire, pénalité de sortie |
| Complexité | Score de complexité (nombre de mécanismes, conditions) |

**Comparaison :** Profils de payoff superposés, matrice protection/rendement, analyse coût comparée.

**Commentaires automatiques (exemples) :**
- "La barrière à 60% du strike n'a été franchie que 3 fois en 20 ans sur cet indice (en clôture)."
- "Le rendement annualisé de 7% ne rémunère qu'en partie le risque de perte en capital au-delà de la barrière."
- "Produit de complexité élevée (score 4/5) : 3 mécanismes conditionnels imbriqués."

---

### F.4 Module SCPI

**Fonctionnalités d'analyse :**

| Analyse | Description |
|---------|-------------|
| Rendement | Taux de distribution, rendement global (distribution + revalorisation) |
| Coûts | Frais de souscription, gestion, retrait, impact sur le point mort |
| Qualité locative | TOF, nombre de locataires, diversification sectorielle |
| Patrimoine | Répartition géographique, typologie de biens, surface |
| Solidité | Capitalisation, ratio d'endettement, report à nouveau |
| Historique | Évolution du prix de part, distributions sur 5-10 ans |
| Liquidité | Délai de retrait, marché secondaire, capital fixe vs variable |

**Comparaison :** Rendement net de frais à horizon 8 ans, qualité du parc, diversification croisée.

**Commentaires automatiques (exemples) :**
- "Le TOF de 97.2% est excellent et témoigne d'une gestion locative de qualité."
- "Les frais de souscription de 12% impliquent un point mort à ~2.7 ans."
- "Attention : 45% du patrimoine concentré sur le secteur bureaux en Île-de-France."

---

## G. Module Consolidation Portefeuille

### Fonctionnalités

#### G.1 Agrégation

- Sélection des produits retenus depuis chaque module
- Définition du poids de chaque produit (en % ou en montant)
- Association à un profil investisseur (profil de risque, horizon, objectifs)

#### G.2 Analyses consolidées

| Analyse | Description |
|---------|-------------|
| **Allocation par classe** | Répartition ETF / Obligations / Structurés / SCPI / Liquidités |
| **Allocation géographique** | Agrégation des expositions géo de tous les produits |
| **Allocation sectorielle** | Agrégation des expositions sectorielles |
| **Coûts totaux** | Coût pondéré annuel, frais d'entrée totaux, point mort global |
| **Profil rendement/risque** | Rendement attendu pondéré, volatilité estimée, Sharpe portefeuille |
| **Concentration** | Indice HHI, top 3 expositions, alertes si > seuil |
| **Cohérence profil** | Score de cohérence vs profil investisseur, alertes si incohérence |
| **Liquidité globale** | Part liquide vs illiquide, stress de liquidité |
| **Sensibilité taux** | Duration agrégée, impact d'un choc taux sur le portefeuille |

#### G.3 Commentaires de synthèse

Le moteur de commentaires produit :
- Un paragraphe de synthèse globale
- Des alertes contextuelles (concentration, incohérence profil, coûts élevés)
- Des recommandations (diversification, rééquilibrage)

#### G.4 Rapport client

**Format :** PDF téléchargeable + vue web partageable via lien sécurisé.

**Structure du rapport :**

```
1. Page de garde (nom cabinet, logo, client, date)
2. Synthèse exécutive (3-5 lignes)
3. Profil investisseur (rappel)
4. Allocation globale (graphiques)
5. Détail par produit retenu (fiche synthétique)
6. Analyse des coûts
7. Analyse des risques
8. Commentaires et recommandations
9. Annexes (méthodologie, glossaire, mentions légales)
```

---

## H. Console Admin

### Fonctionnalités

| Fonction | Description |
|----------|-------------|
| **Gestion des produits** | Créer, éditer, valider, archiver des produits de toute classe |
| **Correction de données** | Modifier une donnée unitaire avec historisation (audit log) |
| **Gestion des référentiels** | Seuils d'alerte, catégories, paramètres de scoring |
| **Gestion des utilisateurs** | CRUD utilisateurs, attribution des rôles |
| **Import en masse** | Upload CSV/Excel avec mapping des colonnes et validation |
| **Monitoring** | Rapports générés, produits les plus consultés, erreurs de données |

### Règles d'audit

- Toute modification de donnée génère une entrée dans `DataAuditLog`.
- L'admin voit l'historique complet d'un champ (qui, quand, ancienne/nouvelle valeur, source).
- Les modifications admin sont marquées `source = ADMIN` pour les distinguer des imports ou calculs.

---

## I. Système de Guides Contextuels

### Principe

Chaque champ de saisie ou section d'analyse peut afficher un guide contextuel qui explique :

1. **Définition** — Ce que représente la donnée.
2. **Où la trouver** — Sources précises (site du fournisseur, DICI, rapport annuel, etc.).
3. **Comment l'interpréter** — Fourchettes typiques, seuils d'alerte, comparaisons.
4. **Exemple** — Valeur illustrative avec explication.

### Implémentation

```typescript
// packages/guides/src/content/etf.ts
export const etfGuides = {
  ter: {
    definition: "Le Total Expense Ratio représente les frais annuels totaux...",
    source: "Disponible sur le DICI (Document d'Informations Clés) de l'ETF, rubrique 'Coûts'...",
    interpretation: "Un TER < 0.20% est considéré comme faible pour un ETF actions...",
    example: "Un ETF MSCI World typique a un TER entre 0.12% et 0.30%."
  },
  // ...
};
```

### UX

- Icône `?` discrète à côté de chaque champ.
- Au clic : panneau latéral ou popover avec le guide complet.
- Mode "découverte" pour les nouveaux utilisateurs : guides affichés par défaut.

---

## J. Risques Techniques et Métier

### Risques techniques

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Complexité du modèle de données** | Retard, bugs | Moyenne | Valider le schéma avec des données réelles avant de coder les modules |
| **Performance des calculs consolidés** | UX dégradée | Faible | Calculs côté serveur, cache des résultats, calcul incrémental |
| **Qualité du PDF généré** | Image non premium | Moyenne | Prototyper le PDF dès la V1 avec des données réelles |
| **Taille du monorepo** | Temps de build | Faible | Turborepo avec cache distant, builds incrémentaux |
| **Migration de schéma** | Perte de données | Faible | Prisma migrations, backups avant chaque migration, tests de migration |

### Risques métier

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Données produit obsolètes** | Analyses fausses | Élevée | Afficher la date de dernière mise à jour, alerter si > 30 jours |
| **Erreur de calcul financier** | Perte de crédibilité | Moyenne | Tests unitaires exhaustifs sur chaque formule, cross-validation avec sources de marché |
| **Commentaires automatiques inadaptés** | Confusion client | Moyenne | Règles déclaratives révisables, relecture humaine avant partage |
| **Dépendance à la saisie manuelle** | Adoption faible | Élevée | Prioriser les imports structurés, pré-remplissage, guides de saisie |
| **Réglementation** | Non-conformité | Faible | Mentions légales, disclaimers, pas de conseil automatisé |
| **Confidentialité données client** | Risque juridique | Moyenne | Chiffrement, accès par rôle, liens partagés avec expiration |

---

## K. Roadmap V1 / V2 / V3

### V1 — Fondations et premier module (ETF)

**Objectif :** Livrer un outil utilisable en production pour un module complet.

| Livrable | Détail |
|----------|--------|
| Scaffold monorepo | Structure, tooling, CI/CD |
| Auth basique | Login email/password, rôles ADMIN/ANALYST |
| Module ETF complet | Saisie, analyse, comparaison, commentaires |
| Design system | Composants de base (formulaires, tableaux, cartes, graphiques) |
| Guides contextuels ETF | Tous les champs documentés |
| Console admin V1 | CRUD produits ETF, gestion utilisateurs |
| Base de données | Schéma core + ETF, migrations, seed |
| Tests | Couverture moteur de calcul ETF > 90% |

**Durée estimée : ~6-8 semaines**

---

### V2 — Modules obligations et produits structurés + consolidation

**Objectif :** Couvrir 3 classes d'actifs et offrir la consolidation portefeuille.

| Livrable | Détail |
|----------|--------|
| Module Obligations | Saisie, analyse, comparaison, commentaires |
| Module Produits Structurés | Saisie, analyse (payoff, scénarios), comparaison |
| Consolidation portefeuille V1 | Agrégation, allocation, coûts, risques basiques |
| Rapport client V1 | PDF avec synthèse, allocation, détail produits |
| Import CSV/Excel | Mapping colonnes, validation, preview |
| Guides contextuels | Obligations + Structurés |
| Partage client | Liens sécurisés en lecture seule |

**Durée estimée : ~8-10 semaines**

---

### V3 — SCPI, consolidation avancée, polish

**Objectif :** Plateforme complète avec toutes les classes d'actifs V1.

| Livrable | Détail |
|----------|--------|
| Module SCPI | Saisie, analyse, comparaison, commentaires |
| Consolidation avancée | Cohérence profil, concentration (HHI), sensibilité taux, liquidité |
| Rapport client V2 | Design premium, personnalisation (logo, couleurs), annexes |
| Console admin V2 | Monitoring, import en masse, gestion des seuils |
| Mode prospect | Vue simplifiée pour démonstration commerciale |
| Guides contextuels SCPI | Tous les champs documentés |
| Performance | Optimisation des calculs, cache, lazy loading |

**Durée estimée : ~6-8 semaines**

---

### Backlog V4+ (non planifié)

- Module Private Equity (J-curve, TRI, multiples, cashflows)
- Intégration flux de données externes (API fournisseurs, Bloomberg, Quantalys)
- Multi-cabinet (white-label, multi-tenant)
- Module fiscalité (simulation IR, IFI, plus-values, démembrement)
- Historique et versioning des portefeuilles
- Notifications (produit arrivant à maturité, données obsolètes)
- API publique pour intégration CRM

---

## L. Cahier des Charges Fonctionnel et Technique

### L.1 Exigences fonctionnelles

#### EF-01 : Saisie de produit
- L'utilisateur peut créer un produit en saisissant les données manuellement via un formulaire guidé.
- Chaque champ dispose d'un guide contextuel accessible en un clic.
- La saisie est validée en temps réel (types, bornes, cohérence).
- Le produit est créé en statut DRAFT jusqu'à validation explicite.

#### EF-02 : Import de produit
- L'utilisateur peut importer un fichier CSV ou Excel.
- Un écran de mapping permet d'associer les colonnes du fichier aux champs du produit.
- Un aperçu des données importées est affiché avant confirmation.
- Les erreurs de validation sont listées avec indication de la ligne et du champ.

#### EF-03 : Analyse individuelle
- Pour chaque produit validé, l'application affiche une page d'analyse complète.
- Les métriques calculées sont affichées avec des graphiques et des commentaires automatiques.
- L'utilisateur peut voir la source de chaque donnée (saisie manuelle, import, calcul).

#### EF-04 : Comparaison intra-classe
- L'utilisateur peut sélectionner 2 à 5 produits de la même classe d'actifs.
- Un tableau comparatif affiche toutes les métriques côte à côte.
- Un graphique radar permet de comparer visuellement les profils.
- Un classement pondéré configurable aide à la décision.

#### EF-05 : Construction de portefeuille
- L'utilisateur peut créer un portefeuille en sélectionnant des produits analysés.
- Il définit le profil investisseur (risque, horizon, objectifs).
- Il attribue un poids ou un montant à chaque produit.
- Le portefeuille est analysé en consolidé avec commentaires.

#### EF-06 : Rapport client
- L'utilisateur peut générer un rapport PDF à partir d'un portefeuille.
- Le rapport suit une structure définie avec synthèse, graphiques et commentaires.
- Le rapport peut être partagé via un lien sécurisé avec expiration.

#### EF-07 : Console admin
- L'admin peut corriger toute donnée produit avec traçabilité complète.
- L'admin peut gérer les utilisateurs et leurs rôles.
- L'admin peut configurer les seuils d'alerte et paramètres de scoring.

#### EF-08 : Guides contextuels
- Chaque champ de saisie et chaque métrique d'analyse dispose d'un guide.
- Le guide contient : définition, source, interprétation, exemple.
- Un mode "découverte" affiche les guides par défaut pour les nouveaux utilisateurs.

### L.2 Exigences techniques

#### ET-01 : Performance
- Temps de chargement initial < 3s sur connexion standard.
- Calculs d'analyse individuelle < 500ms.
- Calculs de consolidation portefeuille < 2s pour 20 produits.
- Génération PDF < 5s.

#### ET-02 : Sécurité
- Authentification par session avec tokens CSRF.
- Mots de passe hashés (bcrypt, coût ≥ 12).
- Liens partagés avec tokens cryptographiquement sûrs (64 chars).
- Validation côté serveur de toutes les entrées (Zod).
- Protection XSS, injection SQL (via ORM).
- HTTPS obligatoire en production.

#### ET-03 : Fiabilité des données
- Toute modification de donnée est historisée (DataAuditLog).
- Chaque valeur affichée peut être tracée à sa source.
- Les calculs financiers sont couverts par des tests unitaires (couverture > 90%).
- Les formules sont documentées dans le code avec références bibliographiques.

#### ET-04 : Maintenabilité
- TypeScript strict (no any, strict null checks).
- Linting et formatting automatiques (ESLint, Prettier).
- Architecture en packages avec responsabilités claires.
- Documentation des interfaces entre packages.

#### ET-05 : Accessibilité
- Conformité WCAG 2.1 niveau AA.
- Navigation clavier complète.
- Contrastes suffisants sur tous les éléments textuels.
- Labels ARIA sur les graphiques.

#### ET-06 : Compatibilité
- Navigateurs : Chrome, Firefox, Safari, Edge (2 dernières versions).
- Responsive : desktop prioritaire, tablette supportée, mobile consultation seule.

---

### L.3 Contraintes de design

| Aspect | Directive |
|--------|-----------|
| **Palette** | Fond clair neutre, accent bleu marine / or discret, pas de couleurs vives |
| **Typographie** | Inter ou équivalent sans-serif, hiérarchie claire (3 niveaux max) |
| **Densité** | Aéré sur les pages d'analyse, dense sur les tableaux comparatifs |
| **Graphiques** | Couleurs cohérentes, légendes toujours visibles, pas d'effets 3D |
| **Iconographie** | Lucide icons, monochromes, taille cohérente |
| **Animations** | Transitions subtiles (200-300ms), aucune animation gratuite |
| **Dark mode** | Non prévu en V1, architecture CSS compatible pour ajout futur |

---

*Fin du Master Spec — Version 1.0*
