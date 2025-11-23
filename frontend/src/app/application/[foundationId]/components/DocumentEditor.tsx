import { useState } from "react";
import type { DocumentDraft } from "../page";
import { proofreadDocument } from "@/app/chat/services/api";

type DocumentEditorProps = {
  draft: DocumentDraft;
  documentType: string;
  onContentChange: (content: string) => void;
  onImprovementsUpdate: (improvements: string[]) => void;
};

export const DocumentEditor = ({
  draft,
  documentType,
  onContentChange,
  onImprovementsUpdate,
}: DocumentEditorProps) => {
  const [isProofreading, setIsProofreading] = useState(false);

  const handleProofread = async () => {
    if (!draft?.content) {
      alert("Bitte füge zuerst Text hinzu, bevor du ihn korrekturlesen lässt.");
      return;
    }

    setIsProofreading(true);
    try {
      const response = await proofreadDocument({
        document_text: draft.content,
        document_type: documentType,
        existing_improvements: draft.improvements || [],
      });

      if (response && response.success && response.improvements.length > 0) {
        // Replace improvements with new ones
        onImprovementsUpdate(response.improvements);
      } else {
        alert("Keine neuen Verbesserungsvorschläge gefunden.");
      }
    } catch (error) {
      console.error("Error proofreading document:", error);
      alert("Fehler beim Korrekturlesen. Bitte versuche es später erneut.");
    } finally {
      setIsProofreading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Text Editor - 2/3 width */}
      <div className="col-span-2 relative">
        {/* Proofreading Button */}
        <button
          onClick={handleProofread}
          disabled={isProofreading || !draft?.content}
          className="absolute top-2 right-2 z-10 p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Korrekturlesen"
        >
          {isProofreading ? (
            <svg className="w-5 h-5 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
          {/* Tooltip */}
          {!isProofreading && (
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Korrekturlesen
            </span>
          )}
        </button>
        
        <textarea
          value={draft?.content || ""}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full min-h-[500px] p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b98d5] focus:border-transparent resize-y text-sm leading-relaxed"
          placeholder="Beginne mit dem Schreiben oder bearbeite den KI-generierten Entwurf"
        />
      </div>

      {/* Improvements Panel - 1/3 width */}
      <div className="col-span-1">
        <div className="sticky top-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Verbesserungsvorschläge
          </h4>
          
          {draft?.improvements && draft.improvements.length > 0 ? (
            <ul className="space-y-3">
              {draft.improvements.map((improvement, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{improvement}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">
              Keine Verbesserungsvorschläge verfügbar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

