import type { Foundation } from "../FoundationCard";

type OrganizationSectionProps = {
  foundation: Foundation;
};

export const OrganizationSection = ({ foundation }: OrganizationSectionProps) => {
  return (
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
  );
};

