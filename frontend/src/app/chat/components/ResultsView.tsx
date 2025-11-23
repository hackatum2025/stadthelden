"use client";

import { useState, useEffect } from "react";
import { getFoundationScores } from "../services/api";
import { ErrorState } from "./ErrorState";
import { FoundationsLoader } from "./FoundationsLoader";
import { EmptyState } from "./EmptyState";
import { FoundationCard, type Foundation } from "./FoundationCard";
import { useSession } from "../context/SessionContext";

// Helper function to get favicon URL from website URL
const getFaviconUrl = (websiteUrl: string | undefined, logo: string): string => {
  if (!websiteUrl) {
    return logo; // fallback to default logo
  }

  try {
    const url = new URL(websiteUrl);
    const domain = url.hostname;
    // Using Google's favicon service for reliable favicon fetching
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (error) {
    console.warn("Invalid website URL:", websiteUrl);
    return logo; // fallback to default logo
  }
};

export function ResultsView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sessionId, foundationResults: sessionResults, setFoundationResults } = useSession();

  useEffect(() => {
    // Check if we have session data first
    if (sessionResults && sessionResults.length > 0) {
      console.log("✅ Restoring foundations from session:", sessionResults.length);

      const mappedFoundations: Foundation[] = sessionResults.map((f: any) => ({
        id: f.id,
        name: f.name,
        logo: getFaviconUrl(f.website, f.logo),
        purpose: f.purpose,
        description: f.description,
        fundingAmount: f.funding_amount,
        matches: f.matches,
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
      setIsLoading(false);
      return;
    }

    // Fetch real data from backend if no session data
    const fetchFoundations = async () => {
      // Need a session to fetch foundation scores
      if (!sessionId) {
        setError("Keine Session gefunden. Bitte starte einen Chat.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getFoundationScores(sessionId, 5);

        if (response && response.success && response.foundations) {
          // Map backend data to frontend Foundation type
          const mappedFoundations: Foundation[] = response.foundations.map((f: any) => ({
            id: f.id,
            name: f.name,
            logo: getFaviconUrl(f.website, f.logo),
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
          setFoundationResults(response.foundations); // Save to session
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
  }, [sessionId, sessionResults, setFoundationResults]);

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
