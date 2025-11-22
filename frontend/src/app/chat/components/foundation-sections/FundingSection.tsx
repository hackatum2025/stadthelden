import type { FundingAmount } from "../FoundationCard";

type FundingSectionProps = {
  foerderhoehe: FundingAmount;
};

export const FundingSection = ({ foerderhoehe }: FundingSectionProps) => {
  return (
    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h5 className="text-lg font-semibold text-gray-900">Förderhöhe</h5>
        <span className="ml-auto px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-medium rounded-full capitalize">
          {foerderhoehe.category}
        </span>
      </div>
      
      {/* Bar Chart Visualization */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-gray-600">Minimum</span>
            <span className="text-lg font-bold text-gray-900">
              {foerderhoehe.min_amount.toLocaleString('de-DE')} €
            </span>
          </div>
          <div className="h-3 bg-emerald-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-400 rounded-full"
              style={{ 
                width: `${(foerderhoehe.min_amount / foerderhoehe.max_amount) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {foerderhoehe.average_amount && (
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-gray-600">Durchschnitt</span>
              <span className="text-lg font-bold text-gray-900">
                {foerderhoehe.average_amount.toLocaleString('de-DE')} €
              </span>
            </div>
            <div className="h-3 bg-emerald-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ 
                  width: `${(foerderhoehe.average_amount / foerderhoehe.max_amount) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-gray-600">Maximum</span>
            <span className="text-lg font-bold text-gray-900">
              {foerderhoehe.max_amount.toLocaleString('de-DE')} €
            </span>
          </div>
          <div className="h-3 bg-emerald-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

