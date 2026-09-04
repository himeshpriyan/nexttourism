import type { CategoryItem, Contact } from '../../types/contact';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-student',
    name: 'Student',
    color: 'emerald',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textColor: 'text-emerald-700',
    iconName: 'GraduationCap',
    isDefault: true,
  },
  {
    id: 'cat-professor',
    name: 'Professor',
    color: 'indigo',
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    textColor: 'text-indigo-700',
    iconName: 'BookOpen',
    isDefault: true,
  },
  {
    id: 'cat-staff',
    name: 'Staff',
    color: 'sky',
    bgLight: 'bg-sky-50 text-sky-700 border-sky-200',
    textColor: 'text-sky-700',
    iconName: 'Building2',
    isDefault: true,
  },
  {
    id: 'cat-client',
    name: 'Client',
    color: 'purple',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    textColor: 'text-purple-700',
    iconName: 'Briefcase',
    isDefault: true,
  },
  {
    id: 'cat-vendor',
    name: 'Vendor',
    color: 'amber',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    textColor: 'text-amber-700',
    iconName: 'Truck',
    isDefault: true,
  },
  {
    id: 'cat-customer',
    name: 'Customer',
    color: 'rose',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    textColor: 'text-rose-700',
    iconName: 'Users',
    isDefault: true,
  },
  {
    id: 'cat-friend',
    name: 'Friend',
    color: 'pink',
    bgLight: 'bg-pink-50 text-pink-700 border-pink-200',
    textColor: 'text-pink-700',
    iconName: 'Heart',
    isDefault: true,
  },
  {
    id: 'cat-other',
    name: 'Other',
    color: 'slate',
    bgLight: 'bg-slate-100 text-slate-700 border-slate-200',
    textColor: 'text-slate-700',
    iconName: 'Tag',
    isDefault: true,
  },
];

