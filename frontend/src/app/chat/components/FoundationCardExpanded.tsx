import type { Foundation, MatchItem } from "./FoundationCard";
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

const MatchIcon = ({ type }: { type: MatchItem["type"] }) => {
  if (type === "fit") {
    return (
      <svg className="w-5 h-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === "mismatch") {
    return (
      <svg className="w-5 h-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 flex-shrink-0 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
};

export const FoundationCardExpanded = ({
  foundation,
  onToggleExpand,
  onStartApplication
}: FoundationCardExpandedProps) => {
  const fits = foundation.matches.filter((m) => m.type === "fit");
  const mismatches = foundation.matches.filter((m) => m.type === "mismatch");
  const questions = foundation.matches.filter((m) => m.type === "question");

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Match Analysis Section - All Items */}
      <div className="border-t pt-6">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Match-Analyse</h4>
        <div className="grid grid-cols-3 gap-4">
          {/* Fits */}
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Passt gut
            </div>
            <div className="space-y-2">
              {fits.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <MatchIcon type="fit" />
                  <span className="text-xs text-gray-700">{item.text}</span>
                </div>
              ))}
              {fits.length === 0 && (
                <p className="text-xs text-gray-500 italic">Keine Angaben</p>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
            <div className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Zu klären
            </div>
            <div className="space-y-2">
              {questions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <MatchIcon type="question" />
                  <span className="text-xs text-gray-700">{item.text}</span>
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-xs text-gray-500 italic">Keine Angaben</p>
              )}
            </div>
          </div>

          {/* Mismatches */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <div className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Achtung
            </div>
            <div className="space-y-2">
              {mismatches.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <MatchIcon type="mismatch" />
                  <span className="text-xs text-gray-700">{item.text}</span>
                </div>
              ))}
              {mismatches.length === 0 && (
                <p className="text-xs text-gray-500 italic">Keine Angaben</p>
              )}
            </div>
          </div>
        </div>
      </div>

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

