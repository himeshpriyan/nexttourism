import React from 'react';
import { AlertTriangle, Eye, RefreshCw, PlusCircle } from 'lucide-react';
import { useContacts } from '../../context/ContactContext';
import { CategoryBadge } from '../common/Badge';
import { formatPhoneDisplay } from '../../utils/phoneUtils';

export const DuplicateAlertModal: React.FC = () => {
  const { duplicateAlert, resolveDuplicate, closeDuplicateAlert } = useContacts();

  if (!duplicateAlert.isOpen || !duplicateAlert.existingContact) {
    return null;
  }

  const existing = duplicateAlert.existingContact;
  const candidate = duplicateAlert.candidateContact;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header with warning icon */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Contact Already Exists</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The phone number <span className="font-bold text-slate-800 font-mono">{formatPhoneDisplay(candidate?.phone || existing.phone)}</span> is already registered in your vault.
            </p>
          </div>
        </div>

        {/* Existing Contact Summary Card */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Existing Contact in Vault
          </p>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{existing.name}</h4>
              <p className="text-xs text-slate-600 font-medium">
                {existing.designation || existing.company || 'No company specified'}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <CategoryBadge category={existing.category} size="sm" />
                <span className="text-[11px] text-slate-500 font-mono">
                  {formatPhoneDisplay(existing.phone)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Options */}
        <div className="space-y-2 pt-1">
          {/* Option 1: Update Existing */}
          <button
            onClick={() => resolveDuplicate('update')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Update Existing Contact</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-normal">
              Recommended
            </span>
          </button>

          {/* Option 2: View Existing */}
          <button
            onClick={() => resolveDuplicate('view')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>View Existing Details</span>
            </div>
          </button>

          {/* Option 3: Save as New */}
          <button
            onClick={() => resolveDuplicate('save_new')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-600 text-xs sm:text-sm font-medium transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-slate-400" />
              <span>Save as New Contact Anyway</span>
            </div>
          </button>
        </div>

        {/* Cancel */}
        <div className="text-center pt-1">
          <button
            onClick={closeDuplicateAlert}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Cancel & Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
