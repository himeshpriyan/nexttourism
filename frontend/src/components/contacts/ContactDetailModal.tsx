import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  Building,
  MapPin,
  FileText,
  Tag,
  Calendar,
  Share2,
  Edit,
  Trash2,
  Star,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import type { Contact } from '../../types/contact';
import { useContacts } from '../../context/ContactContext';
import { useToast } from '../../context/ToastContext';
import {
  getAvatarGradient,
  getInitials,
  getCallUrl,
  getWhatsAppUrl,
  getSmsUrl,
  getMailtoUrl,
  formatPhoneDisplay,
} from '../../utils/phoneUtils';
import { CategoryBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const ContactDetailModal: React.FC = () => {
  const { selectedContact, closeDetailModal, openEditModal, deleteContact, toggleFavorite, exportContactsVCF } = useContacts();
  const { showToast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCardZoom, setShowCardZoom] = useState(false);

  if (!selectedContact) return null;

  const gradient = getAvatarGradient(selectedContact.name);
  const initials = getInitials(selectedContact.name);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedContact.name}?`)) {
      deleteContact(selectedContact.id);
      closeDetailModal();
    }
  };

  const handleEdit = () => {
    const contactToEdit: Contact = { ...selectedContact };
    closeDetailModal();
    openEditModal(contactToEdit);
  };

  return (
    <>
      <Modal
        isOpen={Boolean(selectedContact)}
        onClose={closeDetailModal}
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Header Profile Section */}
          <div className="flex flex-col items-center text-center -mt-2">
            <div className="relative mb-3">
              <div
                className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${gradient} text-white font-extrabold text-2xl flex items-center justify-center shadow-lg`}
              >
                {initials}
              </div>
              <button
                onClick={() => toggleFavorite(selectedContact.id)}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white shadow-md border border-slate-200 text-amber-400 hover:scale-110 transition"
                aria-label="Toggle Favorite"
              >
                <Star
                  className={`w-4 h-4 ${
                    selectedContact.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {selectedContact.name}
            </h3>

            {(selectedContact.designation || selectedContact.company) && (
              <p className="text-sm font-medium text-slate-600 mt-0.5">
                {selectedContact.designation}
                {selectedContact.designation && selectedContact.company ? ' • ' : ''}
                {selectedContact.company}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2.5">
              <CategoryBadge category={selectedContact.category} size="md" />
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                Source: {selectedContact.source}
              </span>
            </div>
          </div>

          {/* Big Touch Action Buttons */}
          <div className="grid grid-cols-4 gap-2 py-1">
            {/* Call */}
            <a
              href={getCallUrl(selectedContact.phone)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 font-semibold text-xs border border-emerald-200/80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Phone className="w-4 h-4" />
              </div>
              <span>Call</span>
            </a>

            {/* WhatsApp */}
            <a
              href={getWhatsAppUrl(selectedContact.phone, selectedContact.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span>WhatsApp</span>
            </a>

            {/* SMS */}
            <a
              href={getSmsUrl(selectedContact.phone)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-700 font-semibold text-xs border border-sky-200/80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span>SMS</span>
            </a>

            {/* vCard / Share */}
            <button
              onClick={() => exportContactsVCF(selectedContact)}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 font-semibold text-xs border border-indigo-200/80 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Share2 className="w-4 h-4" />
              </div>
              <span>vCard</span>
            </button>
          </div>

          {/* Details Section List */}
          <div className="space-y-3 text-sm">
            {/* Phone Numbers */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white text-indigo-600 flex items-center justify-center shadow-2xs">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Mobile Number
                    </p>
                    <p className="font-semibold text-slate-900 font-mono">
                      {formatPhoneDisplay(selectedContact.phone)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(selectedContact.phone, 'Mobile Number')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition"
                  title="Copy Phone"
                >
                  {copiedField === 'Mobile Number' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {selectedContact.alternatePhone && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white text-slate-500 flex items-center justify-center shadow-2xs">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Alternate Number
                      </p>
                      <p className="font-semibold text-slate-900 font-mono">
                        {formatPhoneDisplay(selectedContact.alternatePhone)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedContact.alternatePhone!, 'Alternate Number')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition"
                    title="Copy Alternate Phone"
                  >
                    {copiedField === 'Alternate Number' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            {selectedContact.email && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white text-indigo-600 flex items-center justify-center shadow-2xs shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
                    <a
                      href={getMailtoUrl(selectedContact.email)}
                      className="font-semibold text-indigo-600 hover:underline truncate block"
                    >
                      {selectedContact.email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(selectedContact.email!, 'Email')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition shrink-0"
                  title="Copy Email"
                >
                  {copiedField === 'Email' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Company / Institution */}
            {(selectedContact.company || selectedContact.designation) && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white text-indigo-600 flex items-center justify-center shadow-2xs shrink-0">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Organization / Role</p>
                    <p className="font-semibold text-slate-900">
                      {selectedContact.company || 'Not specified'}
                    </p>
                    {selectedContact.designation && (
                      <p className="text-xs text-slate-500 font-medium">
                        {selectedContact.designation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            {selectedContact.address && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white text-indigo-600 flex items-center justify-center shadow-2xs shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Address</p>
                    <p className="font-medium text-slate-800 text-xs sm:text-sm">
                      {selectedContact.address}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selectedContact.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-indigo-600 hover:bg-white rounded-lg transition shrink-0"
                  title="Open in Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Notes */}
            {selectedContact.notes && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase text-slate-400">Notes</p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line pl-5.5 font-medium">
                  {selectedContact.notes}
                </p>
              </div>
            )}

            {/* Tags */}
            {selectedContact.tags && selectedContact.tags.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[10px] font-bold uppercase text-slate-400">Tags</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-5.5">
                  {selectedContact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visiting Card Scan Image */}
            {selectedContact.visitingCardImage && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <p className="text-[10px] font-bold uppercase text-slate-400">Scanned Visiting Card</p>
                  </div>
                  <button
                    onClick={() => setShowCardZoom(true)}
                    className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    View Full Card
                  </button>
                </div>
                <div
                  onClick={() => setShowCardZoom(true)}
                  className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition max-h-36 flex items-center justify-center bg-white"
                >
                  <img
                    src={selectedContact.visitingCardImage}
                    alt="Visiting Card"
                    className="w-full object-contain max-h-36"
                  />
                </div>
              </div>
            )}

            {/* Timestamp metadata */}
            <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Added {new Date(selectedContact.createdAt).toLocaleDateString()}
              </span>
              <span>Updated {new Date(selectedContact.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Footer: Edit & Delete */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs sm:text-sm rounded-xl border border-rose-200/60 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={handleEdit}
              className="flex-2 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Contact</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Card Image Zoom Modal */}
      {showCardZoom && selectedContact.visitingCardImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowCardZoom(false)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img
              src={selectedContact.visitingCardImage}
              alt="Visiting Card Full"
              className="w-full object-contain max-h-[80vh] rounded-xl"
            />
            <p className="text-center text-xs text-slate-500 py-2 font-medium">
              Tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </>
  );
};
