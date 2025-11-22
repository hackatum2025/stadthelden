"use client";

import { useState } from "react";
import type { DocumentDraft } from "../page";
import type { Foundation } from "@/app/chat/components/FoundationCard";

type SubmissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  foundation: Foundation;
  documents: DocumentDraft[];
};

export const SubmissionModal = ({
  isOpen,
  onClose,
  onSubmit,
  foundation,
  documents,
}: SubmissionModalProps) => {
  const [emailBody, setEmailBody] = useState(
    `Sehr geehrte Damen und Herren,

hiermit möchte ich mich für eine Förderung bei ${foundation.name} bewerben.

Im Anhang finden Sie die vollständigen Antragsunterlagen:
${documents.map((doc, idx) => `${idx + 1}. ${doc.document_type}`).join("\n")}

Für Rückfragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen`
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Antrag absenden</h2>
            <p className="text-sm text-gray-600 mt-1">
              Überprüfen Sie Ihre Unterlagen vor dem Absenden
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Email Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              An: {foundation.contact?.email || "kontakt@stiftung.de"}
            </label>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Betreff: Förderantrag - {foundation.name}
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nachricht:
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b98d5] focus:border-transparent resize-none text-sm"
              placeholder="E-Mail-Text eingeben"
            />
          </div>

          {/* Documents Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Angehängte Dokumente:
            </h3>
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#1b98d5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {doc.document_type}
                      </h4>
                    </div>
                    <span className="text-xs text-gray-500">
                      {doc.content.length} Zeichen
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                    {doc.content.substring(0, 300)}
                    {doc.content.length > 300 && "..."}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-600">
            {documents.length} Dokument(e) werden versendet
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-2 bg-gradient-to-r from-[#1b98d5] to-[#0065bd] text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              Jetzt absenden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

