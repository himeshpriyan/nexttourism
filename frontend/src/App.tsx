import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { ContactProvider, useContacts } from './context/ContactContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { ContactListView } from './components/contacts/ContactListView';
import { CategoryManagerView } from './components/categories/CategoryManagerView';
import { ContactDetailModal } from './components/contacts/ContactDetailModal';
import { ContactFormModal } from './components/contacts/ContactFormModal';
import { CardScannerModal } from './components/scanner/CardScannerModal';
import { DuplicateAlertModal } from './components/contacts/DuplicateAlertModal';
import { CsvImportModal } from './components/import-export/CsvImportModal';
import { ExportModal } from './components/import-export/ExportModal';

const AppContent: React.FC = () => {
  const { activeTab } = useContacts();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 pb-20 lg:pb-8">
      {/* Sticky Top Header */}
      <Header />

      {/* Main Content Layout (Centered with desktop sidebar) */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 flex gap-6 pt-4 sm:pt-6">
        {/* Desktop Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Main View */}
        <main className="flex-1 min-w-0 pb-12">
          {activeTab === 'home' && <HomeDashboard />}
          {activeTab === 'contacts' && <ContactListView />}
          {activeTab === 'categories' && <CategoryManagerView />}
        </main>
      </div>

      {/* Mobile-First Sticky Bottom Navigation */}
      <BottomNav />

      {/* Global Modals & Dialogs */}
      <ContactDetailModal />
      <ContactFormModal />
      <CardScannerModal />
      <DuplicateAlertModal />
      <CsvImportModal />
      <ExportModal />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <ContactProvider>
        <AppContent />
      </ContactProvider>
    </ToastProvider>
  );
}
