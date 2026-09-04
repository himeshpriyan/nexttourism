import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Building,
  Briefcase,
  MapPin,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react';
import type { ContactSource } from '../../types/contact';
import { useContacts } from '../../context/ContactContext';
import { contactRepository } from '../../services/storage/HybridContactRepository';
import { Modal } from '../common/Modal';

export const ContactFormModal: React.FC = () => {
  const {
    isAddModalOpen,
    closeAddModal,
    editingContact,
    saveContact,
    updateContact,
    categories,
    allTags,
    addCategory,
  } = useContacts();

  // Form Fields State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [category, setCategory] = useState('Student');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [source, setSource] = useState<ContactSource>('Manual Entry');
  const [visitingCardImage, setVisitingCardImage] = useState<string | undefined>(undefined);

  // Custom inline category creator state
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Duplicate warning inline indicator
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or populate fields on open
  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '');
      setPhone(editingContact.phone || '');
      setAlternatePhone(editingContact.alternatePhone || '');
      setEmail(editingContact.email || '');
      setCompany(editingContact.company || '');
      setDesignation(editingContact.designation || '');
      setCategory(editingContact.category || 'Student');
      setAddress(editingContact.address || '');
      setNotes(editingContact.notes || '');
      setTags(editingContact.tags || []);
      setSource(editingContact.source || 'Manual Entry');
      setVisitingCardImage(editingContact.visitingCardImage);
    } else {
      // Clean form for add
      setName('');
      setPhone('');
      setAlternatePhone('');
      setEmail('');
      setCompany('');
      setDesignation('');
      setCategory('Student');
      setAddress('');
      setNotes('');
      setTags([]);
      setSource('Manual Entry');
      setVisitingCardImage(undefined);
    }
    setErrors({});
    setDuplicateWarning(null);
    setIsAddingCustomCategory(false);
    setCustomCategoryName('');
  }, [editingContact, isAddModalOpen]);

  // Real-time duplicate check when user enters phone
  const handlePhoneBlur = async () => {
    if (!phone.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const dup = await contactRepository.checkDuplicatePhone(phone, editingContact?.id);
    if (dup.isDuplicate && dup.existingContact) {
      setDuplicateWarning(`Warning: Phone matches existing contact "${dup.existingContact.name}"`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCreateCustomCategory = async () => {
    if (!customCategoryName.trim()) return;
    const ok = await addCategory(customCategoryName.trim());
    if (ok) {
      setCategory(customCategoryName.trim());
      setIsAddingCustomCategory(false);
      setCustomCategoryName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!phone.trim()) newErrors.phone = 'Mobile Number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingContact) {
      await updateContact(editingContact.id, {
        name: name.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim(),
        email: email.trim(),
        company: company.trim(),
        designation: designation.trim(),
        category,
        address: address.trim(),
        notes: notes.trim(),
        tags,
        visitingCardImage,
      });
    } else {
      await saveContact({
        name: name.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim(),
        email: email.trim(),
        company: company.trim(),
        designation: designation.trim(),
        category,
        address: address.trim(),
        notes: notes.trim(),
        tags,
        source: visitingCardImage ? 'Visiting Card Scan' : source,
        visitingCardImage,
      });
    }
  };

  return (
    <Modal
      isOpen={isAddModalOpen}
      onClose={closeAddModal}
      title={editingContact ? 'Edit Contact' : 'Add New Contact'}
      subtitle={editingContact ? 'Update contact information' : 'Quickly save details to your vault'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Visiting Card Preview if attached */}
        {visitingCardImage && (
          <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-xs shrink-0 overflow-hidden">
                <img src={visitingCardImage} alt="Card Preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-900">Visiting Card Attached</p>
                <p className="text-[11px] text-indigo-700">Fields auto-filled from OCR scan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVisitingCardImage(undefined)}
              className="text-xs text-rose-600 hover:underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}

        {/* 1. Full Name */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Rahul Kumar"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
          </div>
          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
        </div>

        {/* 2. Mobile Number & Alternate Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                }}
                onBlur={handlePhoneBlur}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 transition ${
                  errors.phone
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            {duplicateWarning && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{duplicateWarning}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Alternate Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="e.g. 9876543211 (Optional)"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* 3. Category & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Category Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Category
              </label>
              {!isAddingCustomCategory && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCategory(true)}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  + Custom Category
                </button>
              )}
            </div>

            {isAddingCustomCategory ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white text-slate-900 rounded-xl border border-indigo-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={handleCreateCustomCategory}
                  className="px-2.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCategory(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* 4. Company / Institution & Designation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Company / Institution
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. ABC College / Apex Tech"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Designation
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Professor / VP Sales"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* 5. Address */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Address / Location
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <textarea
              rows={2}
              placeholder="e.g. Room 304, North Campus, New Delhi"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
            />
          </div>
        </div>

        {/* 6. Notes */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Notes & Details
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <textarea
              rows={2}
              placeholder="Add personal notes, meeting context, or follow-up items..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
            />
          </div>
        </div>

        {/* 7. Tags (Multi-Tag Adder) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Tags
          </label>
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            {/* Existing selected tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-indigo-700 font-semibold text-xs rounded-full shadow-2xs"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 text-slate-400 hover:text-rose-500 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Tag Input */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="+ Add tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="px-2 py-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-28"
                />
                {newTagInput && (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-2 py-0.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            {allTags.filter((t) => !tags.includes(t)).length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-slate-400 font-medium">Suggestions:</span>
                {allTags
                  .filter((t) => !tags.includes(t))
                  .slice(0, 5)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTags([...tags, t])}
                      className="text-[11px] px-2 py-0.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-full transition cursor-pointer"
                    >
                      +{t}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={closeAddModal}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
          >
            {editingContact ? 'Save Changes' : 'Save to Vault'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
