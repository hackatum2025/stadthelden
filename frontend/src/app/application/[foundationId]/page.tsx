"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DocumentWorkspace } from "./components/DocumentWorkspace";
import { SubmissionModal } from "./components/SubmissionModal";
import { SuccessModal } from "./components/SuccessModal";
import { Toast } from "./components/Toast";
import type { Foundation, RequiredDocument } from "@/app/chat/components/FoundationCard";
import { getFoundationScores, generateDocuments, updateApplicationDocuments } from "@/app/chat/services/api";
import { useSession } from "@/app/chat/context/SessionContext";

export type DocumentDraft = {
  document_type: string;
  content: string;
  improvements?: string[];
};

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const foundationId = params.foundationId as string;
  const { sessionId, setCurrentFoundationId, chatMessages, projectQuery, applicationDocuments, loadSession, clearSession } = useSession();
  
  const [foundation, setFoundation] = useState<Foundation | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [documentDrafts, setDocumentDrafts] = useState<DocumentDraft[]>([]);
  const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingDrafts, setGeneratingDrafts] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchFoundationAndGenerateDrafts = async () => {
      try {
        // Fetch foundation details
        const response = await getFoundationScores(undefined, 5);
        if (response && response.success && response.foundations) {
          const found = response.foundations.find((f: any) => f.id === foundationId);
          if (found) {
            const mappedFoundation: Foundation = {
              id: found.id,
              name: found.name,
              logo: found.logo,
              purpose: found.purpose,
              description: found.description,
              fundingAmount: found.funding_amount,
              matches: found.matches,
              matchScore: found.match_score,
              longDescription: found.long_description,
              legalForm: found.legal_form,
              gemeinnuetzigeZwecke: found.gemeinnuetzige_zwecke,
              antragsprozess: found.antragsprozess,
              foerderbereich: found.foerderbereich,
              foerderhoehe: found.foerderhoehe,
              contact: found.contact,
              pastProjects: found.past_projects,
              website: found.website,
            };
            setFoundation(mappedFoundation);
            
            const requiredDocs = found.antragsprozess?.required_documents || [];
            setRequiredDocuments(requiredDocs);
            setCurrentFoundationId(foundationId); // Save to session
            
            // Check if we have existing documents in the session for this foundation
            const existingDocs = applicationDocuments[foundationId];
            
            if (existingDocs && existingDocs.length > 0) {
              // Use existing documents from session
              console.log("📄 Using existing documents from session");
              setLoading(false);
              const drafts: DocumentDraft[] = existingDocs.map(doc => ({
                document_type: doc.document_type,
                content: doc.content,
                improvements: doc.improvements || [],
              }));
              setDocumentDrafts(drafts);
            } else {
              // Generate document drafts using AI
              console.log("🤖 Generating new document drafts");
              setLoading(false);
              setGeneratingDrafts(true);
              
              try {
                const draftsResponse = await generateDocuments({
                  required_documents: requiredDocs.map((doc: RequiredDocument) => ({
                    document_type: doc.document_type,
                    description: doc.description,
                    required: doc.required,
                  })),
                  chat_messages: chatMessages,
                  project_query: projectQuery || undefined,
                  foundation_name: found.name,
                  foundation_details: {
                    purpose: found.purpose,
                    gemeinnuetzige_zwecke: found.gemeinnuetzige_zwecke,
                    foerderhoehe: found.foerderhoehe,
                    foerderbereich: found.foerderbereich,
                  },
                });
                
                if (draftsResponse && draftsResponse.success) {
                  // Map generated documents to drafts
                  const drafts: DocumentDraft[] = draftsResponse.documents.map(doc => ({
                    document_type: doc.document,
                    content: doc.text,
                    improvements: doc.improvements || [],
                  }));
                  setDocumentDrafts(drafts);
                } else {
                  console.error("Failed to generate document drafts");
                  // Initialize with empty drafts
                  setDocumentDrafts(
                    requiredDocs.map((doc: RequiredDocument) => ({
                      document_type: doc.document_type,
                      content: "",
                      improvements: [],
                    }))
                  );
                }
              } catch (error) {
                console.error("Error generating document drafts:", error);
                // Initialize with empty drafts on error
                setDocumentDrafts(
                  requiredDocs.map((doc: RequiredDocument) => ({
                    document_type: doc.document_type,
                    content: "",
                    improvements: [],
                  }))
                );
              } finally {
                setGeneratingDrafts(false);
              }
            }
          } else {
            console.error("Foundation not found");
            router.push("/chat");
          }
        }
      } catch (error) {
        console.error("Error fetching foundation:", error);
        router.push("/chat");
      }
    };

    fetchFoundationAndGenerateDrafts();
  }, [foundationId, router, chatMessages, projectQuery, applicationDocuments]);

  const handleBack = () => {
    router.back();
  };

  const handleSaveDraft = async () => {
    if (!sessionId) {
      alert("Keine aktive Sitzung gefunden. Bitte starte eine neue Sitzung.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateApplicationDocuments(
        sessionId,
        foundationId,
        documentDrafts.map(draft => ({
          document_type: draft.document_type,
          content: draft.content,
          improvements: draft.improvements || [],
        }))
      );

      if (response && response.success) {
        // Reload session to update applicationDocuments in context
        if (sessionId) {
          await loadSession(sessionId, false);
        }
        setToastMessage("Entwurf erfolgreich gespeichert!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert("Fehler beim Speichern. Bitte versuche es erneut.");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Fehler beim Speichern. Bitte versuche es erneut.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    // Close submission modal
    setIsSubmissionModalOpen(false);
    
    // Show success modal
    setIsSuccessModalOpen(true);
  };

  const handleSuccessModalClose = () => {
    // Close success modal
    setIsSuccessModalOpen(false);
    
    // Clear session and navigate to new chat
    clearSession();
    router.push("/chat");
  };

  if (loading || generatingDrafts) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-fadeIn">
          <div className="mb-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-[#1b98d5]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#1b98d5] rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-3 border-4 border-[#0065bd]/30 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {loading ? "Bereite deinen Antrag vor" : "Erstelle Dokumententwürfe"}
          </h2>
          <p className="text-gray-600">
            {loading 
              ? "Lade Stiftungsinformationen und Dokumentanforderungen"
              : "KI generiert professionelle Entwürfe basierend auf deinem Projekt"
            }
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <span className="w-3 h-3 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-3 h-3 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
            <span className="w-3 h-3 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
          </div>
        </div>
      </div>
    );
  }

  if (!foundation) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
          <div className="h-8 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{foundation.name}</h1>
            <p className="text-sm text-gray-600">Antragserstellung</p>
          </div>
        </div>
      </header>

      {/* Main Content - Document Workspace */}
      <div className="flex-1 overflow-hidden relative">
        <DocumentWorkspace
          documents={requiredDocuments}
          documentDrafts={documentDrafts}
          activeIndex={activeDocumentIndex}
          onTabChange={setActiveDocumentIndex}
          onDraftChange={(index, content) => {
            const newDrafts = [...documentDrafts];
            newDrafts[index] = { ...newDrafts[index], content };
            setDocumentDrafts(newDrafts);
          }}
          onImprovementsUpdate={(index, improvements) => {
            const newDrafts = [...documentDrafts];
            newDrafts[index] = { ...newDrafts[index], improvements };
            setDocumentDrafts(newDrafts);
          }}
          foundationName={foundation.name}
        />

        {/* Action Buttons - Bottom Right */}
        <div className="absolute bottom-8 right-8 flex items-center gap-3 z-10">
          <button 
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Speichere...
              </>
            ) : (
              "Entwurf speichern"
            )}
          </button>
          <button 
            onClick={() => setIsSubmissionModalOpen(true)}
            className="px-6 py-2 bg-gradient-to-r from-[#1b98d5] to-[#0065bd] text-white rounded-lg hover:shadow-xl transition-all font-medium shadow-lg cursor-pointer"
          >
            Absenden
          </button>
        </div>

        {/* Submission Modal */}
        {foundation && (
          <SubmissionModal
            isOpen={isSubmissionModalOpen}
            onClose={() => setIsSubmissionModalOpen(false)}
            onSubmit={handleSubmit}
            foundation={foundation}
            documents={documentDrafts}
          />
        )}

        {/* Success Modal */}
        {foundation && (
          <SuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            foundation={foundation}
          />
        )}

        {/* Toast for save confirmation */}
        <Toast
          message={toastMessage}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
}

