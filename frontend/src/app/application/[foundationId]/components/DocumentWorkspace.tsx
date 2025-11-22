import type { RequiredDocument } from "@/app/chat/components/FoundationCard";
import type { DocumentDraft } from "../page";

type DocumentWorkspaceProps = {
  documents: RequiredDocument[];
  documentDrafts: DocumentDraft[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  onDraftChange: (index: number, content: string) => void;
  foundationName: string;
};

export const DocumentWorkspace = ({
  documents,
  documentDrafts,
  activeIndex,
  onTabChange,
  onDraftChange,
  foundationName
}: DocumentWorkspaceProps) => {
  const activeDocument = documents[activeIndex];
  const activeDraft = documentDrafts[activeIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-2 overflow-x-auto">
          {documents.map((doc, index) => (
            <button
              key={index}
              onClick={() => onTabChange(index)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                index === activeIndex
                  ? 'border-[#1b98d5] text-[#1b98d5]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {doc.required && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                <span className="capitalize">{doc.document_type}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Document Editor */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto p-8">
          {/* Document Info */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                  {activeDocument?.document_type}
                </h2>
                <p className="text-gray-600">{activeDocument?.description}</p>
              </div>
              {activeDocument?.required && (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  Pflichtfeld
                </span>
              )}
            </div>
          </div>

          {/* Editor Area */}
          <div className="space-y-4">
            {/* Text Editor */}
            <div>
              <textarea
                value={activeDraft?.content || ""}
                onChange={(e) => onDraftChange(activeIndex, e.target.value)}
                className="w-full min-h-[500px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b98d5] focus:border-transparent resize-y text-sm leading-relaxed"
                placeholder="Beginne mit dem Schreiben oder bearbeite den KI-generierten Entwurf"
              />
            </div>

            {/* Helper Info */}
            {activeDraft?.content.includes("[FRAGE:") && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Fragen im Entwurf gefunden
                    </h4>
                    <p className="text-sm text-blue-700">
                      Der KI-Assistent hat Fragen ([FRAGE: ...]) eingefügt, um dir zu helfen, fehlende Informationen zu ergänzen. 
                      Beantworte diese Fragen direkt im Text.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

