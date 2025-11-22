import type { ApplicationProcess } from "../FoundationCard";

type ApplicationProcessSectionProps = {
  antragsprozess: ApplicationProcess;
};

export const ApplicationProcessSection = ({ antragsprozess }: ApplicationProcessSectionProps) => {
  return (
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
              {antragsprozess.deadline_type === "fixed" ? (
                <>Fester Termin: {antragsprozess.deadline_date ? new Date(antragsprozess.deadline_date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }) : antragsprozess.deadline_date}</>
              ) : (
                <>Laufende Bewerbung - {antragsprozess.rolling_info}</> 
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Entscheidungszeitraum</p>
            <p className="text-sm font-medium text-gray-900">{antragsprozess.decision_timeline}</p>
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
        <p className="text-sm text-gray-700 pl-7">{antragsprozess.evaluation_process}</p>
      </div>

      {/* Required Documents */}
      {antragsprozess.required_documents && antragsprozess.required_documents.length > 0 && (
        <div>
          <h6 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Erforderliche Unterlagen
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {antragsprozess.required_documents.map((doc, idx) => (
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
  );
};

