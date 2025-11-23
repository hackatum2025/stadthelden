export function FoundationsLoader({ message = "Lade Stiftungen" }: { message?: string }) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-8 flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="mb-8">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-[#1b98d5]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#1b98d5] rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 border-4 border-[#0065bd]/30 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-gray-600">
          Einen Moment bitte
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2.5 h-2.5 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
          <span className="w-2.5 h-2.5 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
        </div>
      </div>
    </div>
  );
}

