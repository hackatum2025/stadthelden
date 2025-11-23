import Image from "next/image";
import { useRouter } from "next/navigation";
import { FoundationCardExpanded } from "./FoundationCardExpanded";

export type MatchItem = {
  text: string;
  type: "fit" | "mismatch" | "question";
};

export type RequiredDocument = {
  document_type: string;
  description: string;
  required: boolean;
};

export type ApplicationProcess = {
  deadline_type: string;
  deadline_date?: string;
  rolling_info?: string;
  required_documents: RequiredDocument[];
  evaluation_process: string;
  decision_timeline: string;
};

export type GeographicArea = {
  scope: string;
  specific_areas: string[];
  restrictions?: string;
};

export type FundingAmount = {
  category: string | null;
  min_amount: number | null;
  max_amount: number | null;
  average_amount?: number | null;
  total_budget?: number | null;
};

export type ContactInfo = {
  email: string;
  phone?: string;
  address?: string;
  name?: string;
};

export type Project = {
  id?: string;
  name: string;
  description: string;
  image_url?: string;
  foundation_id?: string;
  funded_amount: number;
  year?: number;
  duration?: {
    start_date: string;
    end_date?: string;
    duration_months: number;
  };
  status?: string;
  outcomes?: string;
  website_url?: string;
};

export type Foundation = {
  id: string;
  name: string;
  logo: string;
  purpose: string;
  description: string;
  fundingAmount: string;
  matches: MatchItem[];
  // Full foundation details
  matchScore?: number;
  longDescription?: string;
  legalForm?: string;
  gemeinnuetzigeZwecke?: string[];
  antragsprozess?: ApplicationProcess;
  foerderbereich?: GeographicArea;
  foerderhoehe?: FundingAmount;
  contact?: ContactInfo;
  pastProjects?: Project[];
  website?: string;
};

