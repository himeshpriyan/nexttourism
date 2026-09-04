import React from 'react';
import { Phone, MessageCircle, MoreHorizontal, Edit2, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import type { Contact } from '../../types/contact';
import { useContacts } from '../../context/ContactContext';
import { getAvatarGradient, getInitials, getCallUrl, getWhatsAppUrl, formatPhoneDisplay } from '../../utils/phoneUtils';
import { CategoryBadge } from '../common/Badge';

interface ContactCardProps {
  contact: Contact;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const { openDetailModal, openEditModal, deleteContact, toggleFavorite } = useContacts();
  const [showOptions, setShowOptions] = React.useState(false);

  const gradient = getAvatarGradient(contact.name);
  const initials = getInitials(contact.name);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      deleteContact(contact.id);
    }
  };

  return (
    <div
      onClick={() => openDetailModal(contact)}
      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden active:scale-[0.99]"
    >
      {/* Top Bar: Avatar, Info, and Options */}
      <div className="flex items-start gap-3.5">
        {/* Avatar / Photo */}
        <div className="relative shrink-0">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} text-white font-bold text-sm flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
          >
            {initials}
          </div>
          {contact.visitingCardImage && (
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-xs"
              title="Has Visiting Card"
            >
              <ImageIcon className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-base font-bold text-slate-900 truncate">
              {contact.name}
            </h4>
            {contact.isFavorite && (
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>

          {/* Designation & Company / Institution */}
          {(contact.designation || contact.company) && (
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {contact.designation ? contact.designation : ''}
              {contact.designation && contact.company ? ' • ' : ''}
              {contact.company ? contact.company : ''}
            </p>
          )}

          {/* Mobile Phone */}
          <p className="text-xs font-semibold text-slate-700 mt-1 font-mono tracking-wide">
            {formatPhoneDisplay(contact.phone)}
          </p>

          {/* Category Badge & Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <CategoryBadge category={contact.category} size="sm" />
            {contact.tags && contact.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {contact.tags && contact.tags.length > 2 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{contact.tags.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Action button menu */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions((p) => !p);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showOptions && (
            <>
              <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setShowOptions(false); }} />
              <div className="absolute right-0 top-8 mt-1 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in slide-in-from-top-2 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(false);
                    toggleFavorite(contact.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition text-left"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>{contact.isFavorite ? 'Unfavorite' : 'Add to Favorite'}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(false);
                    openEditModal(contact);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 rounded-xl transition text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Edit Contact</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Touch-Friendly Action Buttons Bottom Row */}
      <div className="grid grid-cols-2 gap-2 pt-3.5 mt-3.5 border-t border-slate-100">
        <a
          href={getCallUrl(contact.phone)}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200/60 transition shadow-2xs"
          title="Direct Call"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call</span>
        </a>

        <a
          href={getWhatsAppUrl(contact.phone, contact.name)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
          title="Direct WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
