export const ProjectAnalysisLoader = () => {
  return (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <div className="text-center animate-fadeIn">
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-[#1b98d5]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#1b98d5] rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 border-4 border-[#0065bd]/30 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analysiere deine Projektidee
        </h2>
        <p className="text-gray-600">
          Wir durchsuchen Tausende von Stiftungen für dich
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <span className="w-3 h-3 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-3 h-3 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
          <span className="w-3 h-3 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
        </div>
      </div>
    </div>
  );
};