const MatchIcon = ({ type }: { type: MatchItem["type"] }) => {
  if (type === "fit") {
    return (
      <svg className="w-5 h-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === "mismatch") {
    return (
      <svg className="w-5 h-5 flex-shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 flex-shrink-0 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
};

export const FoundationCard = ({
  foundation,
  isExpanded,
  onToggleExpand
}: {
  foundation: Foundation;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  const router = useRouter();
  const fits = foundation.matches.filter((m) => m.type === "fit");
  const mismatches = foundation.matches.filter((m) => m.type === "mismatch");
  const questions = foundation.matches.filter((m) => m.type === "question");

  const handleStartApplication = () => {
    router.push(`/application/${foundation.id}`);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-500 p-6 ${isExpanded ? '' : 'mb-4'
      } animate-fadeIn`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-white border-2 border-[#1b98d5] p-2">
          <Image src={foundation.logo} alt={foundation.name} width={80} height={80} className="w-full h-full" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{foundation.name}</h3>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {(() => {
              switch (foundation.purpose) {
                case "die Förderung von Wissenschaft und Forschung":
                  return "Wissenschaft und Forschung";
                case "die Förderung der Religion":
                  return "Religion";
                case "die Förderung des öffentlichen Gesundheitswesens und der öffentlichen Gesundheitspflege, insbesondere die Verhütung und Bekämpfung von übertragbaren Krankheiten, auch durch Krankenhäuser im Sinne des § 67, und von Tierseuchen":
                  return "Öffentliches Gesundheitswesen";
                case "die Förderung der Jugend- und Altenhilfe":
                  return "Jugend- und Altenhilfe";
                case "die Förderung von Kunst und Kultur":
                  return "Kunst und Kultur";
                case "die Förderung des Denkmalschutzes und der Denkmalpflege":
                  return "Denkmalschutz und Denkmalpflege";
                case "die Förderung der Erziehung, Volks- und Berufsbildung einschließlich der Studentenhilfe":
                  return "Bildung und Erziehung";
                case "die Förderung des Naturschutzes und der Landschaftspflege im Sinne des Bundesnaturschutzgesetzes und der Naturschutzgesetze der Länder, des Umweltschutzes, einschließlich des Klimaschutzes, des Küstenschutzes und des Hochwasserschutzes":
                  return "Natur- und Umweltschutz";
                case "die Förderung des Wohlfahrtswesens, insbesondere der Zwecke der amtlich anerkannten Verbände der freien Wohlfahrtspflege (§ 23 der Umsatzsteuer-Durchführungsverordnung), ihrer Unterverbände und ihrer angeschlossenen Einrichtungen und Anstalten":
                  return "Wohlfahrtswesen";
                case "die Förderung der Hilfe für politisch, rassistisch oder religiös Verfolgte, für Flüchtlinge, Vertriebene, Aussiedler, Spätaussiedler, Kriegsopfer, Kriegshinterbliebene, Kriegsbeschädigte und Kriegsgefangene, Zivilbeschädigte und Behinderte sowie Hilfe für Opfer von Straftaten; Förderung des Andenkens an Verfolgte, Kriegs- und Katastrophenopfer; Förderung des Suchdienstes für Vermisste, Förderung der Hilfe für Menschen, die auf Grund ihrer geschlechtlichen Identität oder ihrer geschlechtlichen Orientierung diskriminiert werden":
                  return "Hilfe für Verfolgte und Opfer";
                case "die Förderung der Rettung aus Lebensgefahr":
                  return "Rettung aus Lebensgefahr";
                case "die Förderung des Feuer-, Arbeits-, Katastrophen- und Zivilschutzes sowie der Unfallverhütung":
                  return "Katastrophen- und Zivilschutz";
                case "die Förderung internationaler Gesinnung, der Toleranz auf allen Gebieten der Kultur und des Völkerverständigungsgedankens":
                  return "Internationale Zusammenarbeit";
                case "die Förderung des Tierschutzes":
                  return "Tierschutz";
                case "die Förderung der Entwicklungszusammenarbeit":
                  return "Entwicklungszusammenarbeit";
                case "die Förderung von Verbraucherberatung und Verbraucherschutz":
                  return "Verbraucherschutz";
                case "die Förderung der Fürsorge für Strafgefangene und ehemalige Strafgefangene":
                  return "Fürsorge für Strafgefangene";
                case "die Förderung der Gleichberechtigung von Frauen und Männern":
                  return "Gleichberechtigung";
                case "die Förderung des Schutzes von Ehe und Familie":
                  return "Schutz von Ehe und Familie";
                case "die Förderung der Kriminalprävention":
                  return "Kriminalprävention";
                case "die Förderung des Sports (Schach gilt als Sport)":
                  return "Sport";
                case "die Förderung der Heimatpflege, Heimatkunde und der Ortsverschönerung":
                  return "Heimatpflege";
                case "die Förderung der Tierzucht, der Pflanzenzucht, der Kleingärtnerei, des traditionellen Brauchtums einschließlich des Karnevals, der Fastnacht und des Faschings, der Soldaten- und Reservistenbetreuung, des Amateurfunkens, des Freifunks, des Modellflugs und des Hundesports":
                  return "Brauchtum und Tradition";
                case "die allgemeine Förderung des demokratischen Staatswesens im Geltungsbereich dieses Gesetzes; hierzu gehören nicht Bestrebungen, die nur bestimmte Einzelinteressen staatsbürgerlicher Art verfolgen oder die auf den kommunalpolitischen Bereich beschränkt sind":
                  return "Demokratisches Staatswesen";
                case "die Förderung des bürgerschaftlichen Engagements zugunsten gemeinnütziger, mildtätiger und kirchlicher Zwecke":
                  return "Bürgerschaftliches Engagement";
                case "die Förderung der Unterhaltung und Pflege von Friedhöfen und die Förderung der Unterhaltung von Gedenkstätten für nichtbestattungspflichtige Kinder und Föten":
                  return "Friedhofspflege";
                case "die Förderung wohngemeinnütziger Zwecke; dies ist die vergünstigte Wohnraumüberlassung an Personen im Sinne des § 53. § 53 Nummer 2 ist mit der Maßgabe anzuwenden, dass die Bezüge nicht höher sein dürfen als das Fünffache des Regelsatzes der Sozialhilfe im Sinne des § 28 des Zwölften Buches Sozialgesetzbuch; beim Alleinstehenden oder Alleinerziehenden tritt an die Stelle des Fünffachen das Sechsfache des Regelsatzes. Die Hilfebedürftigkeit muss zu Beginn des jeweiligen Mietverhältnisses vorliegen":
                  return "Bezahlbarer Wohnraum";
                default:
                  return foundation.purpose;
              }
            })()}
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="px-6 py-3 bg-white/30 backdrop-blur-sm text-gray-900 text-xl font-bold rounded-lg border border-white/50">
            {foundation.fundingAmount}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className={`text-gray-600 text-sm mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {foundation.description}
      </p>

      {/* Expanded Content */}
      {isExpanded ? (
        <FoundationCardExpanded
          foundation={foundation}
          onToggleExpand={onToggleExpand}
          onStartApplication={handleStartApplication}
        />
      ) : (
        // Collapsed View - Matches Summary
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Fits */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-green-700 mb-2">Passt gut</div>
              <div className="space-y-1 flex-1">
                {fits.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <MatchIcon type="fit" />
                    <span className="text-xs text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="h-6 flex items-end mt-2">
                {fits.length > 2 && (
                  <div className="text-xs text-green-600 font-medium">
                    +{fits.length - 2} weitere
                  </div>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-yellow-700 mb-2">Zu klären</div>
              <div className="space-y-1 flex-1">
                {questions.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <MatchIcon type="question" />
                    <span className="text-xs text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="h-6 flex items-end mt-2">
                {questions.length > 2 && (
                  <div className="text-xs text-yellow-600 font-medium">
                    +{questions.length - 2} weitere
                  </div>
                )}
              </div>
            </div>

            {/* Mismatches */}
            <div className="flex flex-col">
              <div className="text-xs font-medium text-red-700 mb-2">Achtung</div>
              <div className="space-y-1 flex-1">
                {mismatches.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <MatchIcon type="mismatch" />
                    <span className="text-xs text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="h-6 flex items-end mt-2">
                {mismatches.length > 2 && (
                  <div className="text-xs text-red-600 font-medium">
                    +{mismatches.length - 2} weitere
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Button */}
          {!isExpanded && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onToggleExpand}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:border-[#1b98d5] hover:text-[#1b98d5] transition-all duration-300 font-medium flex items-center justify-center gap-2 group cursor-pointer"
              >
                Alle Details ansehen
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
