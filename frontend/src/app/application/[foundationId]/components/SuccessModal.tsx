"use client";

import { useRouter } from "next/navigation";
import type { Foundation } from "@/app/chat/components/FoundationCard";

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  foundation: Foundation;
};

export const SuccessModal = ({ isOpen, onClose, foundation }: SuccessModalProps) => {
  const router = useRouter();

  const handleContinue = () => {
    onClose();
    router.push("/");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slideUp">
        {/* Success Icon with Animation */}
        <div className="relative bg-gradient-to-br from-[#1b98d5] to-[#0065bd] px-8 py-12 flex flex-col items-center">
          {/* Animated Checkmark */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
              <svg 
                className="w-14 h-14 text-[#1b98d5] animate-scaleIn" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>

          {/* Main Message */}
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            Dein Antrag ist unterwegs!
          </h2>
          <p className="text-white/90 text-lg text-center">
            {foundation.name}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* Impact Message */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Vielen Dank für deinen Antrag
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-2">
              Dein Antrag wurde erfolgreich an {foundation.name} übermittelt.
            </p>
            <p className="text-base text-gray-600">
              Die Stiftung wird deinen Antrag prüfen und sich in Kürze bei dir melden.
            </p>
          </div>

          {/* Status Info */}
          <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-100">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <svg className="w-8 h-8 text-[#1b98d5] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm font-medium text-gray-700">Antrag versendet</div>
              </div>
              <div className="w-px h-12 bg-blue-200"></div>
              <div className="text-center">
                <svg className="w-8 h-8 text-[#1b98d5] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-sm font-medium text-gray-700">In Bearbeitung</div>
              </div>
              <div className="w-px h-12 bg-blue-200"></div>
              <div className="text-center">
                <svg className="w-8 h-8 text-[#1b98d5] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="text-sm font-medium text-gray-700">Gesellschaftlicher Beitrag</div>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Nächste Schritte</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#1b98d5] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Du erhältst eine Bestätigungs-E-Mail mit allen Details</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#1b98d5] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Die Stiftung wird deinen Antrag in den kommenden Wochen prüfen</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#1b98d5] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Bei Fragen kannst du dich jederzeit an die Stiftung wenden</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#1b98d5] to-[#0065bd] text-white rounded-lg hover:shadow-xl transition-all font-semibold text-lg cursor-pointer"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    </div>
  );
};

