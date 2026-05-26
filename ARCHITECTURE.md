# Architecture Technique — Dashboard CRM Fondateur

> Document de référence pour les choix d'implémentation. À maintenir en parallèle du PRD.

---

## Stack Retenu

| Couche | Technologie | Version cible |
|---|---|---|
| Framework full-stack | Next.js (App Router) | 14+ |
| Langage | TypeScript | 5+ |
| Base de données | SQLite | via Prisma (usage local Mac uniquement) |
| ORM | Prisma | 5+ |
| Authentification | NextAuth.js (credentials) | 4+ |
| UI Components | shadcn/ui + Tremor | latest |
| Styling | Tailwind CSS | 3+ |
| Charts | Recharts (via Tremor) | latest |
| CSV Parsing | Papa Parse | 5+ |
| Correction d'encodage | iconv-lite | latest |
| PDF Export (V2) | jsPDF + html2canvas | latest |

---

## Structure des Répertoires

```
crm-dashboard/
├── prisma/
│   ├── schema.prisma          # Modèles de données
│   └── crm.db                 # Fichier SQLite (gitignore)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx   # Écran de connexion
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Garde d'auth + nav commune
│   │   │   ├── page.tsx       # Vue KPIs globaux
│   │   │   ├── commerciaux/
│   │   │   │   └── page.tsx   # Vue performance commerciaux
│   │   │   ├── secteurs/
│   │   │   │   └── page.tsx   # Vue analyse sectorielle
│   │   │   └── import/
│   │   │       └── page.tsx   # Upload CSV drag & drop
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   ├── actions/
│   │   └── import.ts          # Server Action : import CSV
│   ├── components/
│   │   ├── ui/                # Composants shadcn/ui (auto-générés)
│   │   ├── kpi-cards/         # Cards KPIs financiers
│   │   ├── charts/            # Wrappers Recharts/Tremor
│   │   └── tables/            # Tableaux commerciaux / secteurs
│   └── lib/
│       ├── db.ts              # Singleton Prisma Client
│       ├── csv.ts             # Parsing + nettoyage encodage
│       ├── pipeline.ts        # Calcul pipeline pondéré
│       └── auth.ts            # Config NextAuth
├── .env                       # DATABASE_URL, NEXTAUTH_SECRET
└── .env.example               # Template sans secrets
```

---

## Schéma de Base de Données

```prisma
// prisma/schema.prisma

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Deal {
  id          String     @id @default(cuid())
  name        String
  status      String
  dateCreated DateTime?
  dueDate     DateTime?
  startDate   DateTime?
  assignee    String
  priority    String
  tagsRaw     String     // Valeur brute "SaaS|B2B" conservée
  content     String?
  amount      Float
  importedAt  DateTime   @default(now())

  tags        DealTag[]
}

model DealTag {
  id     String @id @default(cuid())
  dealId String
  tag    String

  deal   Deal   @relation(fields: [dealId], references: [id], onDelete: Cascade)

  @@index([tag])
  @@index([dealId])
}
```

**Règle de séparation des modèles :**
- `User` : jamais tronqué (persistant).
- `Deal` + `DealTag` : tronqués et rechargés à chaque import CSV.

---

## Flux d'Import CSV (Truncate & Load)

```
Utilisateur dépose le fichier CSV
         │
         ▼
[Client] Papa Parse
  - Délimiteur : ";"
  - Encodage   : lecture en ArrayBuffer, conversion via iconv-lite (latin-1 → UTF-8)
  - Résultat   : tableau d'objets JSON
         │
         ▼
[Server Action] src/actions/import.ts
  1. BEGIN TRANSACTION
  2. DELETE FROM DealTag
  3. DELETE FROM Deal
  4. Pour chaque ligne :
     a. Nettoyage des statuts (trim, lowercase pour normalisation)
     b. Parse des tags : split("|") → N lignes DealTag
     c. INSERT Deal
     d. INSERT DealTag × N
  5. COMMIT
         │
         ▼
Redirection vers dashboard avec toast de confirmation
```

---

## Mapping des Statuts CSV → Statuts Normalisés

Le fichier source contient des valeurs mal encodées. La normalisation se fait **après** conversion iconv-lite :

| Valeur brute (après décodage) | Statut normalisé stocké |
|---|---|
| `prospect` | `prospect` |
| `qualifié` | `qualifié` |
| `négociation` | `négociation` |
| `gagné - en cours` | `gagné - en cours` |
| `à relancer` | `à relancer` |

---

## Algorithme Pipeline Pondéré

Défini dans `src/lib/pipeline.ts` :

```typescript
export const PIPELINE_WEIGHTS: Record<string, number> = {
  'prospect':         0.10,
  'qualifié':         0.35,
  'négociation':      0.70,
  'gagné - en cours': 1.00,
  // "à relancer" : exclus du pipeline pondéré et du pipeline brut
  // Affiché dans une section dédiée avec montant brut uniquement
};
```

---

## Calcul des KPIs (logique SQL via Prisma)

| KPI | Logique |
|---|---|
| CA Sécurisé | `SUM(amount) WHERE status = 'gagné - en cours'` |
| Pipeline Brut | `SUM(amount) WHERE status IN ('prospect', 'qualifié', 'négociation')` |
| Pipeline Pondéré | `SUM(amount × weight)` par statut, sur les 3 statuts ouverts |
| Section "À relancer" | `SUM(amount) + COUNT(*) WHERE status = 'à relancer'` (montant brut, pas de pondération) |
| Volume deals actifs | `COUNT(*) WHERE status IN ('prospect', 'qualifié', 'négociation')` |
| Panier moyen | `AVG(amount)` sur tous les deals |

Les agrégations sectorielles se font via `DealTag` (JOIN + GROUP BY tag).
Les deals `à relancer` sont inclus dans les vues commerciaux et secteurs (montant brut), mais exclus des KPIs financiers du pipeline.

---

## Authentification

- **Stratégie** : NextAuth.js avec `CredentialsProvider`.
- **Stockage** : `password_hash` en bcrypt (salt rounds : 12) dans la table `User`.
- **Session** : JWT côté serveur (httpOnly cookie).
- **Protection des routes** : middleware Next.js sur `/` et toutes les routes `(dashboard)`.
- **MVP** : 1 compte admin créé via script seed Prisma (`prisma/seed.ts`). Pas d'interface de changement de mot de passe avant la V1.

---

## Variables d'Environnement

```bash
# .env.example
DATABASE_URL="file:./crm.db"
NEXTAUTH_SECRET="<générer avec openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Roadmap Technique par Étape

| Étape PRD | Actions techniques |
|---|---|
| **MVP** | Setup Next.js + Prisma + NextAuth. Import CSV. KPIs. Vues commerciaux et secteurs de base. |
| **V1** | Ajout taux de transformation, panier moyen/commercial, taux de succès/secteur. Page "Mon Profil" + changement de mot de passe. |
| **V2** | Section alertes deals prioritaires. Matrice Volume/Valeur (Recharts ScatterChart). Simulateur Revenue Target. Export PDF (jsPDF). |
| **V3** | Formulaire "Nouveau Prospect". Arrêt logique truncate & load → gestion persistante. Architecture import CSV "merge" plutôt que "replace". |

