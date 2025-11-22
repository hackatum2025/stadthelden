import type { ContactInfo } from "../FoundationCard";

type ContactSectionProps = {
  contact: ContactInfo;
};

export const ContactSection = ({ contact }: ContactSectionProps) => {
  return (
    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h5 className="text-lg font-semibold text-gray-900">Kontakt</h5>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="space-y-3">
          {contact.name && (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">Ansprechperson</p>
                <p className="font-medium text-gray-900">{contact.name}</p>
              </div>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">E-Mail</p>
                <a href={`mailto:${contact.email}`} className="font-medium text-[#1b98d5] hover:text-[#0065bd] hover:underline">
                  {contact.email}
                </a>
              </div>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">Telefon</p>
                <a href={`tel:${contact.phone}`} className="font-medium text-[#1b98d5] hover:text-[#0065bd] hover:underline">
                  {contact.phone}
                </a>
              </div>
            </div>
          )}
          {contact.address && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-600">Adresse</p>
                <p className="font-medium text-gray-900 whitespace-pre-line">{contact.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

