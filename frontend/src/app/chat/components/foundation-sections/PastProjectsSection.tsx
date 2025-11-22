import type { Project } from "../FoundationCard";

type PastProjectsSectionProps = {
  projects: Project[];
};

export const PastProjectsSection = ({ projects }: PastProjectsSectionProps) => {
  return (
    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h5 className="text-lg font-semibold text-gray-900">Geförderte Projekte</h5>
      </div>
      <div className="space-y-3">
        {projects.map((project, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 hover:border-amber-200 transition-colors">
            <h6 className="font-semibold text-gray-900 mb-2">{project.name}</h6>
            <p className="text-sm text-gray-700 mb-3">{project.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              {project.year && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{project.year}</span>
                </div>
              )}
              {project.funded_amount && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{project.funded_amount.toLocaleString('de-DE')} €</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

