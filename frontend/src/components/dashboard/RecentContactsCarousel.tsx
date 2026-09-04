import React from 'react';
import { Phone, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useContacts } from '../../context/ContactContext';
import { getAvatarGradient, getInitials, getCallUrl, getWhatsAppUrl } from '../../utils/phoneUtils';
import { CategoryBadge } from '../common/Badge';

export const RecentContactsCarousel: React.FC = () => {
  const { recentContacts, openDetailModal, setActiveTab } = useContacts();

  if (recentContacts.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Recent Contacts
          </h3>
        </div>
        <button
          onClick={() => setActiveTab('contacts')}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {recentContacts.slice(0, 6).map((contact) => {
          const gradient = getAvatarGradient(contact.name);
          const initials = getInitials(contact.name);

          return (
            <div
              key={contact.id}
              onClick={() => openDetailModal(contact)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${gradient} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {contact.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {contact.designation || contact.company || contact.phone}
                  </p>
                  <div className="mt-2">
                    <CategoryBadge category={contact.category} size="sm" />
                  </div>
                </div>
              </div>

              {/* Quick Call & WhatsApp Touch Buttons */}
              <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                <a
                  href={getCallUrl(contact.phone)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200/60 transition"
                  title={`Call ${contact.name}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={getWhatsAppUrl(contact.phone, contact.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-xs"
                  title={`WhatsApp ${contact.name}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
