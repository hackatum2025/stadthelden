import type { RequiredDocument } from "@/app/chat/components/FoundationCard";

type DocumentHeaderProps = {
  document: RequiredDocument;
  improvements?: string[];
};

export const DocumentHeader = ({ document, improvements }: DocumentHeaderProps) => {

  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize mb-2">
            {document?.document_type}
          </h2>
          <p className="text-gray-600">{document?.description}</p>
        </div>
      </div>
    </div>
  );
};

