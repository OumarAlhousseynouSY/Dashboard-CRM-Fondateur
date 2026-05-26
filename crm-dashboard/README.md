# CRM Dashboard — Fondateur

Application interne de pilotage commercial. Centralise les données d'un export CSV hebdomadaire pour suivre le pipeline, la performance des commerciaux et la rentabilité sectorielle.

**Usage local uniquement — Mac, un seul compte admin.**

---

## Fonctionnalités

- **KPIs globaux** — CA Sécurisé, Pipeline Brut, Pipeline Pondéré, Deals Actifs, Panier Moyen, Deals à Relancer
- **Performance commerciaux** — classement par valeur brute avec parts relatives
- **Analyse sectorielle** — répartition CA sécurisé / pipeline par tag client (multi-tag explosé)
- **Import CSV** — drag & drop, encodage UTF-8 et Latin-1 supportés, truncate & reload

---

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Base de données | SQLite via Prisma 5 |
| Auth | NextAuth.js 4 — JWT httpOnly, bcrypt |
| UI | shadcn/ui · Tailwind CSS 3 |
| Typographie | Syne · DM Mono · DM Sans (Google Fonts) |
| Parse CSV | Papa Parse |
| Toasts | Sonner |

---

## Installation

### Prérequis

- Node.js 18+
- npm

### 1. Cloner et installer

```bash
git clone https://github.com/OumarAlhousseynouSY/Dashboard-CRM-Fondateur.git
cd Dashboard-CRM-Fondateur/crm-dashboard
npm install
```

### 2. Variables d'environnement

Copier le fichier d'exemple et renseigner les valeurs :

```bash
cp .env.example .env
```

Contenu de `.env` :

```env
DATABASE_URL="file:./crm.db"
NEXTAUTH_SECRET="une-clé-secrète-longue-et-aléatoire"
NEXTAUTH_URL="http://localhost:3000"
```

Pour générer `NEXTAUTH_SECRET` :

```bash
openssl rand -base64 32
```

### 3. Base de données

```bash
# Créer la base et appliquer les migrations
npx prisma migrate deploy

# Créer le compte admin (email : admin@crm.local, mot de passe : admin123)
npx prisma db seed
```

> Pour changer les identifiants admin, définir `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `.env` avant le seed.

### 4. Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Import CSV

### Format attendu

- Délimiteur : `;`
- Encodage : UTF-8 ou Latin-1 (détection automatique)
- En-têtes obligatoires :

| Colonne | Description |
|---|---|
| `Task Name` | Nom du deal |
| `Status` | Statut (voir valeurs ci-dessous) |
| `Assignees` | Nom du commercial |
| `Tags` | Secteurs séparés par `\|` |
| `Montant Deal` | Montant en euros (virgule ou point) |
| `Date Created` | Date de création |
| `Due Date` | Date d'échéance |
| `Priority` | Priorité |
| `Task Content` | Notes (optionnel) |

### Statuts reconnus

| Valeur CSV | Rôle dans les KPIs |
|---|---|
| `prospect` | Pipeline Brut (pondération 10 %) |
| `qualifié` | Pipeline Brut (pondération 35 %) |
| `négociation` | Pipeline Brut (pondération 70 %) |
| `gagné - en cours` | CA Sécurisé |
| `à relancer` | Bloc "À Relancer" |

> **Attention** : chaque import efface et remplace toutes les données existantes (truncate & reload).

---

## Structure du projet

```
crm-dashboard/
├── prisma/
│   ├── schema.prisma        # Modèles : User, Deal, DealTag
│   ├── migrations/          # Migrations SQL
│   └── seed.ts              # Création du compte admin
├── src/
│   ├── app/
│   │   ├── (auth)/login/    # Page de connexion
│   │   ├── (dashboard)/     # Pages protégées
│   │   │   ├── page.tsx     # KPIs globaux
│   │   │   ├── commerciaux/ # Performance par commercial
│   │   │   ├── secteurs/    # Analyse sectorielle
│   │   │   └── import/      # Upload CSV
│   │   └── api/auth/        # Route NextAuth
│   ├── actions/
│   │   └── import.ts        # Server Action : truncate & load
│   ├── components/
│   │   ├── sidebar.tsx      # Navigation (responsive, mobile hamburger)
│   │   └── ui/              # Composants shadcn/ui
│   └── lib/
│       ├── auth.ts          # Configuration NextAuth
│       ├── csv.ts           # Décodage buffer, normalisation statuts
│       ├── db.ts            # Singleton Prisma Client
│       └── pipeline.ts      # Poids pipeline, calcul KPIs, formatEur
└── middleware.ts            # Protection des routes dashboard
```

---

## Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build
npm start

# Prisma Studio (explorer la base)
npx prisma studio

# Réinitialiser la base
npx prisma migrate reset
```

---

## Sécurité

- `.env` et `*.db` sont dans `.gitignore` — ne jamais les committer
- Les clés sensibles ne sont jamais exposées côté client
- Toutes les lectures/écritures en base passent par des Server Actions ou des routes API
