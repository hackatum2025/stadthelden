import Image from "next/image";
import { useRouter } from "next/navigation";
import { FoundationCardExpanded } from "./FoundationCardExpanded";

export type MatchItem = {
  text: string;
  type: "fit" | "mismatch" | "question";
};

export type RequiredDocument = {
  document_type: string;
  description: string;
  required: boolean;
};

export type ApplicationProcess = {
  deadline_type: string;
  deadline_date?: string;
  rolling_info?: string;
  required_documents: RequiredDocument[];
  evaluation_process: string;
  decision_timeline: string;
};

export type GeographicArea = {
  scope: string;
  specific_areas: string[];
  restrictions?: string;
};

export type FundingAmount = {
  category: string;
  min_amount: number;
  max_amount: number;
  average_amount?: number;
  total_budget?: number;
};

export type ContactInfo = {
  email: string;
  phone?: string;
  address?: string;
  name?: string;
};

export type Project = {
  id?: string;
  name: string;
  description: string;
  image_url?: string;
  foundation_id?: string;
  funded_amount: number;
  year?: number;
  duration?: {
    start_date: string;
    end_date?: string;
    duration_months: number;
  };
  status?: string;
  outcomes?: string;
  website_url?: string;
};

export type Foundation = {
  id: string;
  name: string;
  logo: string;
  purpose: string;
  description: string;
  fundingAmount: string;
  matches: MatchItem[];
  // Full foundation details
  matchScore?: number;
  longDescription?: string;
  legalForm?: string;
  gemeinnuetzigeZwecke?: string[];
  antragsprozess?: ApplicationProcess;
  foerderbereich?: GeographicArea;
  foerderhoehe?: FundingAmount;
  contact?: ContactInfo;
  pastProjects?: Project[];
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

export const FoundationCard = ({ 
  foundation,
  isExpanded,
  onToggleExpand
}: { 
  foundation: Foundation;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const router = useRouter();
  const fits = foundation.matches.filter((m) => m.type === "fit");
  const mismatches = foundation.matches.filter((m) => m.type === "mismatch");
  const questions = foundation.matches.filter((m) => m.type === "question");

  const handleStartApplication = () => {
    router.push(`/application/${foundation.id}`);
  };

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
        </div>
      </div>

      {/* Description */}
      <p className={`text-gray-600 text-sm mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {foundation.description}
      </p>

      {/* Expanded Content */}
      {isExpanded ? (
        <FoundationCardExpanded 
          foundation={foundation}
          onToggleExpand={onToggleExpand}
          onStartApplication={handleStartApplication}
        />
      ) : (
        // Collapsed View - Matches Summary
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Fits */}
            <div>
              <div className="text-xs font-medium text-green-700 mb-2">Passt gut</div>
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
          
          {/* Details Button */}
          {!isExpanded && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onToggleExpand}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:border-[#1b98d5] hover:text-[#1b98d5] transition-all duration-300 font-medium flex items-center justify-center gap-2 group cursor-pointer"
              >
                Alle Details ansehen
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
