export function LoadingState({ message = "Lade Stiftungen..." }: { message?: string }) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b98d5] mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

