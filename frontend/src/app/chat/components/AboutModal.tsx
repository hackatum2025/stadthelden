"use client";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors group"
          aria-label="Close modal"
        >
          <svg 
            className="w-6 h-6 text-gray-700 group-hover:text-gray-900" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        {/* Content */}
        <div className="mt-2 max-h-[70vh] overflow-y-auto pr-2">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Über Stadthelden</h2>
          
          {/* Problem Statement */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Das Problem</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                Ein Mitglied unseres Teams hatte eine großartige Idee für ein soziales Projekt, stieß aber bei der 
                Finanzierung auf eine Mauer. Wir haben erkannt, dass gemeinnützige Stiftungen überraschend schwer 
                zu finden sind. Ihre Informationen sind oft verstreut, veraltet oder in Papierkram vergraben.
              </p>
              <p>
                Wir haben eine klare Lücke gesehen. Es gibt Ressourcen, aber die Brücke zwischen <span className="font-semibold text-[#1b98d5]">"Idee"</span> und <span className="font-semibold text-[#1b98d5]">"Förderung"</span> ist gebrochen. 
                Da wir die richtigen Fähigkeiten hatten (KI, Web-Scraping und Full-Stack-Entwicklung), haben wir beschlossen, 
                diese Brücke selbst zu bauen.
              </p>
              <p>
                Die meisten Plattformen konzentrieren sich nur auf die Begünstigten. Wir konzentrieren uns auf die <span className="font-semibold">Veränderer</span>. 
                Wir stärken die Helfer, unterstützen die Unterstützer und ermöglichen den Menschen, die tatsächlich Veränderungen vorantreiben.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-4">
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Unser Team</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                Wir sind vier Master-Studierende der Technischen Universität München (TUM):
              </p>
              <ul className="grid grid-cols-2 gap-3 text-gray-800">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1b98d5] rounded-full"></span>
                  Leonie Merkl
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1b98d5] rounded-full"></span>
                  Lars Heimann
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1b98d5] rounded-full"></span>
                  Simon Karan
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1b98d5] rounded-full"></span>
                  Julian Sibbing
                </li>
              </ul>
              <p className="pt-2">
                Dieses Projekt wurde in nur zwei Tagen beim{" "}
                <a 
                  href="https://hack.tum.de/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#1b98d5] font-semibold hover:underline"
                >
                  HackaTUM
                </a>
                {" "}entwickelt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

