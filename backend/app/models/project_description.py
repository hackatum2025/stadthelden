from enum import StrEnum
from pydantic import BaseModel, Field

class CharitablePurpose(StrEnum):
    """Charitable purposes from German tax law (§52 AO) - 27 official purposes"""
    SCIENCE_AND_RESEARCH = "die Förderung von Wissenschaft und Forschung"
    RELIGION = "die Förderung der Religion"
    PUBLIC_HEALTH = "die Förderung des öffentlichen Gesundheitswesens und der öffentlichen Gesundheitspflege, insbesondere die Verhütung und Bekämpfung von übertragbaren Krankheiten, auch durch Krankenhäuser im Sinne des § 67, und von Tierseuchen"
    YOUTH_AND_ELDERLY_CARE = "die Förderung der Jugend- und Altenhilfe"
    ART_AND_CULTURE = "die Förderung von Kunst und Kultur"
    MONUMENT_PROTECTION = "die Förderung des Denkmalschutzes und der Denkmalpflege"
    EDUCATION_AND_VOCATIONAL_TRAINING = "die Förderung der Erziehung, Volks- und Berufsbildung einschließlich der Studentenhilfe"
    NATURE_AND_ENVIRONMENTAL_PROTECTION = "die Förderung des Naturschutzes und der Landschaftspflege im Sinne des Bundesnaturschutzgesetzes und der Naturschutzgesetze der Länder, des Umweltschutzes, einschließlich des Klimaschutzes, des Küstenschutzes und des Hochwasserschutzes"
    WELFARE = "die Förderung des Wohlfahrtswesens, insbesondere der Zwecke der amtlich anerkannten Verbände der freien Wohlfahrtspflege (§ 23 der Umsatzsteuer-Durchführungsverordnung), ihrer Unterverbände und ihrer angeschlossenen Einrichtungen und Anstalten"
    AID_FOR_PERSECUTED_AND_VICTIMS = "die Förderung der Hilfe für politisch, rassistisch oder religiös Verfolgte, für Flüchtlinge, Vertriebene, Aussiedler, Spätaussiedler, Kriegsopfer, Kriegshinterbliebene, Kriegsbeschädigte und Kriegsgefangene, Zivilbeschädigte und Behinderte sowie Hilfe für Opfer von Straftaten; Förderung des Andenkens an Verfolgte, Kriegs- und Katastrophenopfer; Förderung des Suchdienstes für Vermisste, Förderung der Hilfe für Menschen, die auf Grund ihrer geschlechtlichen Identität oder ihrer geschlechtlichen Orientierung diskriminiert werden"
    RESCUE_FROM_DANGER = "die Förderung der Rettung aus Lebensgefahr"
    FIRE_AND_DISASTER_PROTECTION = "die Förderung des Feuer-, Arbeits-, Katastrophen- und Zivilschutzes sowie der Unfallverhütung"
    INTERNATIONAL_COOPERATION_AND_TOLERANCE = "die Förderung internationaler Gesinnung, der Toleranz auf allen Gebieten der Kultur und des Völkerverständigungsgedankens"
    ANIMAL_PROTECTION = "die Förderung des Tierschutzes"
    DEVELOPMENT_COOPERATION = "die Förderung der Entwicklungszusammenarbeit"
    CONSUMER_PROTECTION = "die Förderung von Verbraucherberatung und Verbraucherschutz"
    CARE_FOR_PRISONERS = "die Förderung der Fürsorge für Strafgefangene und ehemalige Strafgefangene"
    GENDER_EQUALITY = "die Förderung der Gleichberechtigung von Frauen und Männern"
    PROTECTION_OF_MARRIAGE_AND_FAMILY = "die Förderung des Schutzes von Ehe und Familie"
    CRIME_PREVENTION = "die Förderung der Kriminalprävention"
    SPORTS = "die Förderung des Sports (Schach gilt als Sport)"
    LOCAL_HERITAGE_AND_BEAUTIFICATION = "die Förderung der Heimatpflege, Heimatkunde und der Ortsverschönerung"
    ANIMAL_BREEDING_AND_TRADITIONAL_CUSTOMS = "die Förderung der Tierzucht, der Pflanzenzucht, der Kleingärtnerei, des traditionellen Brauchtums einschließlich des Karnevals, der Fastnacht und des Faschings, der Soldaten- und Reservistenbetreuung, des Amateurfunkens, des Freifunks, des Modellflugs und des Hundesports"
    DEMOCRATIC_STATE = "die allgemeine Förderung des demokratischen Staatswesens im Geltungsbereich dieses Gesetzes; hierzu gehören nicht Bestrebungen, die nur bestimmte Einzelinteressen staatsbürgerlicher Art verfolgen oder die auf den kommunalpolitischen Bereich beschränkt sind"
    CIVIC_ENGAGEMENT = "die Förderung des bürgerschaftlichen Engagements zugunsten gemeinnütziger, mildtätiger und kirchlicher Zwecke"
    CEMETERY_MAINTENANCE = "die Förderung der Unterhaltung und Pflege von Friedhöfen und die Förderung der Unterhaltung von Gedenkstätten für nichtbestattungspflichtige Kinder und Föten"
    AFFORDABLE_HOUSING = "die Förderung wohngemeinnütziger Zwecke; dies ist die vergünstigte Wohnraumüberlassung an Personen im Sinne des § 53. § 53 Nummer 2 ist mit der Maßgabe anzuwenden, dass die Bezüge nicht höher sein dürfen als das Fünffache des Regelsatzes der Sozialhilfe im Sinne des § 28 des Zwölften Buches Sozialgesetzbuch; beim Alleinstehenden oder Alleinerziehenden tritt an die Stelle des Fünffachen das Sechsfache des Regelsatzes. Die Hilfebedürftigkeit muss zu Beginn des jeweiligen Mietverhältnisses vorliegen"

class ProjectDescription(BaseModel):
    """Information needed to register a new user."""
    name: str = Field(..., description="Name of the project, can be left blank if not known yet")
    description: str = Field(..., description="Description of the project idea")
    target_group: str = Field(..., description="Target group of the project")
    charitable_purpose: CharitablePurpose = Field(..., description="Charitable purpose of the project")


