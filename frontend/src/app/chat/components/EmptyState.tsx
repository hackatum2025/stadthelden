export function EmptyState({ message = "Keine Stiftungen gefunden." }: { message?: string }) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

