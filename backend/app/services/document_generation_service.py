"""
Document generation service using Gemini AI for creating application documents.
"""

from typing import List
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.models.document_generation import (
    GenerateDocumentsRequest,
    GeneratedDocument,
    RequiredDocumentInput
)
from app.core.config import settings


class DocumentOutput(BaseModel):
    """Schema for a single generated document."""
    document: str = Field(description="The document type (e.g., 'projektbeschreibung')")
    text: str = Field(description="The generated content for the document in plain text format (no Markdown). This should be a complete, usable draft without any placeholder questions.")
    improvements: List[str] = Field(description="MANDATORY: List of exactly 3 specific improvement suggestions to help the user enhance the document. Each item must be a clear, actionable suggestion. This field MUST NOT be empty.", min_length=1, max_length=3)


class DocumentsListOutput(BaseModel):
    """Schema for the list of generated documents."""
    documents: List[DocumentOutput] = Field(description="List of generated documents")


class DocumentGenerationService:
    """Service for generating application documents using Gemini AI."""
    
    def __init__(self):
        """Initialize the Gemini AI model with structured output."""
        if not settings.GEMINI_API_KEY:
            print("❌ WARNING: GEMINI_API_KEY is not set!")
        else:
            print(f"✅ GEMINI_API_KEY is configured (length: {len(settings.GEMINI_API_KEY)})")
        
        try:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.7,
                convert_system_message_to_human=True
            )
            print(f"✅ Gemini AI model initialized: gemini-2.5-flash")
        except Exception as e:
            print(f"❌ Failed to initialize Gemini AI: {e}")
            raise
        
        # Set up structured output using modern LangChain pattern
        self.structured_llm = self.llm.with_structured_output(DocumentsListOutput)
    
    async def generate_documents(
        self, 
        request: GenerateDocumentsRequest
    ) -> List[GeneratedDocument]:
        """
        Generate content for required documents using Gemini AI.
        
        Args:
            request: The generation request with context
            
        Returns:
            List of generated documents with AI-generated content
        """
        # Build context from chat messages
        chat_context = self._build_chat_context(request.chat_messages)
        
        # Build foundation context
        foundation_context = self._build_foundation_context(
            request.foundation_name,
            request.foundation_details
        )
        
        # Build document requirements
        documents_info = self._build_documents_info(request.required_documents)
        
        # Create the prompt
        prompt = self._create_prompt()
        
        # Generate documents using modern LangChain structured output
        try:
            # Create chain with structured output
            print(f"📝 Generating documents with AI...")
            print(f"Project query: {request.project_query or 'Unbekanntes Projekt'}")
            print(f"Documents to generate: {len(request.required_documents)}")
            
            # Use structured output to get parsed documents directly
            chain = prompt | self.structured_llm
            # Invoke the chain
            parsed_output: DocumentsListOutput = chain.invoke({
                "project_query": request.project_query or "Unbekanntes Projekt",
                "chat_context": chat_context,
                "foundation_context": foundation_context,
                "documents_info": documents_info
            })
            
            print(f"✅ Successfully generated {len(parsed_output.documents)} documents")
           
            
            # Convert to GeneratedDocument objects
            generated_docs = []
            for doc in parsed_output.documents:
                # Ensure improvements are never empty
                improvements = doc.improvements if doc.improvements else self._generate_fallback_improvements(doc.document)
                generated_docs.append(
                    GeneratedDocument(
                        document=doc.document,
                        text=doc.text,
                        improvements=improvements
                    )
                )
            
            return generated_docs
            
        except Exception as e:
            print(f"Error generating documents with Gemini: {e}")
            # Fallback to placeholder if AI fails
            return self._generate_placeholder_documents(request.required_documents)
    
    def _create_prompt(self) -> ChatPromptTemplate:
        """Create the prompt template for document generation."""
        
        system_message = """Du bist ein erfahrener Experte für Stiftungsanträge in Deutschland. 
Deine Aufgabe ist es, professionelle, überzeugende Antragsunterlagen für gemeinnützige Projekte zu erstellen.

WICHTIGE RICHTLINIEN:
1. Schreibe auf Deutsch in professionellem, aber zugänglichem Stil
2. Verwende konkrete, messbare Ziele und klare Beschreibungen
3. Passe den Inhalt an die spezifische Stiftung und ihre Förderschwerpunkte an
4. Nutze die Informationen aus dem Chat-Verlauf, um das Projekt zu verstehen
5. Schreibe in PLAIN TEXT ohne Markdown-Formatierung (keine #, **, -, *, |, etc.)
6. Strukturiere durch Absätze, Zeilenumbrüche und klare Überschriften in GROSSBUCHSTABEN
7. Sei konkret und vermeide leere Phrasen
8. Zeige die gesellschaftliche Wirkung und Nachhaltigkeit des Projekts auf

**WICHTIG - UMGANG MIT FEHLENDEN INFORMATIONEN:**
- Der HAUPTTEXT ("text") muss IMMER ein vollständiger, verwendbarer Entwurf sein
- KEINE Platzhalter, KEINE [FRAGE: ...] im Haupttext
- Schreibe sinnvolle, plausible Inhalte basierend auf dem verfügbaren Kontext
- Bei fehlenden Details: Formuliere allgemein, aber professionell

**VERBESSERUNGSVORSCHLÄGE ("improvements") - PFLICHTFELD:**
- DU MUSST für JEDES Dokument GENAU 3 konkrete Verbesserungsvorschläge erstellen
- Das improvements-Array darf NIEMALS leer sein
- Wähle die 3 wichtigsten Verbesserungen aus
- Jeder Vorschlag muss dem Nutzer helfen, den Entwurf zu präzisieren
- Formuliere als klare, spezifische Handlungsaufforderungen
- Gib konkrete Beispiele oder Orientierungshilfen

BEISPIELE für gute Verbesserungsvorschläge:
- "Präzisiere die Zielgruppe: Welche spezifische Altersgruppe soll erreicht werden? (z.B. Kinder 6-12 Jahre, Jugendliche 13-18)"
- "Ergänze konkrete Erfolgsindikatoren: Wie viele Teilnehmer:innen sollen erreicht werden? Welche messbaren Veränderungen werden angestrebt?"
- "Detailliere die Personalkosten: Welche Qualifikationen bringen die Projektmitarbeiter:innen mit? Wie hoch ist der Stundensatz?"
- "Füge Informationen zur Zielgruppe hinzu: Wie viele Personen werden konkret erreicht? Welche Merkmale hat die Zielgruppe?"
- "Ergänze messbare Projektergebnisse: Was sind die konkreten Outputs? Wie wird der Erfolg gemessen?"
- "Spezifiziere den Zeitplan: Welche Meilensteine gibt es? Wann finden welche Aktivitäten statt?"

DOKUMENT-TYPEN UND IHRE ANFORDERUNGEN:

PROJEKTBESCHREIBUNG:
- Projekttitel und Zusammenfassung
- Ausgangssituation und Problemstellung (Frage bei Unklarheit: Welches konkrete Problem wird gelöst?)
- Zielgruppe und deren Bedürfnisse (Frage: Wer genau profitiert? Wie viele Personen?)
- Projektziele (SMART-Ziele - Frage: Was soll konkret erreicht werden? Bis wann?)
- Projektdurchführung (Methodik, Phasen, Meilensteine - Frage: Wie genau wird vorgegangen?)
- Erwartete Ergebnisse und Wirkung (Frage: Welche messbaren Veränderungen werden erwartet?)
- Nachhaltigkeit und langfristige Perspektive (Frage: Wie geht es nach Projektende weiter?)
- WICHTIG: Überschriften in GROSSBUCHSTABEN, kein Markdown

BUDGETPLAN:
- Einfache tabellarische Auflistung mit Spalten durch mehrere Leerzeichen getrennt
- Gesamtkalkulation mit Eigenanteil und beantragter Förderung
- Realistische Beträge basierend auf der Förderhöhe der Stiftung
- Bei fehlenden Zahlen: Frage nach konkreten Kostenposten und geschätzten Beträgen
- WICHTIG: Keine Markdown-Tabellen (keine |), einfache Textformatierung

ZEITPLAN:
- Klare Projektphasen mit Monatsangaben
- Konkrete Meilensteine
- Evaluationspunkte
- Bei Unklarheit: Frage nach geplanter Projektdauer und wichtigen Zeitpunkten
- WICHTIG: Einfache Liste, kein Markdown

EVALUATION:
- Messbare quantitative und qualitative Indikatoren
- Evaluationsmethoden
- Zeitplan für Zwischen- und Abschlussevaluation
- Bei fehlenden Details: Frage nach Erfolgskriterien und Messmethoden"""

        human_message = """Erstelle professionelle Antragsunterlagen basierend auf folgenden Informationen:

PROJEKTIDEE:
{project_query}

CHAT-VERLAUF (Kontext zum Projekt):
{chat_context}

STIFTUNGSINFORMATIONEN:
{foundation_context}

BENÖTIGTE DOKUMENTE:
{documents_info}

AUFGABE:
Erstelle für JEDES angeforderte Dokument:
1. "text": Einen vollständigen, professionellen Entwurf OHNE Platzhalter oder Fragen
2. "improvements": PFLICHTFELD - GENAU 3 konkrete Verbesserungsvorschläge

WICHTIG - Haupttext ("text"):
- Muss KOMPLETT und VERWENDBAR sein
- KEINE [FRAGE: ...] oder Platzhalter im Text
- Schreibe plausible Inhalte basierend auf verfügbaren Informationen
- Bei Unsicherheit: Formuliere allgemein, aber professionell

KRITISCH - Verbesserungen ("improvements") - PFLICHTFELD:
- MUSS GENAU 3 konkrete Vorschläge enthalten
- Das Array darf NIEMALS leer sein
- Wähle die 3 wichtigsten Verbesserungen für dieses spezifische Dokument
- Jeder Vorschlag muss spezifisch und umsetzbar sein
- Formuliere als klare, direkte Fragen oder Handlungsaufforderungen
- Gib konkrete Beispiele, wo es hilfreich ist

Beispiele für gute Verbesserungsvorschläge:
- "Präzisiere die Zielgruppe mit konkreten Zahlen: Wie viele Personen sollen erreicht werden? Welche Altersgruppe?"
- "Ergänze messbare Projektziele: Welche konkreten Ergebnisse sollen bis wann erreicht werden?"
- "Detailliere die Kostenplanung: Welche Personalkosten fallen an? (Stundensatz, Anzahl Stunden)"
- "Spezifiziere den Zeitplan: Wann soll das Projekt starten? Wie lange ist die Laufzeit?"
- "Füge Informationen zur Nachhaltigkeit hinzu: Wie wird das Projekt nach Förderungsende weitergeführt?"
- "Konkretisiere die Evaluationsmethoden: Welche spezifischen Indikatoren werden gemessen?"

FORMATIERUNG:
- Text: KEIN Markdown (keine #, **, -, *, |, etc.), Überschriften in GROSSBUCHSTABEN
- Improvements: PFLICHTFELD - Jeder Eintrag ist ein separater String, IMMER GENAU 3 Einträge

ANTWORTFORMAT - JSON:
{{
  "documents": [
    {{
      "document": "projektbeschreibung",
      "text": "VOLLSTÄNDIGER TEXT HIER...",
      "improvements": [
        "Verbesserung 1 - konkret und umsetzbar",
        "Verbesserung 2 - konkret und umsetzbar",
        "Verbesserung 3 - konkret und umsetzbar"
      ]
    }}
  ]
}}

WICHTIG: Das improvements-Array MUSS für JEDES Dokument GENAU 3 Einträge haben!"""

        return ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", human_message)
        ])
    
    def _build_chat_context(self, messages: List) -> str:
        """Build context from chat messages."""
        if not messages:
            return "Keine zusätzlichen Informationen aus dem Chat vorhanden."
        
        context_parts = []
        for msg in messages:
            role = "Nutzer" if msg.role == "user" else "Assistent"
            context_parts.append(f"{role}: {msg.content}")
        
        return "\n".join(context_parts)
    
    def _build_foundation_context(self, foundation_name: str | None, foundation_details: dict | None) -> str:
        """Build context about the foundation."""
        if not foundation_name:
            return "Keine spezifischen Stiftungsinformationen vorhanden."
        
        context = f"Stiftung: {foundation_name}\n"
        
        if foundation_details:
            if "purpose" in foundation_details:
                context += f"Förderzweck: {foundation_details['purpose']}\n"
            if "foerderhoehe" in foundation_details:
                foerderhoehe = foundation_details["foerderhoehe"]
                context += f"Förderhöhe: {foerderhoehe.get('min_amount', 0):,.0f}€ - {foerderhoehe.get('max_amount', 0):,.0f}€\n"
            if "gemeinnuetzige_zwecke" in foundation_details:
                zwecke = ", ".join(foundation_details["gemeinnuetzige_zwecke"])
                context += f"Gemeinnützige Zwecke: {zwecke}\n"
            if "foerderbereich" in foundation_details:
                scope = foundation_details["foerderbereich"].get("scope", "")
                context += f"Förderbereich: {scope}\n"
        
        return context
    
    def _build_documents_info(self, documents: List[RequiredDocumentInput]) -> str:
        """Build information about required documents."""
        docs_info = []
        for doc in documents:
            required_text = "PFLICHT" if doc.required else "OPTIONAL"
            docs_info.append(f"- {doc.document_type} ({required_text}): {doc.description}")
        
        return "\n".join(docs_info)
    
    def _parse_response(self, content: str) -> DocumentsListOutput:
        """Parse the AI response to extract structured output."""
        try:
            # Remove markdown code blocks if present
            cleaned_content = content.strip()
            
            # Remove opening ```json or ``` markers
            if cleaned_content.startswith("```json"):
                cleaned_content = cleaned_content[7:]
            elif cleaned_content.startswith("```"):
                cleaned_content = cleaned_content[3:]
            
            # Remove closing ``` marker
            if cleaned_content.endswith("```"):
                cleaned_content = cleaned_content[:-3]
            
            cleaned_content = cleaned_content.strip()
            
            # Try to find JSON in the cleaned response
            start_idx = cleaned_content.find("{")
            end_idx = cleaned_content.rfind("}") + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = cleaned_content[start_idx:end_idx]
                
                # Try to repair common JSON issues
                json_str = self._repair_json(json_str)
                
                # Parse the JSON
                data = json.loads(json_str, strict=False)
                
                return DocumentsListOutput(**data)
            
            # If no JSON found, try direct parsing
            return self.parser.parse(cleaned_content)
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Error position: line {e.lineno}, column {e.colno}")
            print(f"Problematic content snippet around error:")
            # Try to show context around the error
            if hasattr(e, 'pos') and e.pos:
                start = max(0, e.pos - 100)
                end = min(len(content), e.pos + 100)
                print(f"...{content[start:end]}...")
            
            # Return a more helpful error
            return DocumentsListOutput(documents=[
                DocumentOutput(
                    document="error",
                    text=f"Fehler beim JSON-Parsing: {str(e)}\n\nBitte kontaktieren Sie den Support."
                )
            ])
        except Exception as e:
            print(f"Error parsing response: {e}")
            import traceback
            traceback.print_exc()
            # Try to create a fallback structure
            return DocumentsListOutput(documents=[
                DocumentOutput(
                    document="error",
                    text=f"Fehler beim Parsen der Antwort: {str(e)}\n\nBitte kontaktieren Sie den Support."
                )
            ])
    
    def _repair_json(self, json_str: str) -> str:
        """Attempt to repair common JSON formatting issues."""
        # This is a simple repair - remove unescaped control characters
        import re
        
        # Replace unescaped newlines, tabs, etc. within strings
        # This regex finds strings and fixes control characters within them
        def fix_string(match):
            string_content = match.group(0)
            # Only fix if it's inside a string (between quotes)
            if string_content.startswith('"') and string_content.endswith('"'):
                # Replace control characters
                fixed = string_content.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
                return fixed
            return string_content
        
        # Don't repair - this could break valid JSON
        # Instead, just return as-is and let json.loads with strict=False handle it
        return json_str
    
    def _generate_fallback_improvements(self, document_type: str) -> List[str]:
        """Generate fallback improvements if AI doesn't provide any."""
        improvements_map = {
            "projektbeschreibung": [
                "Präzisiere die Zielgruppe: Wie viele Personen werden konkret erreicht? Welche spezifischen Merkmale hat die Zielgruppe?",
                "Ergänze messbare Erfolgsindikatoren: Welche konkreten, quantifizierbaren Ergebnisse werden angestrebt?",
                "Detailliere den Zeitplan: Welche konkreten Meilensteine gibt es? Wann finden welche Aktivitäten statt?"
            ],
            "budgetplan": [
                "Spezifiziere die Personalkosten: Welche Qualifikationen werden benötigt? Wie hoch sind die Stundensätze?",
                "Füge Details zu Sachkosten hinzu: Welche spezifischen Posten fallen an? Welche Mengen werden benötigt?",
                "Ergänze Informationen zum Eigenanteil: Wie hoch ist der Eigenanteil? Aus welchen Quellen stammt er?"
            ],
            "zeitplan": [
                "Konkretisiere die Projektphasen: Welche spezifischen Aktivitäten finden in jeder Phase statt?",
                "Füge Meilensteine hinzu: Welche messbaren Zwischenergebnisse markieren den Fortschritt?",
                "Ergänze Pufferzeiten: Wo sollten Zeitreserven für unvorhergesehene Verzögerungen eingeplant werden?"
            ],
            "evaluation": [
                "Definiere konkrete Indikatoren: Welche spezifischen, messbaren Kennzahlen werden erhoben?",
                "Spezifiziere Messmethoden: Wie genau werden die Daten gesammelt und ausgewertet?",
                "Ergänze den Evaluationszeitplan: Wann finden Zwischen- und Endevaluationen statt?"
            ]
        }
        
        # Return specific improvements for the document type, or generic ones
        return improvements_map.get(document_type.lower(), [
            "Füge spezifische Details hinzu: Welche konkreten Informationen fehlen noch?",
            "Ergänze messbare Angaben: Wie können die Aussagen quantifiziert werden?",
            "Präzisiere die Beschreibungen: Wo können allgemeine Formulierungen konkretisiert werden?"
        ])
    
    def _generate_placeholder_documents(
        self, 
        documents: List[RequiredDocumentInput]
    ) -> List[GeneratedDocument]:
        """Generate placeholder documents as fallback."""
        placeholders = []
        for doc in documents:
            placeholders.append(
                GeneratedDocument(
                    document=doc.document_type,
                    text=f"{doc.document_type.upper()}\n\n{doc.description}\n\nBitte füllen Sie dieses Dokument manuell aus.",
                    improvements=self._generate_fallback_improvements(doc.document_type)
                )
            )
        return placeholders
    
    async def proofread_document(
        self,
        document_text: str,
        document_type: str,
        existing_improvements: List[str] = None
    ) -> List[str]:
        """
        Generate new improvement suggestions for an existing document.
        
        Args:
            document_text: The current document text
            document_type: The type of document
            existing_improvements: Previously suggested improvements (optional)
            
        Returns:
            List of new improvement suggestions
        """
        system_message = """Du bist ein erfahrener Lektor und Experte für Stiftungsanträge.
Deine Aufgabe ist es, konstruktive Verbesserungsvorschläge für Antragsunterlagen zu geben.

RICHTLINIEN:
1. Analysiere den Text auf Verbesserungspotenziale
2. Fokussiere auf: Klarheit, Präzision, Überzeugungskraft, Vollständigkeit
3. Gib GENAU 3 konkrete Verbesserungsvorschläge
4. Jeder Vorschlag sollte umsetzbar und spezifisch sein
5. Vermeide bereits gemachte Vorschläge
6. Priorisiere die 3 wichtigsten Verbesserungen"""

        human_message = f"""Analysiere folgenden Text und gib neue Verbesserungsvorschläge:

DOKUMENTTYP: {document_type}

TEXT:
{document_text}

{f'''BEREITS VORHANDENE VORSCHLÄGE (nicht wiederholen):
{chr(10).join(f"- {imp}" for imp in existing_improvements)}
''' if existing_improvements else ''}

Gib GENAU 3 neue, konkrete Verbesserungsvorschläge.
Antworte mit einem JSON-Objekt im Format:
{{{{"improvements": ["Vorschlag 1", "Vorschlag 2", "Vorschlag 3"]}}}}"""

        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_message),
                ("human", human_message)
            ])
            
            chain = prompt | self.llm
            response = chain.invoke({})
            
            # Parse response
            content = response.content.strip()
            
            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            elif content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            content = content.strip()
            
            # Find JSON
            start_idx = content.find("{")
            end_idx = content.rfind("}") + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                data = json.loads(json_str, strict=False)
                
                improvements = data.get("improvements", [])
                # Limit to 3 improvements
                return improvements[:3]
            
            return []
            
        except Exception as e:
            print(f"Error in proofread_document: {e}")
            import traceback
            traceback.print_exc()
            return []
