# Spec Module ETF V1 — Comparateur & Scoring

> Version 1.0 — 18 mars 2026

---

## 1. Champs de données ETF

### 1.1 Champs d'identification (saisis ou enrichis par ISIN)

| Champ | Type | Requis | Source | Description |
|-------|------|--------|--------|-------------|
| `isin` | string(12) | **Oui** | Saisie | Code ISIN (point d'entrée principal) |
| `name` | string | Oui | Enrichi | Nom complet de l'ETF |
| `ticker` | string | Non | Enrichi | Ticker Bloomberg/bourse |
| `currency` | EUR/USD/GBP/CHF | Oui | Enrichi | Devise de cotation |
| `indexTracked` | string | Oui | Enrichi | Indice de référence |
| `provider` | string | Non | Enrichi | Émetteur (iShares, Amundi, Vanguard...) |

### 1.2 Champs structurels

| Champ | Type | Requis | Scoring | Description |
|-------|------|--------|---------|-------------|
| `replicationMethod` | PHYSICAL/SYNTHETIC/SAMPLING | Oui | Oui | Méthode de réplication |
| `distributionPolicy` | CAPITALIZING/DISTRIBUTING | Oui | Non | Capitalisant ou distribuant |
| `domicile` | string | Oui | Non | Pays de domiciliation |
| `inceptionDate` | date | Oui | Oui | Date de création (ancienneté) |
| `peaEligible` | boolean | Oui | Non | Éligibilité PEA |
| `ucitsCompliant` | boolean | Oui | Non | Conformité UCITS |
| `sriLabel` | string | Non | Non | Label ISR éventuel |

### 1.3 Champs de coûts

| Champ | Type | Requis | Scoring | Description |
|-------|------|--------|---------|-------------|
| `ter` | decimal(5,4) | **Oui** | **Oui** | Total Expense Ratio (frais annuels) |
| `transactionCost` | decimal(5,4) | Non | Oui | Coût de transaction estimé |
| `spreadEstimate` | decimal(5,4) | Non | Oui | Spread bid-ask estimé |

### 1.4 Champs de performance

| Champ | Type | Requis | Scoring | Description |
|-------|------|--------|---------|-------------|
| `returnYtd` | decimal(6,4) | Non | Non | Performance depuis le 1er janvier |
| `return1y` | decimal(6,4) | Non | Oui | Performance 1 an |
| `return3y` | decimal(6,4) | Non | Oui | Performance 3 ans (cumulée) |
| `return5y` | decimal(6,4) | Non | Oui | Performance 5 ans (cumulée) |
| `return1yVsIndex` | decimal(6,4) | Non | Oui | Écart de performance vs indice 1 an |

### 1.5 Champs de risque

| Champ | Type | Requis | Scoring | Description |
|-------|------|--------|---------|-------------|
| `volatility1y` | decimal(5,4) | Non | Oui | Volatilité annualisée 1 an |
| `volatility3y` | decimal(5,4) | Non | Oui | Volatilité annualisée 3 ans |
| `maxDrawdown` | decimal(6,4) | Non | Oui | Perte maximale historique |
| `sharpeRatio` | decimal(5,3) | Non | Oui | Ratio de Sharpe |
| `sortinoRatio` | decimal(5,3) | Non | Non | Ratio de Sortino |
| `beta` | decimal(5,3) | Non | Non | Bêta vs indice |

### 1.6 Champs de qualité de réplication

| Champ | Type | Requis | Scoring | Description |
|-------|------|--------|---------|-------------|
| `trackingError` | decimal(5,4) | Non | **Oui** | Écart-type de la tracking difference |
| `trackingDifference` | decimal(6,4) | Non | Oui | Écart cumulé vs indice |

### 1.7 Champs de liquidité

| Champ | Type | Requis | Scoring | Description |
|-------|------|--------|---------|-------------|
| `aum` | decimal(15,2) | Oui | **Oui** | Encours sous gestion (€) |
| `avgDailyVolume` | integer | Non | Oui | Volume quotidien moyen (nb parts) |

### 1.8 Champs d'exposition (JSON)

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `sectorExposure` | Record<string, number> | Non | Répartition sectorielle (%) |
| `geoExposure` | Record<string, number> | Non | Répartition géographique (%) |
| `topHoldings` | Array<{name, weight, isin?}> | Non | Top 10 positions |

---

## 2. Système de scoring

### 2.1 Philosophie

Le scoring est **multi-critères pondéré**. Chaque ETF reçoit une note de 0 à 100 sur 6 axes, puis un score global pondéré. Les pondérations sont configurables mais ont des valeurs par défaut.

### 2.2 Les 6 axes de scoring

| Axe | Poids par défaut | Description |
|-----|------------------|-------------|
| **Coûts** | 25% | TER + coûts de transaction + spread |
| **Performance** | 20% | Rendements historiques relatifs |
| **Tracking** | 20% | Qualité de la réplication de l'indice |
| **Risque** | 15% | Volatilité, drawdown, Sharpe |
| **Liquidité** | 10% | AUM, volume quotidien |
| **Maturité** | 10% | Ancienneté du fonds, taille |

### 2.3 Détail des scores par axe

#### Axe Coûts (0-100)

Le score est calculé **par rapport aux autres ETF de la comparaison** (scoring relatif).

```
score_cout = 100 - (rang_ter_dans_le_groupe / nb_etf_dans_le_groupe) * 100
```

Ajustements :
- TER < 0.10% → bonus +10 (plafonné à 100)
- TER > 0.50% → malus -15 (plancher 0)
- Si `transactionCost` disponible : inclus dans le coût total

#### Axe Performance (0-100)

```
Basé sur return1y, return3y, return5y (pondérés 20/40/40)
Score relatif au groupe + bonus/malus absolus :
- return1yVsIndex > 0 → bonus +5
- return1yVsIndex < -0.02 → malus -10
```

#### Axe Tracking (0-100)

```
trackingError :
  ≤ 0.05% → 100
  ≤ 0.10% → 90
  ≤ 0.20% → 75
  ≤ 0.50% → 50
  ≤ 1.00% → 25
  > 1.00% → 0

trackingDifference ajustement :
  ≤ -0.10% → -10 (ETF sous-performe significativement l'indice)
  ≥ +0.05% → +5 (ETF sur-performe légèrement)
```

Si tracking non disponible : score = null (non noté).

#### Axe Risque (0-100)

```
Composé de :
- sharpeRatio (40%) : normalisé 0-100 sur l'échelle [-1, 3]
- volatility1y (30%) : scoring inverse relatif au groupe
- maxDrawdown (30%) : scoring inverse relatif au groupe

Ajustements :
- Sharpe > 1.5 → bonus +5
- maxDrawdown > -30% → malus -10
```

#### Axe Liquidité (0-100)

```
aum :
  ≥ 5B€ → 100
  ≥ 1B€ → 85
  ≥ 500M€ → 70
  ≥ 100M€ → 50
  ≥ 50M€ → 30
  < 50M€ → 10

avgDailyVolume ajustement :
  ≥ 1M parts/jour → +10
  < 10K parts/jour → -15
```

#### Axe Maturité (0-100)

```
Ancienneté (années depuis inception) :
  ≥ 10 ans → 100
  ≥ 5 ans → 80
  ≥ 3 ans → 60
  ≥ 1 an → 40
  < 1 an → 15

Réplication physique → +5
UCITS compliant → +5
```

### 2.4 Score global

```
score_global = Σ (score_axe_i × poids_i)
```

### 2.5 Classement et verdict

| Score | Verdict | Couleur |
|-------|---------|---------|
| ≥ 85 | Excellent | Vert foncé |
| ≥ 70 | Bon | Vert |
| ≥ 55 | Correct | Jaune |
| ≥ 40 | Passable | Orange |
| < 40 | À éviter | Rouge |

---

## 3. Commentaires automatiques

### 3.1 Catégories de commentaires

Chaque commentaire a : `severity` (POSITIVE/WARNING/NEGATIVE/INFO), `category`, `text`.

### 3.2 Règles par catégorie

#### Coûts
| ID | Condition | Sévérité | Template |
|----|-----------|----------|----------|
| `cost-champion` | TER = min du groupe | POSITIVE | "{{name}} affiche le TER le plus bas du comparatif ({{ter_pct}}%), ce qui constitue un avantage structurel sur le long terme." |
| `cost-very-low` | TER ≤ 0.10% | POSITIVE | "Avec un TER de {{ter_pct}}%, les frais sont parmi les plus bas du marché pour cette classe d'actifs." |
| `cost-high` | TER > 0.40% | WARNING | "Le TER de {{ter_pct}}% est élevé. Sur un horizon de 10 ans et un capital de 100 000 €, cela représente environ {{cost_10y_eur}} € de frais cumulés." |
| `cost-highest` | TER = max du groupe | NEGATIVE | "{{name}} présente les frais les plus élevés du comparatif. L'écart de TER avec le moins cher est de {{ter_spread_pct}} points." |

#### Tracking
| ID | Condition | Sévérité | Template |
|----|-----------|----------|----------|
| `track-excellent` | TE ≤ 0.05% | POSITIVE | "Tracking error de {{te_pct}}% : la réplication de l'indice est excellente." |
| `track-poor` | TE > 0.50% | NEGATIVE | "Tracking error de {{te_pct}}% : écart significatif avec l'indice. La réplication pourrait ne pas refléter fidèlement la performance du sous-jacent." |
| `track-diff-neg` | TD < -0.20% | WARNING | "La tracking difference de {{td_pct}}% indique que l'ETF sous-performe son indice au-delà des frais affichés." |

#### Liquidité
| ID | Condition | Sévérité | Template |
|----|-----------|----------|----------|
| `liq-excellent` | AUM ≥ 1B€ | POSITIVE | "Avec {{aum_formatted}} d'encours, cet ETF offre une liquidité excellente et un spread réduit." |
| `liq-risk` | AUM < 50M€ | NEGATIVE | "Encours de seulement {{aum_formatted}}. Risque de spread élevé, de liquidité limitée, et de fermeture potentielle du fonds." |
| `liq-low-volume` | Volume < 10K/jour | WARNING | "Volume quotidien moyen de {{volume}} parts : la liquidité pourrait être insuffisante pour des ordres importants." |

#### Risque
| ID | Condition | Sévérité | Template |
|----|-----------|----------|----------|
| `risk-sharpe-good` | Sharpe ≥ 1.0 | POSITIVE | "Ratio de Sharpe de {{sharpe}} : le rendement ajusté du risque est favorable et supérieur à la moyenne de marché." |
| `risk-sharpe-poor` | Sharpe < 0.3 | NEGATIVE | "Ratio de Sharpe de {{sharpe}} : le rendement ne compense que faiblement le risque supporté." |
| `risk-drawdown` | MaxDD > -25% | WARNING | "Perte maximale historique de {{maxdd_pct}}% : à mettre en perspective avec le profil de risque du client." |
| `risk-vol-high` | Vol1y > 25% | WARNING | "Volatilité annualisée de {{vol_pct}}% : cet ETF présente des fluctuations marquées à court terme." |

#### Performance
| ID | Condition | Sévérité | Template |
|----|-----------|----------|----------|
| `perf-best-group` | return1y = max du groupe | POSITIVE | "{{name}} affiche la meilleure performance 1 an du comparatif ({{ret1y_pct}}%)." |
| `perf-vs-index-neg` | return1yVsIndex < -2% | WARNING | "Sous-performance de {{gap_pct}}% par rapport à l'indice sur 1 an, au-delà de l'impact des frais." |
| `perf-no-history` | return3y = null | INFO | "Historique de performance limité (< 3 ans). L'analyse à moyen terme n'est pas disponible." |

#### Structure
| ID | Condition | Sévérité | Template |
|----|-----------|----------|----------|
| `struct-synthetic` | réplication = SYNTHETIC | INFO | "Réplication synthétique via swap : vérifier le risque de contrepartie et la qualité du collatéral." |
| `struct-young` | Ancienneté < 2 ans | WARNING | "ETF récent (lancé il y a moins de 2 ans). L'historique est insuffisant pour une analyse complète." |
| `struct-pea` | peaEligible = true | POSITIVE | "Éligible au PEA : avantage fiscal significatif pour un investisseur résident fiscal français." |

### 3.3 Commentaire de synthèse comparatif

Généré automatiquement après le scoring de tous les ETF du groupe :

```
"Sur les {{n}} ETF comparés, {{best_name}} se distingue avec un score global de {{best_score}}/100,
porté par {{best_strengths}}. {{worst_name}} est en retrait ({{worst_score}}/100),
pénalisé par {{worst_weaknesses}}."
```

---

## 4. Écrans UX

### Écran 1 : Saisie des ETF à comparer

```
┌─────────────────────────────────────────────────────────────┐
│  Comparateur ETF                                            │
│  Comparez de 3 à 5 ETF et identifiez les meilleurs choix   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ETF 1    [________________] ISIN ou nom             │   │
│  │           ✓ iShares Core MSCI World (IE00B4L5Y983)   │   │
│  │           Enrichi : TER 0.20%, AUM 50.2B$, Phys.    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ETF 2    [________________] ISIN ou nom             │   │
│  │           ✓ Amundi MSCI World (LU1681043599)         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ETF 3    [________________] ISIN ou nom             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  [ + Ajouter un ETF (max 5) ]                               │
│                                                             │
│  [ Lancer la comparaison →  ]                               │
│                                                             │
│  ⚙ Pondérations : Coûts 25% | Perf 20% | Track 20%        │
│                    Risque 15% | Liquidité 10% | Mat 10%     │
│    [ Personnaliser les pondérations ]                       │
└─────────────────────────────────────────────────────────────┘
```

### Écran 2 : Résultat de la comparaison

```
┌─────────────────────────────────────────────────────────────┐
│  Résultats — 3 ETF comparés                                │
│                                                             │
│  ┌─── Classement ────────────────────────────────────────┐  │
│  │  🏆 1. iShares Core MSCI World    82/100  Bon        │  │
│  │     2. Vanguard FTSE All-World    76/100  Bon        │  │
│  │     3. Amundi MSCI World          68/100  Correct    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── Radar Chart ───────────────────────────────────────┐  │
│  │              Coûts                                    │  │
│  │         /          \                                  │  │
│  │    Maturité      Performance                         │  │
│  │         \          /                                  │  │
│  │    Liquidité --- Tracking                             │  │
│  │         \       /                                     │  │
│  │          Risque                                       │  │
│  │                                                       │  │
│  │  ── iShares  ── Vanguard  ── Amundi                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── Tableau comparatif ────────────────────────────────┐  │
│  │            │ iShares     │ Vanguard    │ Amundi       │  │
│  │────────────┼─────────────┼─────────────┼──────────────│  │
│  │ TER        │ 0.20% ★    │ 0.22%       │ 0.38%       │  │
│  │ AUM        │ 50.2B$     │ 12.8B$      │ 3.1B€       │  │
│  │ Track. Err │ 0.04%      │ 0.06%       │ 0.12%       │  │
│  │ Perf 1Y    │ +12.3%     │ +11.8%      │ +11.5%      │  │
│  │ Vol 1Y     │ 14.2%      │ 14.5%       │ 14.8%       │  │
│  │ Sharpe     │ 0.87       │ 0.81        │ 0.78        │  │
│  │ Réplica.   │ Physique   │ Physique    │ Synthétique  │  │
│  │ PEA        │ Non        │ Non         │ Oui ★       │  │
│  │ Score      │ 82 ██████  │ 76 █████    │ 68 ████     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ★ = meilleur du groupe pour ce critère                     │
└─────────────────────────────────────────────────────────────┘
```

### Écran 3 : Fiche détaillée d'un ETF (drill-down)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Retour au comparatif                                    │
│                                                             │
│  iShares Core MSCI World UCITS ETF — 82/100 Bon            │
│  IE00B4L5Y983 · IWDA · EUR · Physique · Capitalisant       │
│                                                             │
│  ┌─── Scores détaillés ──────────────────────────────────┐  │
│  │  Coûts        92/100  ████████████████████░░  │  │
│  │  Performance  78/100  ████████████████░░░░░░  │  │
│  │  Tracking     95/100  ██████████████████████  │  │
│  │  Risque       70/100  ██████████████░░░░░░░░  │  │
│  │  Liquidité    100/100 ██████████████████████  │  │
│  │  Maturité     85/100  █████████████████░░░░░  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── Commentaires automatiques ─────────────────────────┐  │
│  │  ✓ TER le plus bas du comparatif (0.20%)              │  │
│  │  ✓ Tracking error excellente (0.04%)                  │  │
│  │  ✓ Encours >50B$ : liquidité maximale                 │  │
│  │  ⓘ Non éligible PEA                                   │  │
│  │  ! Volatilité dans la moyenne du groupe               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─── Expositions ───────────────────────────────────────┐  │
│  │  [Pie chart secteurs]    [Pie chart géographies]      │  │
│  │  Tech 22% | Finance 15% | US 65% | JP 6% | UK 4%     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [ ✓ Retenir cet ETF pour le portefeuille ]                 │
└─────────────────────────────────────────────────────────────┘
```

### Écran 4 : Sélection et transmission au portefeuille

```
┌─────────────────────────────────────────────────────────────┐
│  ETF retenus pour le portefeuille                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ☑ iShares Core MSCI World   82/100   [ Retirer ]   │   │
│  │  ☑ Amundi MSCI World PEA     68/100   [ Retirer ]   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Justification automatique :                                │
│  "iShares sélectionné pour ses coûts et son tracking.       │
│   Amundi retenu pour l'éligibilité PEA."                    │
│                                                             │
│  [ ← Nouvelle comparaison ]  [ Transmettre au portefeuille →]│
└─────────────────────────────────────────────────────────────┘
```

### Flux de navigation

```
Saisie ISIN (3-5 ETF) → Comparaison (radar + tableau + classement)
                              ↓
                        Fiche détaillée (par ETF)
                              ↓
                        Sélection (retenir N ETF)
                              ↓
                        Transmission portefeuille
```

---

## 5. Enrichissement automatique

### 5.1 Stratégie

L'enrichissement fonctionne en 2 couches :
1. **Données de référence locales** : base de données locale pré-remplie avec les ETF les plus courants (top 200 ETF européens)
2. **Saisie manuelle assistée** : si l'ISIN n'est pas dans la base locale, formulaire pré-structuré avec guides contextuels

### 5.2 Service d'enrichissement

```
Input : ISIN
  → Chercher dans la base locale
  → Si trouvé : pré-remplir tous les champs
  → Si non trouvé : retourner un formulaire vide avec guides
  → L'utilisateur peut toujours corriger/compléter les données enrichies
```

Chaque champ enrichi est marqué `source: "ENRICHED"` dans `dataSources`.
Chaque champ modifié manuellement est marqué `source: "MANUAL"`.

---

*Fin de la spec ETF V1*
