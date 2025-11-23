"""
Document generation service using Gemini AI for creating application documents.
"""

from typing import List
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field, SecretStr

from app.models.document_generation import (
    GenerateDocumentsRequestLegacy,
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
        if not settings.REQUESTY_API_KEY:
            print("❌ WARNING: REQUESTY_API_KEY is not set!")
        
        self.llm = ChatOpenAI(
            model="anthropic/claude-haiku-4-5",
            api_key=SecretStr(settings.REQUESTY_API_KEY),
            base_url=settings.REQUESTY_BASE_URL,
        )        
        self.structured_llm = self.llm.with_structured_output(DocumentsListOutput)
    
    async def generate_documents(
        self, 
        request: GenerateDocumentsRequestLegacy
    ) -> List[GeneratedDocument]:
        """
        Generate content for required documents using Gemini AI.
        
        Args:
            request: The generation request with context (legacy format with all data)
            
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
            # Prepare prompt variables
            project_query_text = request.project_query or "Unbekanntes Projekt"
            prompt_variables = {
                "project_query": project_query_text,
                "chat_context": chat_context,
                "foundation_context": foundation_context,
                "documents_info": documents_info
            }
            
            # Format the full prompt for logging
            system_message = """Du erstellst professionelle Stiftungsanträge auf Deutsch.

FORMAT:
- PLAIN TEXT (kein Markdown: keine #, **, -, *, |)
- Überschriften in GROSSBUCHSTABEN
- Struktur durch Absätze und Zeilenumbrüche

HAUPTTEXT ("text"):
- Vollständiger, verwendbarer Entwurf
- KEINE Platzhalter oder [FRAGE: ...]
- Bei fehlenden Infos: allgemein, aber professionell formulieren

VERBESSERUNGEN ("improvements") - PFLICHT:
- GENAU 3 konkrete Vorschläge pro Dokument
- Array darf NIEMALS leer sein
- Formuliere als klare Handlungsaufforderungen mit Beispielen

DOKUMENTE:
- PROJEKTBESCHREIBUNG: Titel, Problem, Zielgruppe, SMART-Ziele, Methodik, Wirkung, Nachhaltigkeit
- BUDGETPLAN: Tabellarisch (Leerzeichen), Gesamtkosten, Eigenanteil, Förderung
- ZEITPLAN: Phasen mit Monaten, Meilensteine, Evaluation
- EVALUATION: Messbare Indikatoren, Methoden, Zeitplan"""
            
            human_message = f"""Erstelle Antragsunterlagen:

PROJEKT: {project_query_text}
CHAT: {chat_context}
STIFTUNG: {foundation_context}
DOKUMENTE: {documents_info}

Für JEDES Dokument:
1. "text": Vollständiger Entwurf (KEINE Platzhalter)
2. "improvements": GENAU 3 konkrete Vorschläge (z.B. "Präzisiere Zielgruppe: Wie viele Personen, welche Altersgruppe?")

JSON-Format:
{{
  "documents": [
    {{
      "document": "projektbeschreibung",
      "text": "VOLLSTÄNDIGER TEXT...",
      "improvements": ["Vorschlag 1", "Vorschlag 2", "Vorschlag 3"]
    }}
  ]
}}"""
            
            full_prompt = f"SYSTEM:\n{system_message}\n\nHUMAN:\n{human_message}"
            total_chars = len(full_prompt)
            total_tokens_estimate = total_chars // 4  # Rough estimate: ~4 chars per token
            
            # Log prompt details
            print(f"\n{'='*80}")
            print(f"📝 PROMPT ANALYSIS")
            print(f"{'='*80}")
            print(f"System message length: {len(system_message)} chars")
            print(f"Human message length: {len(human_message)} chars")
            print(f"Total prompt length: {total_chars} chars (~{total_tokens_estimate} tokens estimated)")
            print(f"\nProject query length: {len(project_query_text)} chars")
            print(f"Chat context length: {len(chat_context)} chars")
            print(f"Foundation context length: {len(foundation_context)} chars")
            print(f"Documents info length: {len(documents_info)} chars")
            print(f"\n{'='*80}")
            print(f"FULL PROMPT:")
            print(f"{'='*80}")
            print(full_prompt)
            print(f"{'='*80}\n")
            
            # Create chain with structured output
            print(f"📝 Generating documents with AI...")
            print(f"Documents to generate: {len(request.required_documents)}")
            
            # Use structured output to get parsed documents directly
            chain = prompt | self.structured_llm
            # Invoke the chain
            parsed_output: DocumentsListOutput = chain.invoke(prompt_variables)
            
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
        
        system_message = """Du erstellst professionelle Stiftungsanträge auf Deutsch.

FORMAT:
- PLAIN TEXT (kein Markdown: keine #, **, -, *, |)
- Überschriften in GROSSBUCHSTABEN
- Struktur durch Absätze und Zeilenumbrüche

HAUPTTEXT ("text"):
- Vollständiger, verwendbarer Entwurf
- KEINE Platzhalter oder [FRAGE: ...]
- Bei fehlenden Infos: allgemein, aber professionell formulieren

VERBESSERUNGEN ("improvements") - PFLICHT:
- GENAU 3 konkrete Vorschläge pro Dokument
- Array darf NIEMALS leer sein
- Formuliere als klare Handlungsaufforderungen mit Beispielen

DOKUMENTE:
- PROJEKTBESCHREIBUNG: Titel, Problem, Zielgruppe, SMART-Ziele, Methodik, Wirkung, Nachhaltigkeit
- BUDGETPLAN: Tabellarisch (Leerzeichen), Gesamtkosten, Eigenanteil, Förderung
- ZEITPLAN: Phasen mit Monaten, Meilensteine, Evaluation
- EVALUATION: Messbare Indikatoren, Methoden, Zeitplan"""

        human_message = """Erstelle Antragsunterlagen:

PROJEKT: {project_query}
CHAT: {chat_context}
STIFTUNG: {foundation_context}
DOKUMENTE: {documents_info}

Für JEDES Dokument:
1. "text": Vollständiger Entwurf (KEINE Platzhalter)
2. "improvements": GENAU 3 konkrete Vorschläge (z.B. "Präzisiere Zielgruppe: Wie viele Personen, welche Altersgruppe?")

JSON-Format:
{{
  "documents": [
    {{
      "document": "projektbeschreibung",
      "text": "VOLLSTÄNDIGER TEXT...",
      "improvements": ["Vorschlag 1", "Vorschlag 2", "Vorschlag 3"]
    }}
  ]
}}"""

        return ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", human_message)
        ])
    
    def _build_chat_context(self, messages: List) -> str:
        """Build context from chat messages - limited to reduce token usage."""
        if not messages:
            return "Keine zusätzlichen Informationen aus dem Chat vorhanden."
        
        # Limit to last 8 messages and truncate long messages
        limited_messages = messages[-8:] if len(messages) > 8 else messages
        context_parts = []
        for msg in limited_messages:
            role = "Nutzer" if msg.role == "user" else "Assistent"
            # Truncate individual messages if too long (max 300 chars per message)
            content = msg.content
            if len(content) > 300:
                content = content[:300] + "..."
            context_parts.append(f"{role}: {content}")
        
        return "\n".join(context_parts)
    
    def _build_foundation_context(self, foundation_name: str | None, foundation_details: dict | None) -> str:
        """Build context about the foundation - only essential information to reduce token usage."""
        if not foundation_name:
            return "Keine spezifischen Stiftungsinformationen vorhanden."
        
        context = f"Stiftung: {foundation_name}\n"
        
        if foundation_details:
            # Only include purpose if it's concise (max 200 chars)
            if "purpose" in foundation_details and foundation_details["purpose"]:
                purpose = foundation_details["purpose"]
                if len(purpose) > 200:
                    purpose = purpose[:200] + "..."
                context += f"Förderzweck: {purpose}\n"
            # Include funding amount (essential and concise)
            if "foerderhoehe" in foundation_details and foundation_details["foerderhoehe"]:
                foerderhoehe = foundation_details["foerderhoehe"]
                min_amount = foerderhoehe.get('min_amount') or 0
                max_amount = foerderhoehe.get('max_amount') or 0
                if min_amount or max_amount:
                    context += f"Förderhöhe: {min_amount:,.0f}€ - {max_amount:,.0f}€\n"
            # Include funding scope if concise (max 150 chars)
            if "foerderbereich" in foundation_details and foundation_details["foerderbereich"]:
                scope = foundation_details["foerderbereich"].get("scope", "")
                if scope:
                    if len(scope) > 150:
                        scope = scope[:150] + "..."
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
            
            # If no JSON found, raise an error
            raise ValueError("No valid JSON found in response")
            
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
                    text=f"Fehler beim JSON-Parsing: {str(e)}\n\nBitte kontaktieren Sie den Support.",
                    improvements=["Bitte kontaktieren Sie den Support für weitere Hilfe."]
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
                    text=f"Fehler beim Parsen der Antwort: {str(e)}\n\nBitte kontaktieren Sie den Support.",
                    improvements=["Bitte kontaktieren Sie den Support für weitere Hilfe."]
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
        existing_improvements: List[str] | None = None
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
