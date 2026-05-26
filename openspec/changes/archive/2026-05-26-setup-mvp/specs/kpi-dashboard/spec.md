## ADDED Requirements

### Requirement: CA Sécurisé KPI card
The system SHALL display a KPI card showing the sum of `amount` for all deals with `status = 'gagné - en cours'`, formatted as a currency value in euros.

#### Scenario: Deals in "gagné - en cours" status exist
- **WHEN** the dashboard loads and deals with status `gagné - en cours` exist
- **THEN** the CA Sécurisé card displays their summed amount formatted in euros

#### Scenario: No secured deals
- **WHEN** no deals have status `gagné - en cours`
- **THEN** the CA Sécurisé card displays 0 €

### Requirement: Pipeline Brut KPI card
The system SHALL display a KPI card showing the sum of `amount` for all deals with `status IN ('prospect', 'qualifié', 'négociation')`.

#### Scenario: Open pipeline deals exist
- **WHEN** the dashboard loads and deals with open statuses exist
- **THEN** the Pipeline Brut card shows the total gross sum in euros

#### Scenario: No open deals
- **WHEN** no deals have an open status
- **THEN** the Pipeline Brut card displays 0 €

### Requirement: Pipeline Pondéré KPI card
The system SHALL display a KPI card showing the weighted pipeline sum, calculated as:
- `prospect` × 0.10
- `qualifié` × 0.35
- `négociation` × 0.70

Deals with status `à relancer` or `gagné - en cours` are excluded from this calculation.

#### Scenario: Mixed status pipeline
- **WHEN** deals exist across prospect, qualifié, and négociation statuses
- **THEN** the Pipeline Pondéré card shows the sum of (amount × weight) per status, formatted in euros

#### Scenario: Only "à relancer" deals exist
- **WHEN** all open deals have status `à relancer`
- **THEN** the Pipeline Pondéré card displays 0 € (excluded from weighted calculation)

### Requirement: Volume deals actifs metric
The system SHALL display the count of deals with `status IN ('prospect', 'qualifié', 'négociation')` as a numeric metric.

#### Scenario: Active deals exist
- **WHEN** deals with open statuses exist
- **THEN** the volume metric displays the correct count as an integer

#### Scenario: No active deals
- **WHEN** no deals have open statuses
- **THEN** the volume metric displays 0

### Requirement: Panier moyen metric
The system SHALL display the average `amount` across ALL deals (all statuses) as a currency value in euros.

#### Scenario: Multiple deals present
- **WHEN** the database contains deals
- **THEN** the panier moyen card displays `SUM(amount) / COUNT(*)` formatted in euros

#### Scenario: No deals in database
- **WHEN** the database has no deals
- **THEN** the panier moyen card displays 0 € without a division-by-zero error

### Requirement: Section "À relancer"
The system SHALL display a distinct section showing the total gross amount and count of deals with `status = 'à relancer'`. This section SHALL NOT include these deals in the Pipeline Brut or Pipeline Pondéré calculations.

#### Scenario: "À relancer" deals exist
- **WHEN** deals with status `à relancer` exist
- **THEN** the section displays their total gross amount (no weighting) and deal count

#### Scenario: No "à relancer" deals
- **WHEN** no deals have status `à relancer`
- **THEN** the section displays 0 € and 0 deals
