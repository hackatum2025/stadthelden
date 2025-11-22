import type { FundingAmount } from "../FoundationCard";

type FundingSectionProps = {
  foerderhoehe: FundingAmount;
};

export const FundingSection = ({ foerderhoehe }: FundingSectionProps) => {
  return (
    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h5 className="text-lg font-semibold text-gray-900">Förderhöhe</h5>
        <span className="ml-auto px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full capitalize">
          {foerderhoehe.category}
        </span>
      </div>
      
      {/* Single Bar Chart Visualization */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-900">
            {foerderhoehe.min_amount.toLocaleString('de-DE')} € - {foerderhoehe.max_amount.toLocaleString('de-DE')} €
            </span>
        </div>

        {/* Bar with highlighted range */}
        <div className="relative h-5 bg-blue-100 rounded-full overflow-hidden">
          {/* Highlighted funding range */}
              <div 
            className="absolute h-full bg-[#1b98d5] rounded-full"
                style={{ 
              left: `${(foerderhoehe.min_amount / 50000) * 100}%`,
              width: `${((foerderhoehe.max_amount - foerderhoehe.min_amount) / 50000) * 100}%`
                }}
              ></div>
            </div>
        
        {/* Scale labels */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>0 €</span>
          <span>50.000 €</span>
        </div>
      </div>
    </div>
  );
};

