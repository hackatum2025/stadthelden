export function ProjectMigrationBanner() {
  return (
    <div className="border-b border-amber-300/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 px-3 py-2.5 text-[13px] text-amber-950 shadow-[0_2px_12px_rgba(120,53,15,0.08)] sm:px-4 sm:py-3 sm:text-base">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <span className="mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.22)] sm:mt-1 sm:h-2.5 sm:w-2.5"></span>
          <p className="break-words leading-relaxed sm:leading-snug">
            Das Projekt "Stadthelden München" ist jetzt Teil des{" "}
            <a
              href="https://tum-socialaiclub.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-amber-700 decoration-2 underline-offset-2 transition-colors hover:text-amber-800"
            >
              TUM Social AI Club
            </a>
            .
            <br />
            Um bei aktuellen Entwicklungen auf dem Laufenden zu bleiben, folge dem TUM Social AI
            Club auf{" "}
            <a
              href="https://www.linkedin.com/company/tumsocialaiclub"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-amber-700 decoration-2 underline-offset-2 transition-colors hover:text-amber-800"
            >
              LinkedIn
            </a>{" "}
            oder besuche unsere{" "}
            <a
              href="https://tum-socialaiclub.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-amber-700 decoration-2 underline-offset-2 transition-colors hover:text-amber-800"
            >
              Website
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}