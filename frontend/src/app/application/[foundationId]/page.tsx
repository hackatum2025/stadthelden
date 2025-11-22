"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DocumentWorkspace } from "./components/DocumentWorkspace";
import { SubmissionModal } from "./components/SubmissionModal";
import { Toast } from "./components/Toast";
import type { Foundation, RequiredDocument } from "@/app/chat/components/FoundationCard";
import { getFoundationScores, generateDocuments } from "@/app/chat/services/api";
import { useSession } from "@/app/chat/context/SessionContext";

export type DocumentDraft = {
  document_type: string;
  content: string;
};

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const foundationId = params.foundationId as string;
  const { setCurrentFoundationId, chatMessages, projectQuery, clearSession } = useSession();
  
  const [foundation, setFoundation] = useState<Foundation | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [documentDrafts, setDocumentDrafts] = useState<DocumentDraft[]>([]);
  const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingDrafts, setGeneratingDrafts] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
            
            // Generate document drafts using AI
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
                }));
                setDocumentDrafts(drafts);
              } else {
                console.error("Failed to generate document drafts");
                // Initialize with empty drafts
                setDocumentDrafts(
                  requiredDocs.map((doc: RequiredDocument) => ({
                    document_type: doc.document_type,
                    content: "",
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
                }))
              );
            } finally {
              setGeneratingDrafts(false);
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
  }, [foundationId, router, chatMessages, projectQuery]);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = () => {
    // Close modal
    setIsSubmissionModalOpen(false);
    
    // Show success toast
    setShowToast(true);
    
    // Wait for toast to be visible, then navigate
    setTimeout(() => {
      // Clear session and navigate to new chat
      clearSession();
      router.push("/chat");
    }, 2000);
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
          foundationName={foundation.name}
        />

        {/* Action Buttons - Bottom Right */}
        <div className="absolute bottom-8 right-8 flex items-center gap-3 z-10">
          <button 
            onClick={() => {
              // Simple save feedback - could be enhanced with actual save logic
              alert("Entwurf gespeichert!");
            }}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-lg cursor-pointer"
          >
            Entwurf speichern
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

        {/* Success Toast */}
        <Toast
          message="Antrag erfolgreich versendet!"
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
}

