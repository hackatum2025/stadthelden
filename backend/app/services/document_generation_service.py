"""
Document generation service using Gemini AI for creating application documents.
"""

from typing import List
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
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
    text: str = Field(description="The generated content for the document in Markdown format")


class DocumentsListOutput(BaseModel):
    """Schema for the list of generated documents."""
    documents: List[DocumentOutput] = Field(description="List of generated documents")


class DocumentGenerationService:
    """Service for generating application documents using Gemini AI."""
    
    def __init__(self):
        """Initialize the Gemini AI model."""
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7,
            convert_system_message_to_human=True
        )
        
        # Set up output parser
        self.parser = PydanticOutputParser(pydantic_object=DocumentsListOutput)
    
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
        
        # Generate documents
        try:
            chain = prompt | self.llm
            
            response = chain.invoke({
                "project_query": request.project_query or "Unbekanntes Projekt",
                "chat_context": chat_context,
                "foundation_context": foundation_context,
                "documents_info": documents_info,
                "format_instructions": self.parser.get_format_instructions()
            })
            
            # Parse the response
            content = response.content
            
            # Try to extract JSON from the response
            parsed_output = self._parse_response(content)
            
            # Convert to GeneratedDocument objects
            generated_docs = [
                GeneratedDocument(
                    document=doc.document,
                    text=doc.text
                )
                for doc in parsed_output.documents
            ]
            
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
5. Verwende Markdown-Formatierung für Struktur (# Überschriften, ## Unterüberschriften, Listen, Tabellen)
6. Sei konkret und vermeide leere Phrasen
7. Zeige die gesellschaftliche Wirkung und Nachhaltigkeit des Projekts auf

**WICHTIG - UMGANG MIT FEHLENDEN INFORMATIONEN:**
Wenn der Kontext nicht ausreichend ist, um einen Abschnitt vollständig auszufüllen:
- Schreibe einen sinnvollen Entwurf basierend auf den verfügbaren Informationen
- Füge KONKRETE, HILFREICHE FRAGEN in **fett** ein, die dem Nutzer helfen, die fehlenden Details zu ergänzen
- Formatiere Fragen klar: ** [Spezifische Frage hier]**
- Gib Beispiele oder Optionen an, wenn hilfreich
- Stelle Fragen, die zu besseren, detaillierteren Antworten führen

BEISPIEL für fehlende Information:
"## Zielgruppe
Das Projekt richtet sich an ** Welche spezifische Altersgruppe möchten Sie erreichen? (z.B. Kinder 6-12 Jahre, Jugendliche 13-18 Jahre)**

Die Zielgruppe hat folgende Bedürfnisse: ** Welche konkreten Herausforderungen oder Probleme hat Ihre Zielgruppe, die Ihr Projekt lösen möchte?**"

DOKUMENT-TYPEN UND IHRE ANFORDERUNGEN:

**Projektbeschreibung:**
- Projekttitel und Zusammenfassung
- Ausgangssituation und Problemstellung (Frage bei Unklarheit: Welches konkrete Problem wird gelöst?)
- Zielgruppe und deren Bedürfnisse (Frage: Wer genau profitiert? Wie viele Personen?)
- Projektziele (SMART-Ziele - Frage: Was soll konkret erreicht werden? Bis wann?)
- Projektdurchführung (Methodik, Phasen, Meilensteine - Frage: Wie genau wird vorgegangen?)
- Erwartete Ergebnisse und Wirkung (Frage: Welche messbaren Veränderungen werden erwartet?)
- Nachhaltigkeit und langfristige Perspektive (Frage: Wie geht es nach Projektende weiter?)

**Budgetplan:**
- Übersichtliche Tabellen mit Personalkosten, Sachkosten, Honoraren
- Gesamtkalkulation mit Eigenanteil und beantragter Förderung
- Realistische Beträge basierend auf der Förderhöhe der Stiftung
- Bei fehlenden Zahlen: Frage nach konkreten Kostenposten und geschätzten Beträgen

**Zeitplan:**
- Klare Projektphasen mit Monatsangaben
- Konkrete Meilensteine
- Evaluationspunkte
- Bei Unklarheit: Frage nach geplanter Projektdauer und wichtigen Zeitpunkten

**Evaluation:**
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

{format_instructions}

AUFGABE:
Erstelle für JEDES angeforderte Dokument einen vollständigen, professionellen Entwurf.
Nutze die Informationen aus dem Chat-Verlauf, um das Projekt detailliert zu beschreiben.
Passe die Inhalte an die Förderschwerpunkte und Anforderungen der Stiftung an.

WICHTIG - Bei fehlenden oder unklaren Informationen:
- Schreibe trotzdem einen strukturierten Entwurf
- Füge konkrete, hilfreiche Fragen ein mit dem Format: ** [Spezifische Frage]**
- Die Fragen sollten dem Nutzer helfen, die fehlenden Details zu ergänzen
- Gib Beispiele oder Orientierungshilfen in den Fragen

Beispiele für gute Fragen:
- ** Wie viele Teilnehmer:innen sollen konkret erreicht werden? (z.B. 50 Kinder, 20 Jugendliche)**
- ** Welche Qualifikationen bringen die Projektmitarbeiter:innen mit? (z.B. Sozialpädagogik, Erfahrung in...)**
- ** Wie hoch sind die geschätzten Personalkosten für das Projekt? (Stundensatz x Stunden)**
- ** An welchem Datum soll das Projekt beginnen? Wie lange soll es laufen?**"""

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
    
    def _build_foundation_context(self, foundation_name: str, foundation_details: dict) -> str:
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
            # Try to find JSON in the response
            start_idx = content.find("{")
            end_idx = content.rfind("}") + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                data = json.loads(json_str)
                return DocumentsListOutput(**data)
            
            # If no JSON found, try direct parsing
            return self.parser.parse(content)
            
        except Exception as e:
            print(f"Error parsing response: {e}")
            # Try to create a fallback structure
            return DocumentsListOutput(documents=[
                DocumentOutput(
                    document="error",
                    text=f"Fehler beim Parsen der Antwort: {str(e)}\n\nRohausgabe:\n{content}"
                )
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
                    text=f"# {doc.document_type.title()}\n\n{doc.description}\n\nBitte füllen Sie dieses Dokument manuell aus."
                )
            )
        return placeholders
