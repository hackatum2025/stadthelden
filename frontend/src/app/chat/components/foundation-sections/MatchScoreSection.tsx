type MatchScoreSectionProps = {
  matchScore: number;
};

export const MatchScoreSection = ({ matchScore }: MatchScoreSectionProps) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h5 className="text-lg font-semibold text-gray-900">Übereinstimmung</h5>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-white rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${matchScore * 100}%` }}
          ></div>
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {Math.round(matchScore * 100)}%
        </span>
      </div>
    </div>
  );
};

