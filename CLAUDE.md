# CLAUDE.md — Dashboard CRM Fondateur

---

## Aperçu de l'objectif du projet

Application interne de pilotage commercial (CRM) conçue exclusivement pour le Fondateur. Elle centralise les données issues d'un export CSV hebdomadaire pour permettre de :

- Piloter la santé financière via des KPIs (CA Sécurisé, Pipeline Brut, Pipeline Pondéré)
- Comparer la performance des commerciaux en volume et en valeur
- Analyser la rentabilité des secteurs clients (multi-tag explosé)
- Identifier les deals à relancer et maximiser les opportunités en cours

L'application est **locale uniquement** (Mac), sans déploiement serveur ni accès multi-utilisateurs. Un seul compte admin, pas d'API externe.

---

## Aperçu de l'architecture globale

```
crm-dashboard/          ← Projet Next.js 14 (App Router, TypeScript)
├── prisma/
│   ├── schema.prisma   ← Modèles : User, Deal, DealTag
│   └── crm.db          ← SQLite local (gitignore)
├── src/
│   ├── app/
│   │   ├── (auth)/login/       ← Page de connexion
│   │   ├── (dashboard)/        ← Pages protégées par middleware
│   │   │   ├── page.tsx        ← KPIs globaux
│   │   │   ├── commerciaux/    ← Performance par commercial
│   │   │   ├── secteurs/       ← Analyse sectorielle
│   │   │   └── import/         ← Upload CSV drag & drop
│   │   └── api/auth/[...nextauth]/
│   ├── actions/
│   │   └── import.ts           ← Server Action : truncate & load
│   ├── lib/
│   │   ├── db.ts               ← Singleton Prisma Client
│   │   ├── auth.ts             ← Config NextAuth (CredentialsProvider)
│   │   ├── csv.ts              ← Décodage latin-1, normalisation statuts
│   │   └── pipeline.ts         ← PIPELINE_WEIGHTS, computeKpis()
│   └── components/ui/          ← Composants shadcn/ui
├── middleware.ts               ← Protection routes dashboard
└── .env                        ← DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
```

**Stack :** Next.js 14 · TypeScript · Prisma 5 (SQLite) · NextAuth.js 4 · shadcn/ui · Tremor · Tailwind CSS 3 · Papa Parse · Sonner (toasts)

**Stratégie d'import :** Truncate & Load — chaque import efface `DealTag` puis `Deal` dans une transaction Prisma avant de réinsérer.

**Authentification :** JWT httpOnly cookie, bcrypt salt 12, compte admin seedé via `npx prisma db seed`.

---

## Style visuel

- Interface **claire et minimaliste**, fond blanc/gris clair
- **Pas de mode sombre** pour le MVP
- Sidebar fixe à gauche (fond `gray-900`), contenu principal sur fond `gray-50`
- Typographie sobre, pas d'emojis dans l'UI
- Composants shadcn/ui + Tremor pour les cartes KPI

---

## Contraintes et Politiques

- **NE JAMAIS exposer les clés API côté client** — `NEXTAUTH_SECRET`, `DATABASE_URL` et toute clé sensible restent exclusivement dans `.env` (serveur uniquement)
- Les Server Actions et les routes API sont les seuls points d'entrée vers la base de données
- Le fichier `.env` est gitignore — utiliser `.env.example` pour documenter les variables

---

## Dépendances

- **Préférer les composants existants** (shadcn/ui, Tremor, Tailwind) plutôt qu'ajouter de nouvelles bibliothèques UI
- Avant d'installer un nouveau package, vérifier si le besoin peut être couvert par les dépendances déjà présentes dans `package.json`

---

## Tests visuels (playwright-skill)

À la fin de chaque développement impliquant l'interface graphique :

1. Démarrer le serveur de développement (`npm run dev` dans `crm-dashboard/`)
2. Utiliser le skill **playwright-skill** pour tester l'interface :
   - L'interface doit être **responsive** (desktop, tablette, mobile)
   - Les fonctionnalités doivent être **fonctionnelles** (navigation, formulaires, redirections)
   - Le rendu doit **répondre au besoin développé** (vérifier visuellement les données affichées)

```bash
# Répertoire du skill
~/.claude/plugins/marketplaces/playwright-skill/skills/playwright-skill
```

---

## Context7

Utiliser **toujours Context7** pour :

- La génération de code utilisant une bibliothèque/framework (Next.js, Prisma, NextAuth, Tailwind, shadcn/ui, Tremor, Papa Parse, etc.)
- Les étapes de configuration ou d'installation
- La documentation d'une API ou bibliothèque

Cela signifie : résoudre automatiquement l'identifiant de bibliothèque via `mcp__context7__resolve-library-id` puis récupérer la documentation via `mcp__context7__query-docs` **sans attendre que l'utilisateur le demande explicitement**.

---

## Documentation

- **PRD (cahier des charges fonctionnel) :** [`PRD.md`](./PRD.md)
- **Architecture technique :** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## Langue des Spécifications

Toutes les spécifications doivent être rédigées en français, y compris les specs OpenSpec (sections **Purpose** et **Scenarios**). Seuls les titres de Requirements doivent rester en anglais avec les mots-clés `SHALL`/`MUST` pour la validation OpenSpec.
