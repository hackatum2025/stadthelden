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
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Unsere Idee</h3>
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
                  <div className="flex items-center gap-2">
                    Leonie Merkl
                    <div className="flex gap-1">
                      <SocialLink href="https://www.linkedin.com/in/leoniemerkl/" type="linkedin" />
                      {/* <SocialLink href="#" type="github" /> */}
                    </div>
                  </div>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1b98d5] rounded-full"></span>
                  <div className="flex items-center gap-2">
                    Lars Heimann
                    <div className="flex gap-1">
                      <SocialLink href="https://www.linkedin.com/in/larsheimann/" type="linkedin" />
                      <SocialLink href="https://github.com/lars-heimann" type="github" />
                    </div>
                  </div>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1b98d5] rounded-full"></span>
                  <div className="flex items-center gap-2">
                    Simon Karan
                    <div className="flex gap-1">
                      <SocialLink href="https://www.linkedin.com/in/simonkaran/" type="linkedin" />
                      <SocialLink href="https://github.com/SimonKaran13" type="github" />
                    </div>
                  </div>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#1b98d5] rounded-full"></span>
                  <div className="flex items-center gap-2">
                    Julian Sibbing
                    <div className="flex gap-1">
                      <SocialLink href="https://www.linkedin.com/in/julian-sibbing-837363224/" type="linkedin" />
                      <SocialLink href="https://github.com/Mrjulss" type="github" />
                    </div>
                  </div>
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
                  HackaTUM 2025
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

function SocialLink({ href, type }: { href: string; type: 'linkedin' | 'github' }) {
  const paths = {
    linkedin: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    github: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-[#1b98d5] transition-colors"
      aria-label={type === 'linkedin' ? 'LinkedIn' : 'GitHub'}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d={paths[type]} />
      </svg>
    </a>
  );
}

