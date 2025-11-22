# Data Schema Documentation

## Foundation Schema

### Overview
This document defines the data structure for foundations (Stiftungen) and their projects in the City Hero system.

### Foundation Model

#### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the foundation |
| `name` | string | Official name of the foundation |
| `short_description` | string | Brief description for hero section / card display |
| `long_description` | string | Detailed description of the foundation's work and goals |
| `legal_form` | string | Legal structure (e.g., "Stiftung", "Stadt", "Land", "Verein") |
| `gemeinnuetzige_zwecke` | array[string] | List of charitable purposes from statutes (Satzung) - one of 26 official purposes |
| `past_projects` | array[Project] | List of previously funded projects |
| `antragsprozess` | ApplicationProcess | Details about the application process |
| `foerderbereich` | GeographicArea | Geographic area of funding |
| `foerderhoehe` | FundingAmount | Funding amount details |
| `contact` | ContactInfo | Contact information |
| `logo_url` | string | URL to foundation logo |
| `website` | string | Foundation website URL |

#### Gemeinnützige Zwecke (Charitable Purposes)
Based on German tax law (§ 52 AO), the 26 official purposes include:
- Förderung der Jugendhilfe
- Förderung von Wissenschaft und Forschung
- Förderung von Bildung und Erziehung
- Förderung von Kunst und Kultur
- Förderung des bürgerschaftlichen Engagements
- Förderung des Umwelt- und Naturschutzes
- etc.

### Application Process (Antragsprozess)

#### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `deadline_type` | string | "fixed" or "rolling_basis" |
| `deadline_date` | string? | ISO date if fixed deadline |
| `rolling_info` | string? | Info about rolling applications |
| `required_documents` | array[RequiredDocument] | List of required application materials |
| `evaluation_process` | string | Description of evaluation process |
| `decision_timeline` | string | Expected timeline for decision (e.g., "4-6 Wochen") |

### Required Documents (Erwartete Inhalte des Antrags)

| Field | Type | Description |
|-------|------|-------------|
| `document_type` | string | Type of document (see below) |
| `description` | string | Description of requirements |
| `required` | boolean | Whether this document is mandatory |

**Document Types:**
- `projektplan` - Project plan
- `projektbeschreibung` - Project description
- `handelnde_personen` - People involved
- `erfahrung` - Experience/references
- `ziel` - Goals
- `zielgruppen` - Target groups
- `zweck_matching` - Purpose alignment
- `zeitplan` - Timeline
- `budgetplan` - Budget plan
- `kalkulation` - Cost calculation (Honorar-/Personal- und Sachkosten)
- `evaluation` - Evaluation plan

### Geographic Area (Förderbereich)

| Field | Type | Description |
|-------|------|-------------|
| `scope` | string | "local", "regional", "national", "international" |
| `specific_areas` | array[string] | Specific cities, regions, or countries |
| `restrictions` | string? | Any geographic restrictions |

### Funding Amount (Förderhöhe)

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | "small" (< 5.000€), "medium" (5.000€-50.000€), "large" (> 50.000€) |
| `min_amount` | number | Minimum funding amount in euros |
| `max_amount` | number | Maximum funding amount in euros |
| `average_amount` | number? | Average funding amount |
| `total_budget` | number? | Total annual budget for grants |

### Contact Info

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | Contact email |
| `phone` | string? | Contact phone number |
| `address` | string? | Physical address |
| `contact_person` | string? | Name of contact person |

---

## Project Schema

### Overview
Projects represent past funded initiatives by foundations.

### Project Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Project name |
| `description` | string | Detailed project description |
| `image_url` | string? | URL to project image |
| `foundation_id` | string | ID of funding foundation |
| `funded_amount` | number | Amount funded in euros |
| `duration` | ProjectDuration | Project duration details |
| `status` | string | "completed", "ongoing", "planned" |
| `outcomes` | string? | Project outcomes/results |
| `website_url` | string? | Project website if available |

### Project Duration

| Field | Type | Description |
|-------|------|-------------|
| `start_date` | string | ISO date |
| `end_date` | string? | ISO date (null if ongoing) |
| `duration_months` | number | Duration in months |

---

## JSON Format Examples

### Foundation Example

