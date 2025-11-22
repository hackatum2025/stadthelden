import type { Foundation } from "./FoundationCard";
import { MatchScoreSection } from "./foundation-sections/MatchScoreSection";
import { OrganizationSection } from "./foundation-sections/OrganizationSection";
import { PurposesSection } from "./foundation-sections/PurposesSection";
import { FundingSection } from "./foundation-sections/FundingSection";
import { ApplicationProcessSection } from "./foundation-sections/ApplicationProcessSection";
import { ContactSection } from "./foundation-sections/ContactSection";
import { PastProjectsSection } from "./foundation-sections/PastProjectsSection";
import { WebsiteSection } from "./foundation-sections/WebsiteSection";

type FoundationCardExpandedProps = {
  foundation: Foundation;
  onToggleExpand: () => void;
  onStartApplication: () => void;
};

export const FoundationCardExpanded = ({ 
  foundation, 
  onToggleExpand,
  onStartApplication 
}: FoundationCardExpandedProps) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Additional Details Section */}
      <div className="border-t pt-6">
        <h4 className="text-2xl font-bold text-gray-900 mb-6">Detaillierte Informationen</h4>
        <div className="space-y-6">
          {/* Match Score */}
          {foundation.matchScore !== undefined && (
            <MatchScoreSection matchScore={foundation.matchScore} />
          )}

          {/* Organization Info */}
          <OrganizationSection foundation={foundation} />

          {/* Gemeinnützige Zwecke */}
          {foundation.gemeinnuetzigeZwecke && foundation.gemeinnuetzigeZwecke.length > 0 && (
            <PurposesSection purposes={foundation.gemeinnuetzigeZwecke} />
          )}

          {/* Förderhöhe Details */}
          {foundation.foerderhoehe && (
            <FundingSection foerderhoehe={foundation.foerderhoehe} />
          )}

          {/* Antragsprozess */}
          {foundation.antragsprozess && (
            <ApplicationProcessSection antragsprozess={foundation.antragsprozess} />
          )}

          {/* Contact Information */}
          {foundation.contact && (
            <ContactSection contact={foundation.contact} />
          )}

          {/* Past Projects */}
          {foundation.pastProjects && foundation.pastProjects.length > 0 && (
            <PastProjectsSection projects={foundation.pastProjects} />
          )}

          {/* Website */}
          {foundation.website && (
            <WebsiteSection website={foundation.website} />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={onToggleExpand}
          className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </button>
        <button
          onClick={onStartApplication}
          className="flex-1 py-4 bg-gradient-to-r from-[#1b98d5] to-[#0065bd] text-white rounded-xl hover:shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-3 group cursor-pointer"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Antrag stellen
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

