import type { FundingAmount } from "../FoundationCard";

type FundingSectionProps = {
  foerderhoehe: FundingAmount;
};

export const FundingSection = ({ foerderhoehe }: FundingSectionProps) => {
  // Helper to get default values based on category
  const getDefaultsFromCategory = (category: string | null) => {
    if (!category) return { min: 0, max: 0, scaleMax: 50000 };
    
    const cat = category.toLowerCase();
    if (cat === "large" || cat === "großförderung" || cat === "grossfoerderung") {
      return { min: 50000, max: 200000, scaleMax: 100000 };
    } else if (cat === "small" || cat === "kleinförderung" || cat === "kleinfoerderung") {
      return { min: 0, max: 5000, scaleMax: 5000 };
    } else if (cat === "medium" || cat === "mittelgroße förderung" || cat === "mittelgrosse foerderung") {
      return { min: 5000, max: 50000, scaleMax: 50000 };
    }
    return { min: 0, max: 0, scaleMax: 50000 };
  };

  // Handle null values with category-based fallbacks
  const category = foerderhoehe.category || null;
  const defaults = getDefaultsFromCategory(category);
  
  const minAmount = foerderhoehe.min_amount ?? defaults.min;
  const maxAmount = foerderhoehe.max_amount ?? defaults.max;
  const scaleMax = defaults.scaleMax;
  
  // Map category to display name
  const getCategoryDisplayName = (cat: string | null): string => {
    if (!cat) return "Nicht angegeben";
    const catLower = cat.toLowerCase();
    if (catLower === "large" || catLower === "großförderung" || catLower === "grossfoerderung") {
      return "Großförderung";
    } else if (catLower === "small" || catLower === "kleinförderung" || catLower === "kleinfoerderung") {
      return "Kleinförderung";
    } else if (catLower === "medium" || catLower === "mittelgroße förderung" || catLower === "mittelgrosse foerderung") {
      return "Mittelgroße Förderung";
    }
    return cat;
  };

  const categoryDisplay = getCategoryDisplayName(category);
  
  // Don't render if we don't have valid funding amounts and no category
  if (!minAmount && !maxAmount && !category) {
    return (
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h5 className="text-lg font-semibold text-gray-900">Förderhöhe</h5>
        </div>
        <p className="text-sm text-gray-600">Förderhöhe nicht angegeben</p>
      </div>
    );
  }

  // Calculate bar position and width
  const leftPercent = Math.max(0, Math.min(100, (minAmount / scaleMax) * 100));
  const widthPercent = Math.max(0, Math.min(100, ((maxAmount - minAmount) / scaleMax) * 100));

  return (
    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h5 className="text-lg font-semibold text-gray-900">Förderhöhe</h5>
        {categoryDisplay && categoryDisplay !== "Nicht angegeben" && (
          <span className="ml-auto px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
            {categoryDisplay}
          </span>
        )}
      </div>
      
      {/* Single Bar Chart Visualization */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-900">
            {minAmount.toLocaleString('de-DE')} € - {maxAmount.toLocaleString('de-DE')} €
          </span>
        </div>

        {/* Bar with highlighted range */}
        {minAmount >= 0 && maxAmount > minAmount && (
          <div className="relative h-5 bg-blue-100 rounded-full overflow-hidden">
            {/* Highlighted funding range */}
            <div 
              className="absolute h-full bg-[#1b98d5] rounded-full"
              style={{ 
                left: `${leftPercent}%`,
                width: `${widthPercent}%`
              }}
            ></div>
          </div>
        )}
        
        {/* Scale labels - dynamic based on category */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>0 €</span>
          <span>{scaleMax.toLocaleString('de-DE')} €</span>
        </div>
      </div>
    </div>
  );
};