```json
{
  "id": "stiftung-001",
  "name": "Bürgerstiftung München",
  "short_description": "Unterstützt lokale Projekte zur Förderung von Kindern und Jugendlichen in München.",
  "long_description": "Die Bürgerstiftung München wurde 2000 gegründet und fördert lokale Projekte im Bereich Kinder- und Jugendhilfe. Besonderer Fokus liegt auf Bildung, Integration und der Stärkung des sozialen Zusammenhalts in München. Mit über 20 Jahren Erfahrung haben wir mehr als 500 Projekte unterstützt.",
  "legal_form": "Stiftung",
  "gemeinnuetzige_zwecke": [
    "Förderung der Jugendhilfe",
    "Förderung von Bildung und Erziehung",
    "Förderung des bürgerschaftlichen Engagements"
  ],
  "past_projects": [
    {
      "id": "projekt-001",
      "name": "Lernpaten München",
      "description": "Mentoring-Programm für Grundschüler mit Migrationshintergrund",
      "image_url": "https://example.com/images/lernpaten.jpg",
      "foundation_id": "stiftung-001",
      "funded_amount": 15000,
      "duration": {
        "start_date": "2022-09-01",
        "end_date": "2023-08-31",
        "duration_months": 12
      },
      "status": "completed",
      "outcomes": "50 Kinder erfolgreich betreut, Notendurchschnitt um 1,2 verbessert",
      "website_url": null
    }
  ],
  "antragsprozess": {
    "deadline_type": "rolling_basis",
    "deadline_date": null,
    "rolling_info": "Anträge können jederzeit eingereicht werden. Bearbeitung erfolgt quartalsweise.",
    "required_documents": [
      {
        "document_type": "projektbeschreibung",
        "description": "Detaillierte Beschreibung des Projekts (max. 5 Seiten)",
        "required": true
      },
      {
        "document_type": "budgetplan",
        "description": "Aufgeschlüsselte Kalkulation mit Personal- und Sachkosten",
        "required": true
      },
      {
        "document_type": "zeitplan",
        "description": "Meilensteine und Zeitplan des Projekts",
        "required": true
      },
      {
        "document_type": "handelnde_personen",
        "description": "CVs der Projektverantwortlichen",
        "required": true
      },
      {
        "document_type": "evaluation",
        "description": "Plan zur Erfolgsmessung des Projekts",
        "required": false
      }
    ],
    "evaluation_process": "Der Stiftungsvorstand prüft die Anträge quartalsweise. Externe Gutachter werden bei Bedarf hinzugezogen.",
    "decision_timeline": "4-6 Wochen nach Einreichungsfrist"
  },
  "foerderbereich": {
    "scope": "local",
    "specific_areas": ["München", "Landkreis München"],
    "restrictions": "Nur Projekte mit direktem München-Bezug werden gefördert"
  },
  "foerderhoehe": {
    "category": "medium",
    "min_amount": 5000,
    "max_amount": 50000,
    "average_amount": 25000,
    "total_budget": 500000
  },
  "contact": {
    "email": "info@buergerstiftung-muenchen.de",
    "phone": "+49 89 12345678",
    "address": "Musterstraße 123, 80333 München",
    "contact_person": "Dr. Maria Schmidt"
  },
  "logo_url": "https://example.com/logos/buergerstiftung.svg",
  "website": "https://www.buergerstiftung-muenchen.de"
}
```

### Simplified Project Example

```json
{
  "id": "projekt-002",
  "name": "Nachhaltigkeits-Workshop für Jugendliche",
  "description": "Ein interaktiver Workshop für 14-18-jährige zum Thema Klimaschutz und Nachhaltigkeit im Alltag. Teilnehmer lernen praktische Maßnahmen kennen und entwickeln eigene Projekte.",
  "image_url": "https://example.com/images/workshop.jpg",
  "foundation_id": "stiftung-001",
  "funded_amount": 8500,
  "duration": {
    "start_date": "2023-03-01",
    "end_date": "2023-11-30",
    "duration_months": 9
  },
  "status": "completed",
  "outcomes": "120 Teilnehmer, 15 eigene Nachhaltigkeitsprojekte gestartet",
  "website_url": "https://nachhaltigkeitsworkshop.de"
}
```

---

## Matching Algorithm Considerations

### Key Fields for Matching

When matching user project ideas to foundations, consider:

1. **Gemeinnützige Zwecke** - Does the project align with foundation purposes?
2. **Förderbereich** - Is the project in the right geographic area?
3. **Förderhöhe** - Does the requested amount fit the foundation's range?
4. **Required Documents** - Can the applicant provide necessary documentation?
5. **Deadline Type** - Fixed vs. rolling basis affects urgency
6. **Past Projects** - Similar past projects indicate good fit

### Match Score Components

```json
{
  "match_score": 0.85,
  "components": {
    "purpose_match": 0.9,
    "geographic_match": 1.0,
    "funding_amount_match": 0.7,
    "documentation_readiness": 0.8
  },
  "fits": [
    "Fördert lokale Projekte",
    "Unterstützt Jugendinitiativen",
    "Passende Förderhöhe"
  ],
  "mismatches": [
    "Keine Personalkosten förderbar"
  ],
  "questions": [
    "Kofinanzierung nötig?",
    "Projektlaufzeit flexibel?"
  ]
}
```

---

## Implementation Notes

### Database Considerations

- **Indexes**: Create indexes on `gemeinnuetzige_zwecke`, `foerderbereich.scope`, and `foerderhoehe.category` for fast matching
- **Full-text search**: Enable on `name`, `short_description`, and `long_description`
- **Relationships**: Foundation ↔ Projects (one-to-many)

### API Endpoints to Implement

```
GET    /api/v1/foundations              # List all foundations
GET    /api/v1/foundations/:id          # Get foundation details
POST   /api/v1/foundations/search       # Search with filters
POST   /api/v1/foundations/match        # Match project to foundations
GET    /api/v1/projects                 # List projects
GET    /api/v1/projects/:id             # Get project details
```

### Validation Rules

- `gemeinnuetzige_zwecke` must be from official list of 26 purposes
- `funding_amount.min` must be less than `funding_amount.max`
- `deadline_date` required if `deadline_type` is "fixed"
- Email format validation for contact info
- URLs must be valid HTTP/HTTPS

