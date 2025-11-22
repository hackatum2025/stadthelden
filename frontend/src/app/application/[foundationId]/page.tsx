"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ApplicationSidebar } from "./components/ApplicationSidebar";
import { DocumentWorkspace } from "./components/DocumentWorkspace";
import type { Foundation, RequiredDocument } from "@/app/chat/components/FoundationCard";
import { getFoundationScores } from "@/app/chat/services/api";

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const foundationId = params.foundationId as string;
  
  const [foundation, setFoundation] = useState<Foundation | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoundation = async () => {
      try {
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
            setRequiredDocuments(found.antragsprozess?.required_documents || []);
          } else {
            console.error("Foundation not found");
            router.push("/chat");
          }
        }
      } catch (error) {
        console.error("Error fetching foundation:", error);
        router.push("/chat");
      } finally {
        setLoading(false);
      }
    };

    fetchFoundation();
  }, [foundationId, router]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b98d5] mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Antragsinformationen...</p>
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
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
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
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer">
            Entwurf speichern
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-[#1b98d5] to-[#0065bd] text-white rounded-lg hover:shadow-lg transition-all font-medium cursor-pointer">
            Absenden
          </button>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Document Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DocumentWorkspace
            documents={requiredDocuments}
            activeIndex={activeDocumentIndex}
            onTabChange={setActiveDocumentIndex}
            foundationName={foundation.name}
          />
        </div>

        {/* Right Side - Chat Sidebar */}
        <div className="w-96 border-l border-gray-200 flex flex-col">
          <ApplicationSidebar
            foundationName={foundation.name}
            activeDocument={requiredDocuments[activeDocumentIndex]}
          />
        </div>
      </div>
    </div>
  );
}

