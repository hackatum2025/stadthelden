"use client";

import { useState, useEffect } from "react";
import { getFoundationScores } from "../services/api";
import { ErrorState } from "./ErrorState";
import { FoundationsLoader } from "./FoundationsLoader";
import { EmptyState } from "./EmptyState";
import { FoundationCard, type Foundation } from "./FoundationCard";

export function ResultsView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch real data from backend
    const fetchFoundations = async () => {
      try {
        const response = await getFoundationScores(undefined, 5);
        
        if (response && response.success && response.foundations) {
          // Map backend data to frontend Foundation type
          const mappedFoundations: Foundation[] = response.foundations.map((f: any) => ({
            id: f.id,
            name: f.name,
            logo: f.logo,
            purpose: f.purpose,
            description: f.description,
            fundingAmount: f.funding_amount,
            matches: f.matches,
            // Store all additional data for detail view
            matchScore: f.match_score,
            longDescription: f.long_description,
            legalForm: f.legal_form,
            gemeinnuetzigeZwecke: f.gemeinnuetzige_zwecke,
            antragsprozess: f.antragsprozess,
            foerderbereich: f.foerderbereich,
            foerderhoehe: f.foerderhoehe,
            contact: f.contact,
            pastProjects: f.past_projects,
            website: f.website,
          }));
          
          setFoundations(mappedFoundations);
          console.log("✅ Loaded foundations from backend:", mappedFoundations);
        } else {
          setError("Backend ist nicht erreichbar. Bitte starte den Server.");
          console.warn("⚠️ Backend unavailable");
        }
      } catch (error) {
        console.error("❌ Error fetching foundations:", error);
        setError("Fehler beim Laden der Stiftungen. Bitte versuche es später erneut.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoundations();
  }, []);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const isAnyExpanded = expandedId !== null;

  if (isLoading) {
    return <FoundationsLoader />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (foundations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-8">
      {/* Header - Hide when expanded */}
      {!isAnyExpanded && (
        <div className="mb-8 animate-slideDown">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dein Perfect Match: {foundations.length} Stiftungen gefunden
          </h1>
          <p className="text-gray-600">
            Basierend auf deiner Projektidee haben wir diese passenden Fördermöglichkeiten identifiziert.
          </p>
        </div>
      )}

      {/* Foundation Cards */}
      <div className={isAnyExpanded ? '' : 'space-y-4'}>
        {foundations.map((foundation, index) => {
          const isExpanded = expandedId === foundation.id;
          const shouldShow = !isAnyExpanded || isExpanded;
          
          if (!shouldShow) return null;

          return (
            <div
              key={foundation.id}
              style={{ animationDelay: isAnyExpanded ? '0ms' : `${index * 100}ms` }}
            >
              <FoundationCard 
                foundation={foundation} 
                isExpanded={isExpanded}
                onToggleExpand={() => handleToggleExpand(foundation.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
