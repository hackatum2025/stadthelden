import type { RequiredDocument } from "@/app/chat/components/FoundationCard";
import type { DocumentDraft } from "../page";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentEditor } from "./DocumentEditor";

type DocumentWorkspaceProps = {
  documents: RequiredDocument[];
  documentDrafts: DocumentDraft[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  onDraftChange: (index: number, content: string) => void;
  onImprovementsUpdate: (index: number, improvements: string[]) => void;
  foundationName: string;
};

export const DocumentWorkspace = ({
  documents,
  documentDrafts,
  activeIndex,
  onTabChange,
  onDraftChange,
  onImprovementsUpdate,
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
        <div className="max-w-6xl mx-auto p-8">
          <DocumentHeader 
            document={activeDocument} 
            improvements={activeDraft?.improvements}
          />
          
          <DocumentEditor
            draft={activeDraft}
            documentType={activeDocument.document_type}
            onContentChange={(content) => onDraftChange(activeIndex, content)}
            onImprovementsUpdate={(improvements) => onImprovementsUpdate(activeIndex, improvements)}
          />
        </div>
      </div>
    </div>
  );
};

