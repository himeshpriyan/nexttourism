import React from 'react';
import { Sparkles } from 'lucide-react';
import { createSampleCardSvg } from '../../services/seed/sampleData';

interface SampleCardOption {
  id: string;
  title: string;
  role: string;
  category: string;
  svgData: string;
}

const SAMPLE_CARDS: SampleCardOption[] = [
  {
    id: 'sample-prof',
    title: 'Dr. Rahul Kumar',
    role: 'Professor & Dean',
    category: 'Professor',
    svgData: createSampleCardSvg({
      name: 'Dr. Rahul Kumar',
      designation: 'Professor & Dean of Academics',
      company: 'ABC Institute of Technology',
      phone: '9876543210',
      email: 'rahul.kumar@abccollege.edu.in',
      address: 'North Campus, New Delhi 110007',
      themeColor: '#4f46e5',
    }),
  },
  {
    id: 'sample-vp',
    title: 'Priya Sundaram',
    role: 'VP Enterprise Sales',
    category: 'Client',
    svgData: createSampleCardSvg({
      name: 'Priya Sundaram',
      designation: 'VP of Enterprise Sales',
      company: 'Apex Tech Solutions Pvt Ltd',
      phone: '9845012345',
      email: 'priya.s@apextechsolutions.com',
      website: 'www.apextechsolutions.com',
      themeColor: '#9333ea',
    }),
  },
  {
    id: 'sample-vendor',
    title: 'Vikram Mehta',
    role: 'Hardware Account Lead',
    category: 'Vendor',
    svgData: createSampleCardSvg({
      name: 'Vikram Mehta',
      designation: 'Account Manager',
      company: 'Cloud Server Supply Co.',
      phone: '9765432109',
      email: 'vikram@cloudserversupply.in',
      address: 'Sector 62, Noida 201301',
      themeColor: '#d97706',
    }),
  },
  {
    id: 'sample-staff',
    title: 'Sneha Patel',
    role: 'Head of Operations',
    category: 'Staff',
    svgData: createSampleCardSvg({
      name: 'Sneha Patel',
      designation: 'Head of Campus Operations',
      company: 'ABC Institute of Technology',
      phone: '9898981234',
      email: 'sneha.admin@abccollege.edu.in',
      address: 'Ground Floor, Admin Block',
      themeColor: '#0284c7',
    }),
  },
];

interface SampleCardPickerProps {
  onSelectSample: (svgDataUrl: string, title: string) => void;
}

export const SampleCardPicker: React.FC<SampleCardPickerProps> = ({ onSelectSample }) => {
  return (
    <div className="space-y-2.5 pt-3 border-t border-slate-200">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <p className="text-xs font-bold text-slate-700">
          Or test with instant realistic visiting cards:
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SAMPLE_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectSample(card.svgData, card.title)}
            className="p-2.5 bg-slate-50 hover:bg-indigo-50/80 active:bg-indigo-100/90 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex flex-col justify-between group cursor-pointer"
          >
            <div className="h-14 w-full bg-white rounded-lg border border-slate-200/80 mb-2 overflow-hidden flex items-center justify-center p-1 shadow-2xs group-hover:scale-105 transition-transform">
              <img src={card.svgData} alt={card.title} className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                {card.title}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{card.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
