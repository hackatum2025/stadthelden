"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getFoundationScores } from "../services/api";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

type MatchItem = {
  text: string;
  type: "fit" | "mismatch" | "question";
};

type Foundation = {
  id: string;
  name: string;
  logo: string;
  purpose: string;
  description: string;
  fundingAmount: string;
  matches: MatchItem[];
  // Additional backend data
  matchScore?: number;
  legalForm?: string;
  foerderbereichScope?: string;
  website?: string;
};

const MatchIcon = ({ type }: { type: MatchItem["type"] }) => {
  if (type === "fit") {
    return (
      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === "mismatch") {
    return (
      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
};

const FoundationCard = ({ 
  foundation,
  isExpanded,
  onToggleExpand
}: { 
  foundation: Foundation;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const fits = foundation.matches.filter((m) => m.type === "fit");
  const mismatches = foundation.matches.filter((m) => m.type === "mismatch");
  const questions = foundation.matches.filter((m) => m.type === "question");

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-500 p-6 ${
      isExpanded ? '' : 'mb-4'
    } animate-fadeIn`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-[#1b98d5] to-[#0065bd] p-2">
          <Image src={foundation.logo} alt={foundation.name} width={64} height={64} className="w-full h-full" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{foundation.name}</h3>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {foundation.purpose}
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="px-6 py-3 bg-white/30 backdrop-blur-sm text-gray-900 text-xl font-bold rounded-lg border border-white/50">
            {foundation.fundingAmount}
          </div>
          {!isExpanded && (
            <button
              onClick={onToggleExpand}
              className="text-sm text-gray-600 hover:text-[#1b98d5] transition-colors"
            >
              Details ansehen →
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className={`text-gray-600 text-sm mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {foundation.description}
      </p>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-6 animate-fadeIn">
          {/* Additional Details Section */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Detaillierte Informationen</h4>
            <div className="space-y-4">
              {/* Match Score */}
              {foundation.matchScore !== undefined && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Match Score</h5>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${foundation.matchScore * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(foundation.matchScore * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Legal Form & Scope */}
              <div className="grid grid-cols-2 gap-4">
                {foundation.legalForm && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Rechtsform</h5>
                    <p className="text-gray-600">{foundation.legalForm}</p>
                  </div>
                )}
                {foundation.foerderbereichScope && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-1">Förderbereich</h5>
                    <p className="text-gray-600 capitalize">{foundation.foerderbereichScope}</p>
                  </div>
                )}
              </div>

              {/* Website */}
              {foundation.website && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Weitere Informationen</h5>
                  <a 
                    href={foundation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#1b98d5] hover:underline"
                  >
                    <span>Website besuchen</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Purpose Details */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Förderschwerpunkte</h5>
                <p className="text-gray-600">
                  Diese Stiftung konzentriert sich auf nachhaltige Projekte mit sozialem Impact. 
                  Besondere Förderung erhalten innovative Ansätze im Bereich {foundation.purpose.toLowerCase()}.
                </p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={onToggleExpand}
            className="w-full py-3 bg-[#1b98d5] text-white rounded-lg hover:bg-[#0065bd] transition-colors font-medium"
          >
            ← Zurück zur Übersicht
          </button>
        </div>
      )}

      {/* Match Analysis - Only show when NOT expanded */}
      {!isExpanded && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Match-Analyse</h4>
          <div className="grid grid-cols-3 gap-4">
            {/* Fits */}
            <div>
              <div className="text-xs font-medium text-green-700 mb-2">Passt</div>
              <div className="space-y-1">
                {fits.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <MatchIcon type="fit" />
                    <span className="text-xs text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mismatches */}
            <div>
              <div className="text-xs font-medium text-red-700 mb-2">Achtung</div>
              <div className="space-y-1">
                {mismatches.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <MatchIcon type="mismatch" />
                    <span className="text-xs text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="text-xs font-medium text-yellow-700 mb-2">Zu klären</div>
              <div className="space-y-1">
                {questions.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <MatchIcon type="question" />
                    <span className="text-xs text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
            // Store additional data for detail view
            matchScore: f.match_score,
            legalForm: f.legal_form,
            foerderbereichScope: f.foerderbereich_scope,
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
    return <LoadingState />;
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


