# Spécifications Fonctionnelles & Roadmap - Dashboard CRM Fondateur

Ce document sert de cahier des charges fonctionnel pour le développement d'une application interne de suivi commercial (CRM) et de pilotage business, spécifiquement conçue pour le Fondateur de l'entreprise.

---

## 🎯 Vision Globale & Objectifs Métier
L'application a pour but de centraliser les données commerciales afin de permettre au fondateur de :
1. **Piloter la santé financière** globale de l'entreprise via des indicateurs clés (KPIs).
2. **Comparer la performance des commerciaux** en volume et en valeur.
3. **Analyser la rentabilité des secteurs clients** pour orienter la stratégie marketing et produit.
4. **Maximiser simultanément le volume et la valeur des deals** en cours.

---

## 🛠️ Règles Métier & Logique de Données

### 1. Cycle de vie des données (MVP à V2) : Mode "Truncate & Load"
* À chaque nouvel import du fichier CSV d'export CRM, la base de données SQL existante est entièrement vidée (*clairée*) et remplacée par les nouvelles lignes. 
* Avantage : Aucun risque de doublon.
* Contrainte acceptée : Pas d'historisation automatique en base de données d'un mois sur l'autre (gérée manuellement via export dans la V2).

### 2. Algorithme de Calcul du Pipeline Pondéré
Pour refléter fidèlement la trésorerie prévisionnelle, chaque deal au statut "ouvert" se voit attribuer une probabilité de succès automatique selon son étape :
* **Prospect :** 10% de probabilité
* **Qualifié :** 35% de probabilité
* **Négociation :** 70% de probabilité
* **Gagné - en cours :** 100% de probabilité

### 3. Parsing du Multi-Tag (Secteurs)
Les données sources contiennent des tags cumulés séparés par des barres verticales (ex: `SaaS|B2B` ou `Énergie|Renouvelable`). 
* **Règle technique :** L'application doit obligatoirement "exploser" (parser) cette chaîne de caractères lors de l'intégration pour comptabiliser le montant du deal dans chacun des secteurs indépendamment.

### 4. Nettoyage de l'encodage
Le système doit nettoyer automatiquement à la volée les caractères mal encodés lors de l'import du fichier CSV (ex: convertir `gagnÃ© - en cours` en `Gagné - en cours`).

---

## 🗺️ Feuille de Route du Développement (Roadmap)

### 🚀 ÉTAPE 1 : Le MVP (Minimum Viable Product)
*Objectif : Un outil sécurisé, fonctionnel "Day 1", apportant une première couche d'intelligence financière et sectorielle.*

* **Sécurité & Accès :**
  * Écran de Login/Mot de passe simple (Utilisateur unique "Administrateur Fondateur").
  * Pas d'interface de modification de mot de passe à ce stade (identifiants sécurisés en base de données).
* **Traitement de la donnée :**
  * Module d'import de fichier CSV par glisser-déposer.
  * Script d'effacement automatique de l'ancienne table SQL et insertion des nouvelles données nettoyées.
* **Dashboard - KPIs Financiers globaux :**
  * **Chiffre d'Affaires Sécurisé :** Somme des montants des deals au statut `Gagné - en cours`.
  * **Pipeline Brut :** Somme globale de tous les deals ouverts (`Prospect` + `Qualifié` + `Négociation`).
  * **Pipeline Pondéré (Issu de la V1) :** Somme des montants ajustés selon les coefficients de probabilité (10%, 35%, 70%).
  * **Métriques de volume :** Volume total de deals actifs et Panier moyen global.
* **Dashboard - Vue Commerciaux de base :**
  * Volume de deals affectés par commercial (`Assignees`).
  * Valeur brute totale du portefeuille par commercial.
* **Dashboard - Vue Secteurs de base (Issu de la V1) :**
  * Intégration du parseur de tags.
  * Graphique ou tableau du Top Secteurs en valeur (CA sécurisé + Pipeline).

---

### 📈 ÉTAPE 2 : LA V1 (L'Analyse de Performance)
*Objectif : Évaluer finement l'efficacité de l'équipe commerciale et identifier les secteurs les plus simples à clore.*

* **Dashboard - Vue Commerciaux enrichie :**
  * **Taux de Transformation :** Ratio entre les deals passés en "Gagné" et le nombre total de dossiers gérés.
  * **Panier Moyen par Commercial :** Permet d'identifier qui signe les contrats à plus forte valeur.
* **Dashboard - Vue Secteurs enrichie :**
  * **Taux de Succès par Secteur :** Pourcentage de réussite au sein de chaque tag sectoriel (pour savoir où orienter les efforts marketing).
* **Sécurité :**
  * Ajout d'une page "Mon Profil" permettant au fondateur de modifier son mot de passe de session de manière autonome.

---

### 🧠 ÉTAPE 3 : LA V2 (Le Pilotage Proactif & Stratégie)
*Objectif : Anticiper les risques de pertes et maximiser les opportunités opérationnelles.*

* **Le Focus Alertes (Opérationnel) :** Section isolant automatiquement en haut du tableau de bord les deals à priorité haute (`Priority: High`) dont la date d'échéance (`Due Date`) est dépassée mais le statut n'est pas "Gagné".
* **Matrice "Volume vs Valeur" (Management) :** Graphique visuel à 4 quadrants cartographiant les commerciaux et secteurs (Stratégie de volume vs Stratégie Grands Comptes).
* **Simulateur de "Revenue Target" (Planification) :** Outil de simulation où le fondateur entre un objectif de CA chiffré, et l'application calcule le nombre théorique de prospects à faire entrer dans le pipe (basé sur le taux de conversion actuel).
* **Sauvegarde Flash (Mémoire) :** Bouton "Exporter le rapport en PDF" pour télécharger instantanément une photo du dashboard avant de l'écraser lors du prochain import.

---

### ⚡ ÉTAPE 4 : LA V3 (Le CRM Autonome "Zéro CSV")
*Objectif : Passer d'un outil de lecture passive à un outil de saisie active autonome.*

* **Formulaire de saisie "Nouveau Prospect" :**
  * Interface graphique permettant d'ajouter manuellement une opportunité sans passer par un CSV.
  * Champs requis : Nom du prospect, Statut initial, Commercial assigné, Priorité, Montant estimé, Tags sectoriels, Commentaire/Contenu.
* **Évolution de l'architecture de données :**
  * Arrêt de la logique d'écrasement systématique par CSV.
  * Transition vers une gestion 100% persistante en Base de données SQL (les saisies manuelles et les imports se cumulent de manière intelligente).

---

## ❌ Hors-Périmètre (Exclu définitivement)
Pour garantir la rapidité de développement et le focus de l'application, les fonctionnalités suivantes ne seront pas implémentées :
* **Aucun module de paiement ni de facturation** (Pas de Stripe, pas d'abonnements : usage 100% interne).
* **Pas d'accès multi-utilisateurs complexes** (Pas de rôles "Commerciaux" individuels, le fondateur est le seul utilisateur et possède une vue globale).
* **Pas de synchronisation directe par API tierces** dans les premières versions (Pas de connexion directe en temps réel avec Hubspot, Pipedrive, Salesforce, etc.).