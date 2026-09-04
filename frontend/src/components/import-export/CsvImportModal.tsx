import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { useContacts } from '../../context/ContactContext';
import { parseCSV, type CSVImportRow, generateSampleCSVTemplate, downloadFile } from '../../services/importExport/csvService';
import { Modal } from '../common/Modal';
import { formatPhoneDisplay } from '../../utils/phoneUtils';

export const CsvImportModal: React.FC = () => {
  const { isImportModalOpen, closeImportModal, contacts, importContactsBatch } = useContacts();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parsedRows, setParsedRows] = useState<CSVImportRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update' | 'keep_both'>('skip');
  const [isImporting, setIsImporting] = useState(false);

  const resetState = () => {
    setParsedRows([]);
    setFileName('');
    setIsImporting(false);
  };

  const handleClose = () => {
    resetState();
    closeImportModal();
  };

  const handleDownloadSample = () => {
    const template = generateSampleCSVTemplate();
    downloadFile(template, 'contactvault_sample_template.csv');
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const rows = parseCSV(content, contacts);
      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const duplicateRows = parsedRows.filter((r) => r.isDuplicate);

  const handleExecuteImport = async () => {
    if (validRows.length === 0) return;
    setIsImporting(true);

    const formattedContacts = validRows.map((r) => ({
      name: r.name,
      phone: r.phone,
      alternatePhone: r.alternatePhone,
      email: r.email,
      company: r.company,
      designation: r.designation,
      category: r.category || 'Other',
      address: r.address,
      notes: r.notes,
      tags: r.tags || [],
      source: 'CSV Import' as const,
    }));

    await importContactsBatch(formattedContacts, duplicateStrategy);
    setIsImporting(false);
    handleClose();
  };

  return (
    <Modal
      isOpen={isImportModalOpen}
      onClose={handleClose}
      title="Bulk Import Contacts"
      subtitle="Upload CSV file with automatic column mapping & duplicate check"
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Step 1: Upload or Dropzone if no file loaded */}
        {parsedRows.length === 0 ? (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="p-8 sm:p-12 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 hover:bg-indigo-50/80 text-center transition cursor-pointer flex flex-col items-center justify-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-800">
                Click to browse or drop your CSV file here
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Supports standard headers: Name, Phone, Alternate Phone, Email, Company, Designation, Category, Address, Notes, Tags
              </p>
            </div>

            {/* Template Download Prompt */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800">Need a sample CSV format?</p>
                <p className="text-[11px] text-slate-500">
                  Download our pre-formatted template with Students, Professors, Clients & Vendors examples.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-indigo-600 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Interactive Preview & Duplicate Resolution */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* File info bar */}
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">{fileName}</span>
                <span className="text-slate-500">({parsedRows.length} total rows)</span>
              </div>
              <button
                onClick={resetState}
                className="text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Change File
              </button>
            </div>

            {/* Duplicates Alert banner if detected */}
            {duplicateRows.length > 0 && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {duplicateRows.length} potential duplicate phone numbers detected!
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Select how you would like ContactVault to resolve duplicate phone records during this import:
                </p>

                {/* Duplicate Strategy Radio Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      duplicateStrategy === 'skip'
                        ? 'bg-white border-amber-500 shadow-xs'
                        : 'bg-amber-100/50 border-amber-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === 'skip'}
                      onChange={() => setDuplicateStrategy('skip')}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Skip Duplicates</p>
                      <p className="text-[10px] text-slate-500">Keep existing records unchanged</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      duplicateStrategy === 'update'
                        ? 'bg-white border-amber-500 shadow-xs'
                        : 'bg-amber-100/50 border-amber-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === 'update'}
                      onChange={() => setDuplicateStrategy('update')}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Update Existing</p>
                      <p className="text-[10px] text-slate-500">Merge with new details</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      duplicateStrategy === 'keep_both'
                        ? 'bg-white border-amber-500 shadow-xs'
                        : 'bg-amber-100/50 border-amber-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dupStrategy"
                      checked={duplicateStrategy === 'keep_both'}
                      onChange={() => setDuplicateStrategy('keep_both')}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Import All as New</p>
                      <p className="text-[10px] text-slate-500">Keep both entries</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Contact Preview Table ({validRows.length} valid)
              </p>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Phone</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Company / Role</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-bold text-slate-900">{row.name}</td>
                        <td className="p-2.5 font-mono text-slate-700">{formatPhoneDisplay(row.phone)}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {row.category}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500 truncate max-w-xs">
                          {row.designation || row.company || '—'}
                        </td>
                        <td className="p-2.5">
                          {row.isDuplicate ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Duplicate ({row.duplicateWith})</span>
                            </span>
                          ) : row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Ready</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>{row.errors.join(', ')}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Import Action Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isImporting || validRows.length === 0}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {isImporting
                    ? 'Importing contacts...'
                    : `Import ${validRows.length} Contacts to Vault`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