export const CATEGORY_COLOR_MAP: Record<string, { bgLight: string; textColor: string; dotColor: string }> = {
  Student: { bgLight: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700', dotColor: 'bg-emerald-500' },
  Professor: { bgLight: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-700', dotColor: 'bg-indigo-500' },
  Staff: { bgLight: 'bg-sky-50 border-sky-200', textColor: 'text-sky-700', dotColor: 'bg-sky-500' },
  Client: { bgLight: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700', dotColor: 'bg-purple-500' },
  Vendor: { bgLight: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', dotColor: 'bg-amber-500' },
  Customer: { bgLight: 'bg-rose-50 border-rose-200', textColor: 'text-rose-700', dotColor: 'bg-rose-500' },
  Friend: { bgLight: 'bg-pink-50 border-pink-200', textColor: 'text-pink-700', dotColor: 'bg-pink-500' },
  Other: { bgLight: 'bg-slate-100 border-slate-200', textColor: 'text-slate-700', dotColor: 'bg-slate-500' },
};

// SVG Card Generators for realistic visiting card samples
export function createSampleCardSvg(data: {
  name: string;
  designation: string;
  company: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  themeColor?: string;
}): string {
  const color = data.themeColor || '#4f46e5';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
    </defs>
    <rect width="600" height="350" rx="16" fill="url(#cardGrad)" stroke="#e2e8f0" stroke-width="3"/>
    <path d="M 0 0 L 160 0 L 120 350 L 0 350 Z" fill="url(#accentGrad)" opacity="0.12"/>
    <rect x="0" y="0" width="12" height="350" fill="${color}" rx="6"/>
    
    <!-- Company Header -->
    <text x="50" y="65" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="22" font-weight="bold" fill="${color}" letter-spacing="1">${data.company.toUpperCase()}</text>
    <line x1="50" y1="80" x2="320" y2="80" stroke="${color}" stroke-width="2" opacity="0.4"/>
    
    <!-- Name and Designation -->
    <text x="50" y="145" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="28" font-weight="bold" fill="#0f172a">${data.name}</text>
    <text x="50" y="175" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="600" fill="#64748b" letter-spacing="0.5">${data.designation}</text>
    
    <!-- Contact Info Section -->
    <g transform="translate(50, 220)">
      <!-- Phone -->
      <circle cx="10" cy="10" r="10" fill="${color}" opacity="0.15"/>
      <text x="32" y="15" font-family="Arial, sans-serif" font-size="15" font-weight="500" fill="#334155">TEL: ${data.phone}</text>
      
      <!-- Email -->
      <circle cx="10" cy="40" r="10" fill="${color}" opacity="0.15"/>
      <text x="32" y="45" font-family="Arial, sans-serif" font-size="15" font-weight="500" fill="#334155">EMAIL: ${data.email}</text>
      
      <!-- Website / Address -->
      <circle cx="10" cy="70" r="10" fill="${color}" opacity="0.15"/>
      <text x="32" y="75" font-family="Arial, sans-serif" font-size="14" font-weight="400" fill="#64748b">${data.website || data.address || 'Tech City, Innovation Hub'}</text>
    </g>
    
    <!-- Decorative Corner Pattern -->
    <circle cx="540" cy="60" r="40" fill="${color}" opacity="0.05"/>
    <circle cx="540" cy="60" r="20" fill="${color}" opacity="0.1"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'cnt-1',
    name: 'Dr. Rahul Kumar',
    phone: '9876543210',
    alternatePhone: '9876543211',
    email: 'rahul.kumar@abccollege.edu.in',
    company: 'ABC Institute of Technology',
    designation: 'Professor & Dean of Academics',
    category: 'Professor',
    address: 'Faculty Block 4, North Campus, New Delhi, 110007',
    notes: 'Department head for Computer Science. Key contact for research grants & curriculum approvals.',
    tags: ['Academics', 'CS Department', 'Key Decision Maker'],
    source: 'Visiting Card Scan',
    visitingCardImage: createSampleCardSvg({
      name: 'Dr. Rahul Kumar',
      designation: 'Professor & Dean of Academics',
      company: 'ABC Institute of Technology',
      phone: '9876543210',
      email: 'rahul.kumar@abccollege.edu.in',
      address: 'North Campus, New Delhi',
      themeColor: '#4f46e5',
    }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    isFavorite: true,
  },
  {
    id: 'cnt-2',
    name: 'Aarav Sharma',
    phone: '9123456780',
    alternatePhone: '',
    email: 'aarav.sharma22@student.edu',
    company: 'ABC Institute of Technology',
    designation: 'B.Tech CS Student (Final Year)',
    category: 'Student',
    address: 'Boys Hostel 2, Room 304, Campus Rd',
    notes: 'President of Coding Club. Organizing Hackathon 2026.',
    tags: ['Student Council', 'Hackathon Lead', 'Batch 2026'],
    source: 'Manual Entry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    isFavorite: true,
  },
  {
    id: 'cnt-3',
    name: 'Priya Sundaram',
    phone: '9845012345',
    alternatePhone: '9845012346',
    email: 'priya.s@apextechsolutions.com',
    company: 'Apex Tech Solutions Pvt Ltd',
    designation: 'VP of Enterprise Sales',
    category: 'Client',
    address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    notes: 'Renewing enterprise annual contract in Q3. Requested product demo for Cloud Security.',
    tags: ['Enterprise', 'VIP Client', 'Q3 Renewal'],
    source: 'Visiting Card Scan',
    visitingCardImage: createSampleCardSvg({
      name: 'Priya Sundaram',
      designation: 'VP of Enterprise Sales',
      company: 'Apex Tech Solutions Pvt Ltd',
      phone: '9845012345',
      email: 'priya.s@apextechsolutions.com',
      website: 'www.apextechsolutions.com',
      themeColor: '#9333ea',
    }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    isFavorite: true,
  },
  {
    id: 'cnt-4',
    name: 'Vikram Mehta',
    phone: '9765432109',
    alternatePhone: '',
    email: 'vikram@cloudserversupply.in',
    company: 'Cloud Server Supply & Hardware Co.',
    designation: 'Account Manager',
    category: 'Vendor',
    address: 'Sector 62, Noida, Uttar Pradesh 201301',
    notes: 'Hardware supplier for rack servers, high-speed switches and UPS batteries. 5% discount on bulk.',
    tags: ['Hardware', 'IT Infrastructure', 'Vendor Agreement'],
    source: 'CSV Import',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: 'cnt-5',
    name: 'Dr. Ananya Roy',
    phone: '9830112233',
    alternatePhone: '',
    email: 'ananya.roy@aims-research.org',
    company: 'National AI & Machine Learning Center',
    designation: 'Senior Research Scientist',
    category: 'Professor',
    address: 'Salt Lake Sector V, Kolkata, West Bengal 700091',
    notes: 'Guest speaker for next month conference on Generative AI. Co-author on NLP paper.',
    tags: ['AI Research', 'Keynote Speaker', 'Advisory Board'],
    source: 'Visiting Card Scan',
    visitingCardImage: createSampleCardSvg({
      name: 'Dr. Ananya Roy',
      designation: 'Senior Research Scientist',
      company: 'National AI & ML Center',
      phone: '9830112233',
      email: 'ananya.roy@aims-research.org',
      address: 'Salt Lake Sector V, Kolkata',
      themeColor: '#4f46e5',
    }),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'cnt-6',
    name: 'Rohan Deshmukh',
    phone: '9988776655',
    alternatePhone: '',
    email: 'rohan.d@fintechinnovate.io',
    company: 'Fintech Innovate Technologies',
    designation: 'Chief Technology Officer (CTO)',
    category: 'Client',
    address: 'Bandra Kurla Complex (BKC), Mumbai 400051',
    notes: 'Interested in API integrations for payment workflows.',
    tags: ['Fintech', 'CTO', 'High Priority'],
    source: 'Manual Entry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'cnt-7',
    name: 'Sneha Patel',
    phone: '9898981234',
    alternatePhone: '9898981235',
    email: 'sneha.admin@abccollege.edu.in',
    company: 'ABC Institute of Technology',
    designation: 'Head of Campus Operations',
    category: 'Staff',
    address: 'Admin Building, Ground Floor, New Delhi',
    notes: 'Handles room bookings, seminar halls, and security badges.',
    tags: ['Operations', 'Admin Staff'],
    source: 'CSV Import',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'cnt-8',
    name: 'Karthik Raja',
    phone: '9444012389',
    alternatePhone: '',
    email: 'karthik.raja@chennaicatering.com',
    company: 'Chennai Corporate Events & Catering',
    designation: 'Managing Partner',
    category: 'Vendor',
    address: 'T. Nagar, Chennai, Tamil Nadu 600017',
    notes: 'Catering vendor for annual summit. Provides banquet services.',
    tags: ['Events', 'Catering'],
    source: 'Manual Entry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'cnt-9',
    name: 'Meera Nambiar',
    phone: '9744123456',
    alternatePhone: '',
    email: 'meera.design@gmail.com',
    company: 'Studio PixelCraft',
    designation: 'Lead Product Designer',
    category: 'Customer',
    address: 'Kochi Infopark, Kerala 682042',
    notes: 'Subscribed to our design asset library and annual UI kit license.',
    tags: ['Design', 'Subscriber'],
    source: 'CSV Import',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'cnt-10',
    name: 'Siddharth Varma',
    phone: '9820334455',
    alternatePhone: '',
    email: 'sid.varma@gmail.com',
    company: 'Freelance Architect',
    designation: 'Architect & Interior Designer',
    category: 'Friend',
    address: 'Juhu, Mumbai, Maharashtra 400049',
    notes: 'College roommate. Discussed home office design.',
    tags: ['Personal', 'College Friend'],
    source: 'Manual Entry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'cnt-11',
    name: 'Tanvi Joshi',
    phone: '9650011223',
    alternatePhone: '',
    email: 'tanvi.j@student.edu',
    company: 'ABC Institute of Technology',
    designation: 'M.Tech Data Science Student',
    category: 'Student',
    address: 'Girls Hostel 1, New Delhi',
    notes: 'Working on recommendation systems thesis.',
    tags: ['Postgrad', 'Data Science'],
    source: 'Manual Entry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'cnt-12',
    name: 'Rajesh Gokhale',
    phone: '9822109876',
    alternatePhone: '',
    email: 'rajesh.g@citymunicipal.gov.in',
    company: 'City Urban Development Council',
    designation: 'Zonal Inspector',
    category: 'Other',
    address: 'Civic Centre, Pune, Maharashtra 411005',
    notes: 'Contact for local facility compliance permits.',
    tags: ['Government', 'Permits'],
    source: 'Manual Entry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];
