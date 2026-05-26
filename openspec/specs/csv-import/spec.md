## ADDED Requirements

### Requirement: Drag-and-drop CSV upload UI
The system SHALL provide an import page at `/import` with a drag-and-drop zone that accepts `.csv` files. The user SHALL also be able to click the zone to open a file picker.

#### Scenario: File dropped on zone
- **WHEN** the user drops a `.csv` file onto the upload zone
- **THEN** the file is accepted and the import process begins automatically

#### Scenario: Non-CSV file dropped
- **WHEN** the user drops a file that is not `.csv`
- **THEN** the system displays an error message and does NOT proceed with import

#### Scenario: File picker selection
- **WHEN** the user clicks the upload zone and selects a `.csv` file via the file picker
- **THEN** the import process begins automatically

### Requirement: Encoding correction (latin-1 → UTF-8)
The system SHALL read the CSV file as an `ArrayBuffer` in the browser and convert it from latin-1 (ISO-8859-1) to UTF-8 using `iconv-lite` before parsing. This corrects characters such as `gagnÃ© - en cours` → `gagné - en cours`.

#### Scenario: Correctly encoded CSV
- **WHEN** a CSV file with latin-1 encoded French accents is imported
- **THEN** all accented characters are correctly decoded and stored in the database

#### Scenario: Already UTF-8 CSV
- **WHEN** a CSV file already encoded in UTF-8 is imported
- **THEN** characters are stored correctly with no double-encoding

### Requirement: CSV parsing with Papa Parse
The system SHALL parse the decoded CSV string using Papa Parse with `;` as the delimiter and `header: true` to produce an array of objects keyed by column name.

#### Scenario: Valid CSV parsed
- **WHEN** a valid semicolon-delimited CSV with headers is parsed
- **THEN** each row is converted to a plain JS object with column names as keys

#### Scenario: Empty CSV file
- **WHEN** an empty CSV file (0 data rows) is uploaded
- **THEN** the import server action receives an empty array and the database is left with 0 Deal records after truncation

### Requirement: Truncate-and-load server action
The system SHALL execute import via a Next.js Server Action (`src/actions/import.ts`) that, within a single Prisma transaction: (1) deletes all `DealTag` rows, (2) deletes all `Deal` rows, (3) inserts all new `Deal` and `DealTag` rows. On success the user is redirected to the dashboard with a success toast.

#### Scenario: Successful import
- **WHEN** a valid parsed CSV array is passed to the import server action
- **THEN** all existing Deal and DealTag records are deleted, new records are inserted, and the user is redirected to `/` with a success notification

#### Scenario: Import transaction failure
- **WHEN** an error occurs during the database transaction
- **THEN** the transaction is rolled back, no data is modified, and the user sees an error message on the import page

#### Scenario: Status normalisation during import
- **WHEN** a deal row has a status value with trailing spaces or mixed casing (e.g., `Prospect `, `QUALIFIÉ`)
- **THEN** the stored status is trimmed and lowercased to match the normalised values (`prospect`, `qualifié`, etc.)

### Requirement: Multi-tag explosion during import
The system SHALL parse the `tagsRaw` field (e.g., `SaaS|B2B`) by splitting on `|` and create one `DealTag` row per tag per deal.

#### Scenario: Deal with multiple tags
- **WHEN** a deal row has `tagsRaw = "SaaS|B2B"`
- **THEN** two `DealTag` records are created, one with `tag = "SaaS"` and one with `tag = "B2B"`, both linked to the same `Deal`

#### Scenario: Deal with single tag
- **WHEN** a deal row has `tagsRaw = "Énergie"`
- **THEN** exactly one `DealTag` record is created with `tag = "Énergie"`

#### Scenario: Deal with empty tags field
- **WHEN** a deal row has an empty or null `tagsRaw` field
- **THEN** no `DealTag` records are created for that deal and no error is thrown
