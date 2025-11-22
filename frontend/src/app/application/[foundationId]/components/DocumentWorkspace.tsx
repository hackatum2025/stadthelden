import type { RequiredDocument } from "@/app/chat/components/FoundationCard";

type DocumentWorkspaceProps = {
  documents: RequiredDocument[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  foundationName: string;
};

export const DocumentWorkspace = ({
  documents,
  activeIndex,
  onTabChange,
  foundationName
}: DocumentWorkspaceProps) => {
  const activeDocument = documents[activeIndex];

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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dokument erstellen
              </label>
              <textarea
                className="w-full min-h-[500px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b98d5] focus:border-transparent resize-y"
                placeholder="Beginne mit dem Schreiben oder frage den Chat-Assistenten um Hilfe..."
              />
            </div>

            {/* Helper Tools */}
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-[#1b98d5] hover:text-[#1b98d5] transition-all font-medium cursor-pointer">
                Vorlage verwenden
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-[#1b98d5] hover:text-[#1b98d5] transition-all font-medium cursor-pointer">
                Beispiel anzeigen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

