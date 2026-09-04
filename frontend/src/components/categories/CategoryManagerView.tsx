import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Download,
  Users,
  X,
} from 'lucide-react';
import { useContacts } from '../../context/ContactContext';
import { CategoryBadge } from '../common/Badge';
import type { CategoryItem } from '../../types/contact';

const COLOR_OPTIONS = [
  { name: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
  { name: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
  { name: 'sky', label: 'Sky', bg: 'bg-sky-500' },
  { name: 'purple', label: 'Purple', bg: 'bg-purple-500' },
  { name: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  { name: 'rose', label: 'Rose', bg: 'bg-rose-500' },
  { name: 'pink', label: 'Pink', bg: 'bg-pink-500' },
  { name: 'slate', label: 'Slate', bg: 'bg-slate-500' },
];

export const CategoryManagerView: React.FC = () => {
  const {
    categories,
    categoryCounts,
    addCategory,
    updateCategory,
    deleteCategory,
    exportContactsCSV,
    setCategoryFilter,
    setActiveTab,
  } = useContacts();

  // New Category State
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('indigo');

  // Edit Category State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('indigo');

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewCatName('');
    setNewCatColor('indigo');
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const ok = await addCategory(newCatName.trim(), newCatColor);
    if (ok) {
      setIsAdding(false);
      setNewCatName('');
    }
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color || 'indigo');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const ok = await updateCategory(id, editName.trim(), editColor);
    if (ok) {
      setEditingId(null);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    const count = categoryCounts[cat.name] || 0;
    const message = count > 0
      ? `Delete category "${cat.name}"? ${count} contacts in this category will be re-assigned to "Other".`
      : `Delete category "${cat.name}"?`;

    if (window.confirm(message)) {
      await deleteCategory(cat.id, 'Other');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Category Management</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize phone numbers & contacts by role or department with custom tags and color accents.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Add Category Inline Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveAdd}
          className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Create New Category
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alumni, Advisor, Investor, Partner..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-white text-slate-900 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Color Accent
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setNewCatColor(c.name)}
                    className={`w-6 h-6 rounded-full ${c.bg} transition ${
                      newCatColor === c.name ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categories.map((cat) => {
          const count = categoryCounts[cat.name] || 0;
          const isEditingThis = editingId === cat.id;

          if (isEditingThis) {
            return (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-white border-2 border-indigo-500 shadow-md space-y-3"
              >
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Rename</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(cat.id)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                  >
                    Update
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CategoryBadge category={cat.name} size="lg" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {count}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {count === 1 ? 'Contact' : 'Contacts'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!cat.isDefault && (
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => {
                    setCategoryFilter(cat.name);
                    setActiveTab('contacts');
                  }}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Contacts</span>
                </button>

                <button
                  onClick={() => exportContactsCSV(cat.name)}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
                  title={`Export ${cat.name} as CSV`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
