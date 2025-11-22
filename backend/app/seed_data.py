"""
Seed database with mock foundation data.
Run with: python -m app.seed_data
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

# Mock data based on DATA_SCHEMA.md
MOCK_FOUNDATIONS = [
    {
        "_id": "stiftung-001",
        "name": "Bürgerstiftung München",
        "short_description": "Unterstützt lokale Projekte zur Förderung von Kindern und Jugendlichen in München.",
        "long_description": "Die Bürgerstiftung München wurde 2000 gegründet und fördert lokale Projekte im Bereich Kinder- und Jugendhilfe. Besonderer Fokus liegt auf Bildung, Integration und der Stärkung des sozialen Zusammenhalts in München.",
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
                "image_url": "/hero-avatar.svg",
                "foundation_id": "stiftung-001",
                "funded_amount": 15000,
                "duration": {
                    "start_date": "2022-09-01",
                    "end_date": "2023-08-31",
                    "duration_months": 12
                },
                "status": "completed",
                "outcomes": "50 Kinder erfolgreich betreut",
                "website_url": None
            }
        ],
        "antragsprozess": {
            "deadline_type": "rolling_basis",
            "deadline_date": None,
            "rolling_info": "Anträge können jederzeit eingereicht werden. Bearbeitung erfolgt quartalsweise.",
            "required_documents": [
                {
                    "document_type": "projektbeschreibung",
                    "description": "Detaillierte Beschreibung des Projekts",
                    "required": True
                },
                {
                    "document_type": "budgetplan",
                    "description": "Aufgeschlüsselte Kalkulation",
                    "required": True
                }
            ],
            "evaluation_process": "Quartalsweise Prüfung durch Vorstand",
            "decision_timeline": "4-6 Wochen"
        },
        "foerderbereich": {
            "scope": "local",
            "specific_areas": ["München"],
            "restrictions": "Nur Projekte mit München-Bezug"
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
        "logo_url": "/hero-avatar.svg",
        "website": "https://www.buergerstiftung-muenchen.de"
    },
    {
        "_id": "stiftung-002",
        "name": "BMW Foundation",
        "short_description": "Internationale Stiftung für soziale Innovation und nachhaltige Entwicklung.",
        "long_description": "Die BMW Foundation Herbert Quandt fördert verantwortungsvolle Führungspersönlichkeiten und innovative Ansätze für gesellschaftliche Herausforderungen weltweit.",
        "legal_form": "Stiftung",
        "gemeinnuetzige_zwecke": [
            "Förderung von Wissenschaft und Forschung",
            "Förderung des bürgerschaftlichen Engagements",
            "Förderung internationaler Gesinnung"
        ],
        "past_projects": [],
        "antragsprozess": {
            "deadline_type": "fixed",
            "deadline_date": "2024-12-31",
            "rolling_info": None,
            "required_documents": [
                {
                    "document_type": "projektbeschreibung",
                    "description": "Umfassende Projektbeschreibung",
                    "required": True
                },
                {
                    "document_type": "budgetplan",
                    "description": "Detaillierter Budgetplan",
                    "required": True
                },
                {
                    "document_type": "evaluation",
                    "description": "Evaluationskonzept",
                    "required": True
                }
            ],
            "evaluation_process": "Mehrstufiges Auswahlverfahren mit externen Gutachtern",
            "decision_timeline": "3 Monate"
        },
        "foerderbereich": {
            "scope": "international",
            "specific_areas": ["Deutschland", "Europa", "Global"],
            "restrictions": None
        },
        "foerderhoehe": {
            "category": "large",
            "min_amount": 50000,
            "max_amount": 100000,
            "average_amount": 75000,
            "total_budget": 2000000
        },
        "contact": {
            "email": "info@bmw-foundation.org",
            "phone": "+49 89 382279000",
            "address": "Leopoldstraße 246, 80807 München",
            "contact_person": "Dr. Julia Nussbaum"
        },
        "logo_url": "/hero-avatar.svg",
        "website": "https://www.bmw-foundation.org"
    },
    {
        "_id": "stiftung-003",
        "name": "Stiftung Bildungspakt Bayern",
        "short_description": "Entwickelt innovative Bildungskonzepte für bayerische Schulen.",
        "long_description": "Die Stiftung Bildungspakt Bayern ist eine Initiative von Wirtschaft und Staat zur Verbesserung der Qualität schulischer Bildung. Fokus auf digitale Bildung und MINT-Förderung.",
        "legal_form": "Stiftung",
        "gemeinnuetzige_zwecke": [
            "Förderung von Bildung und Erziehung",
            "Förderung von Wissenschaft und Forschung"
        ],
        "past_projects": [],
        "antragsprozess": {
            "deadline_type": "fixed",
            "deadline_date": "2024-06-30",
            "rolling_info": None,
            "required_documents": [
                {
                    "document_type": "projektbeschreibung",
                    "description": "Pädagogisches Konzept",
                    "required": True
                },
                {
                    "document_type": "zeitplan",
                    "description": "Projektzeitplan",
                    "required": True
                }
            ],
            "evaluation_process": "Bewertung durch pädagogische Experten",
            "decision_timeline": "8 Wochen"
        },
        "foerderbereich": {
            "scope": "regional",
            "specific_areas": ["Bayern"],
            "restrictions": "Nur Schulprojekte in Bayern"
        },
        "foerderhoehe": {
            "category": "medium",
            "min_amount": 10000,
            "max_amount": 30000,
            "average_amount": 20000,
            "total_budget": 400000
        },
        "contact": {
            "email": "info@bildungspakt-bayern.de",
            "phone": "+49 89 21863711",
            "address": "Jungfernturmstraße 1, 80333 München",
            "contact_person": "Susanne Nittenau"
        },
        "logo_url": "/hero-avatar.svg",
        "website": "https://www.bildungspakt-bayern.de"
    },
    {
        "_id": "stiftung-004",
        "name": "Robert Bosch Stiftung",
        "short_description": "Eine der größten unternehmensverbundenen Stiftungen in Deutschland.",
        "long_description": "Die Robert Bosch Stiftung fördert Gesundheit, Bildung, Völkerverständigung und zivilgesellschaftliches Engagement. Sie ist international aktiv und gehört zu den größten Stiftungen Deutschlands.",
        "legal_form": "Stiftung",
        "gemeinnuetzige_zwecke": [
            "Förderung des bürgerschaftlichen Engagements",
            "Förderung von Bildung und Erziehung",
            "Förderung des öffentlichen Gesundheitswesens"
        ],
        "past_projects": [],
        "antragsprozess": {
            "deadline_type": "rolling_basis",
            "deadline_date": None,
            "rolling_info": "Anträge werden kontinuierlich entgegengenommen",
            "required_documents": [
                {
                    "document_type": "projektbeschreibung",
                    "description": "Ausführliche Projektbeschreibung",
                    "required": True
                },
                {
                    "document_type": "budgetplan",
                    "description": "Finanzierungsplan",
                    "required": True
                },
                {
                    "document_type": "handelnde_personen",
                    "description": "Qualifikation der Beteiligten",
                    "required": True
                }
            ],
            "evaluation_process": "Mehrstufiges Begutachtungsverfahren",
            "decision_timeline": "3-6 Monate"
        },
        "foerderbereich": {
            "scope": "national",
            "specific_areas": ["Deutschland"],
            "restrictions": None
        },
        "foerderhoehe": {
            "category": "large",
            "min_amount": 50000,
            "max_amount": 75000,
            "average_amount": 60000,
            "total_budget": 1500000
        },
        "contact": {
            "email": "info@bosch-stiftung.de",
            "phone": "+49 711 46084-0",
            "address": "Heidehofstraße 31, 70184 Stuttgart",
            "contact_person": "Bernhard Lorentz"
        },
        "logo_url": "/hero-avatar.svg",
        "website": "https://www.bosch-stiftung.de"
    },
    {
        "_id": "stiftung-005",
        "name": "Stadtwerke München Bildungsstiftung",
        "short_description": "Unterstützt kulturelle und bildungsbezogene Projekte in München.",
        "long_description": "Die SWM Bildungsstiftung fördert Projekte zur Verbesserung der Bildungschancen von Kindern und Jugendlichen in München mit besonderem Fokus auf Nachhaltigkeit.",
        "legal_form": "Stiftung",
        "gemeinnuetzige_zwecke": [
            "Förderung von Kunst und Kultur",
            "Förderung von Bildung und Erziehung",
            "Förderung des Umwelt- und Naturschutzes"
        ],
        "past_projects": [],
        "antragsprozess": {
            "deadline_type": "fixed",
            "deadline_date": "2024-09-30",
            "rolling_info": None,
            "required_documents": [
                {
                    "document_type": "projektbeschreibung",
                    "description": "Projektbeschreibung",
                    "required": True
                },
                {
                    "document_type": "budgetplan",
                    "description": "Kostenplan",
                    "required": True
                }
            ],
            "evaluation_process": "Bewertung durch Stiftungskuratorium",
            "decision_timeline": "6-8 Wochen"
        },
        "foerderbereich": {
            "scope": "local",
            "specific_areas": ["München"],
            "restrictions": "Nur Münchner Projekte"
        },
        "foerderhoehe": {
            "category": "medium",
            "min_amount": 5000,
            "max_amount": 25000,
            "average_amount": 15000,
            "total_budget": 300000
        },
        "contact": {
            "email": "bildungsstiftung@swm.de",
            "phone": "+49 89 2361-0",
            "address": "Emmy-Noether-Straße 2, 80287 München",
            "contact_person": "Thomas Wagner"
        },
        "logo_url": "/hero-avatar.svg",
        "website": "https://www.swm.de/bildungsstiftung"
    }
]


async def seed_database():
    """Seed the database with mock foundations."""
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    
    try:
        # Clear existing data
        print("Clearing existing foundations...")
        await db.foundations.delete_many({})
        
        # Insert mock data
        print(f"Inserting {len(MOCK_FOUNDATIONS)} foundations...")
        result = await db.foundations.insert_many(MOCK_FOUNDATIONS)
        print(f"✅ Successfully inserted {len(result.inserted_ids)} foundations")
        
        # Create indexes
        print("Creating indexes...")
        await db.foundations.create_index("gemeinnuetzige_zwecke")
        await db.foundations.create_index("foerderbereich.scope")
        await db.foundations.create_index("foerderhoehe.category")
        await db.foundations.create_index([("name", "text"), ("short_description", "text")])
        print("✅ Indexes created")
        
        # Verify
        count = await db.foundations.count_documents({})
        print(f"\n📊 Total foundations in database: {count}")
        
        # Show sample
        print("\n📋 Sample foundation:")
        sample = await db.foundations.find_one()
        if sample:
            print(f"  - Name: {sample['name']}")
            print(f"  - Förderbereich: {sample['foerderbereich']['scope']}")
            print(f"  - Förderhöhe: {sample['foerderhoehe']['min_amount']}€ - {sample['foerderhoehe']['max_amount']}€")
        
    finally:
        client.close()
        print("\n✅ Database seeding completed!")


if __name__ == "__main__":
    asyncio.run(seed_database())

