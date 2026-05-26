## ADDED Requirements

### Requirement: Commerciaux performance table
The system SHALL display a table at `/commerciaux` listing each unique `assignee` (salesperson) with their deal volume (count) and gross portfolio value (sum of amount), across all deal statuses except `à relancer` being handled separately.

#### Scenario: Multiple salespeople with deals
- **WHEN** the database contains deals assigned to multiple salespeople
- **THEN** the table shows one row per assignee with their deal count and summed amount, sorted by gross value descending

#### Scenario: Single salesperson
- **WHEN** all deals are assigned to one salesperson
- **THEN** the table shows a single row with that salesperson's totals

#### Scenario: No deals in database
- **WHEN** the database has no deals
- **THEN** the table displays an empty state message

### Requirement: Per-salesperson deal count
The system SHALL show the number of deals (`COUNT(*)`) assigned to each salesperson, regardless of status.

#### Scenario: Count includes all statuses
- **WHEN** a salesperson has deals across multiple statuses
- **THEN** their deal count reflects all deals (prospect + qualifié + négociation + gagné + à relancer)

### Requirement: Per-salesperson gross portfolio value
The system SHALL show the sum of `amount` for all deals assigned to each salesperson, regardless of status.

#### Scenario: Gross value computed
- **WHEN** a salesperson has deals with various amounts
- **THEN** their gross value column displays the sum formatted in euros
