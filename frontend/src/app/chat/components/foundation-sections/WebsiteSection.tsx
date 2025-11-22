type WebsiteSectionProps = {
  website: string;
};

export const WebsiteSection = ({ website }: WebsiteSectionProps) => {
  return (
    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <h5 className="text-lg font-semibold text-gray-900">Website</h5>
      </div>
      <a 
        href={website} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[#1b98d5] hover:text-[#0065bd] font-medium transition-colors group"
      >
        <span className="break-all">{website}</span>
        <svg className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
};

