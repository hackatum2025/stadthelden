import Image from "next/image";

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
  contact_person?: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  foundation_id: string;
  funded_amount: number;
  duration: {
    start_date: string;
    end_date?: string;
    duration_months: number;
  };
  status: string;
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

const getPurposeIcon = (purpose: string) => {
  const purposeLower = purpose.toLowerCase();
  
  if (purposeLower.includes('jugend') || purposeLower.includes('kind')) {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />;
  } else if (purposeLower.includes('bildung') || purposeLower.includes('erziehung')) {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />;
  } else if (purposeLower.includes('wissenschaft') || purposeLower.includes('forschung')) {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />;
  } else if (purposeLower.includes('umwelt') || purposeLower.includes('natur')) {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
  } else if (purposeLower.includes('kultur') || purposeLower.includes('kunst')) {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />;
  } else if (purposeLower.includes('sport')) {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
  } else if (purposeLower.includes('engagement') || purposeLower.includes('bürger')) {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
  } else if (purposeLower.includes('gesundheit') || purposeLower.includes('medizin')) {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />;
  } else {
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
  }
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
          <div className="border-t pt-6">
            <h4 className="text-2xl font-bold text-gray-900 mb-6">Detaillierte Informationen</h4>
            <div className="space-y-6">
              {/* Match Score */}
              {foundation.matchScore !== undefined && (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900">Match Score</h5>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${foundation.matchScore * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {Math.round(foundation.matchScore * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Organization Info Card */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h5 className="text-lg font-semibold text-gray-900">Organisation</h5>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {foundation.legalForm && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Rechtsform</p>
                      <p className="font-medium text-gray-900">{foundation.legalForm}</p>
                    </div>
                  )}
                  {foundation.foerderbereich && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Förderbereich</p>
                      <p className="font-medium text-gray-900 capitalize">{foundation.foerderbereich.scope}</p>
                      {foundation.foerderbereich.specific_areas && foundation.foerderbereich.specific_areas.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          {foundation.foerderbereich.specific_areas.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {foundation.longDescription && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Über die Stiftung</p>
                    <p className="text-gray-700">{foundation.longDescription}</p>
                  </div>
                )}
              </div>

              {/* Gemeinnützige Zwecke */}
              {foundation.gemeinnuetzigeZwecke && foundation.gemeinnuetzigeZwecke.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <h5 className="text-lg font-semibold text-gray-900">Gemeinnützige Zwecke</h5>
                    </div>
                    <a 
                      href="https://www.gesetze-im-internet.de/ao_1977/__52.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      §52 AO
                    </a>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {foundation.gemeinnuetzigeZwecke.map((zweck, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg flex items-center gap-3 shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {getPurposeIcon(zweck)}
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{zweck}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Förderhöhe Details */}
              {foundation.foerderhoehe && (
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900">Förderhöhe</h5>
                    <span className="ml-auto px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-medium rounded-full capitalize">
                      {foundation.foerderhoehe.category}
                    </span>
                  </div>
                  
                  {/* Bar Chart Visualization */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm text-gray-600">Minimum</span>
                        <span className="text-lg font-bold text-gray-900">
                          {foundation.foerderhoehe.min_amount.toLocaleString('de-DE')} €
                        </span>
                      </div>
                      <div className="h-3 bg-emerald-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ 
                            width: `${(foundation.foerderhoehe.min_amount / foundation.foerderhoehe.max_amount) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {foundation.foerderhoehe.average_amount && (
                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-sm text-gray-600">Durchschnitt</span>
                          <span className="text-lg font-bold text-gray-900">
                            {foundation.foerderhoehe.average_amount.toLocaleString('de-DE')} €
                          </span>
                        </div>
                        <div className="h-3 bg-emerald-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ 
                              width: `${(foundation.foerderhoehe.average_amount / foundation.foerderhoehe.max_amount) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm text-gray-600">Maximum</span>
                        <span className="text-lg font-bold text-gray-900">
                          {foundation.foerderhoehe.max_amount.toLocaleString('de-DE')} €
                        </span>
                      </div>
                      <div className="h-3 bg-emerald-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Antragsprozess - The key section the user wanted */}
              {foundation.antragsprozess && (
                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900">Antragsprozess</h5>
                  </div>

                  {/* Deadlines & Timeline Card */}
                  <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h6 className="font-semibold text-gray-900">Fristen & Zeitplan</h6>
                    </div>
                    <div className="space-y-3 pl-7">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Bewerbungsfrist</p>
                        <p className="text-sm font-medium text-gray-900">
                          {foundation.antragsprozess.deadline_type === "fixed" ? (
                            <>Fester Termin: {foundation.antragsprozess.deadline_date ? new Date(foundation.antragsprozess.deadline_date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }) : foundation.antragsprozess.deadline_date}</>
                          ) : (
                            <>Laufende Bewerbung - {foundation.antragsprozess.rolling_info}</> 
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Entscheidungszeitraum</p>
                        <p className="text-sm font-medium text-gray-900">{foundation.antragsprozess.decision_timeline}</p>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Process */}
                  <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <h6 className="font-semibold text-gray-900">Bewertungsprozess</h6>
                    </div>
                    <p className="text-sm text-gray-700 pl-7">{foundation.antragsprozess.evaluation_process}</p>
                  </div>

                  {/* Required Documents */}
                  {foundation.antragsprozess.required_documents && foundation.antragsprozess.required_documents.length > 0 && (
                    <div>
                      <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Erforderliche Unterlagen
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {foundation.antragsprozess.required_documents.map((doc, idx) => (
                          <div 
                            key={idx} 
                            className={`bg-white p-4 rounded-xl shadow-sm border-2 transition-all ${
                              doc.required 
                                ? 'border-red-200 hover:border-red-300' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                doc.required ? 'bg-red-100' : 'bg-gray-100'
                              }`}>
                                <svg 
                                  className={`w-5 h-5 ${doc.required ? 'text-red-600' : 'text-gray-600'}`} 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h6 className="font-semibold text-gray-900 text-sm capitalize">
                                    {doc.document_type}
                                  </h6>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{doc.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information */}
              {foundation.contact && (
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900">Kontakt</h5>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                    {foundation.contact.contact_person && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Ansprechpartner</p>
                          <p className="font-medium text-gray-900">{foundation.contact.contact_person}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <a href={`mailto:${foundation.contact.email}`} className="font-medium text-[#1b98d5] hover:underline">
                          {foundation.contact.email}
                        </a>
                      </div>
                    </div>
                    {foundation.contact.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Telefon</p>
                          <a href={`tel:${foundation.contact.phone}`} className="font-medium text-[#1b98d5] hover:underline">
                            {foundation.contact.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {foundation.contact.address && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Adresse</p>
                          <p className="text-sm text-gray-900">{foundation.contact.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Past Projects */}
              {foundation.pastProjects && foundation.pastProjects.length > 0 && (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900">Vergangene Projekte</h5>
                  </div>
                  <div className="space-y-3">
                    {foundation.pastProjects.slice(0, 3).map((project, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-gray-900 mb-1">{project.name}</h6>
                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-medium rounded">
                                💰 {project.funded_amount.toLocaleString('de-DE')}€
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 font-medium rounded capitalize">
                                {project.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Website */}
              {foundation.website && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900">Weitere Informationen</h5>
                  </div>
                  <a 
                    href={foundation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all group"
                  >
                    <span className="font-medium text-[#1b98d5] group-hover:text-[#0065bd]">Website besuchen</span>
                    <svg className="w-5 h-5 text-[#1b98d5] group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
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
      )}

      {/* Match Analysis - Only show when NOT expanded */}
      {!isExpanded && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Match-Analyse</h4>
          <div className="grid grid-cols-3 gap-4 mb-5">
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
          
          {/* Details Button */}
          <button
            onClick={onToggleExpand}
            className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-[#1b98d5] hover:text-[#1b98d5] transition-all font-medium flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Alle Details ansehen</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

