## ADDED Requirements

### Requirement: Top sectors by value table/chart
The system SHALL display a view at `/secteurs` listing each unique sector tag with its CA Sécurisé (deals `gagné - en cours`) and Pipeline total (deals `prospect` + `qualifié` + `négociation`), derived from the `DealTag` join table. A deal with multiple tags MUST be counted in each of its sectors independently.

#### Scenario: Deal with two tags counted in both sectors
- **WHEN** a deal tagged `SaaS|B2B` with amount 10 000 € exists
- **THEN** both the `SaaS` row and the `B2B` row include 10 000 € in their respective totals

#### Scenario: Sectors sorted by total value
- **WHEN** the sector view loads
- **THEN** sectors are sorted by (CA Sécurisé + Pipeline) descending

#### Scenario: No deals with tags
- **WHEN** no deals have associated tags
- **THEN** the sector view displays an empty state message

### Requirement: Sector CA Sécurisé column
The system SHALL compute, per sector tag, the sum of `amount` for deals linked to that tag with `status = 'gagné - en cours'`.

#### Scenario: Secured deals in a sector
- **WHEN** a sector has deals with status `gagné - en cours`
- **THEN** its CA Sécurisé column displays the sum formatted in euros

#### Scenario: No secured deals in a sector
- **WHEN** a sector has no deals with status `gagné - en cours`
- **THEN** its CA Sécurisé column displays 0 €

### Requirement: Sector Pipeline column
The system SHALL compute, per sector tag, the sum of `amount` for deals linked to that tag with `status IN ('prospect', 'qualifié', 'négociation')`.

#### Scenario: Pipeline deals in a sector
- **WHEN** a sector has deals in open statuses
- **THEN** its Pipeline column displays the gross sum formatted in euros

#### Scenario: Sector with only "à relancer" deals
- **WHEN** all deals in a sector have status `à relancer`
- **THEN** the sector's Pipeline column displays 0 € (excluded from pipeline calculation)
