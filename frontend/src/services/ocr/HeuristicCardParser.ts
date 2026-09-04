import type { OCRScanResult } from '../../types/contact';

const DESIGNATION_KEYWORDS = [
  'Professor', 'Assistant Professor', 'Associate Professor', 'Dean', 'HOD', 'Head of Department',
  'Lecturer', 'Principal', 'Researcher', 'Research Scientist', 'Scholar',
  'Chief Executive Officer', 'CEO', 'Chief Technology Officer', 'CTO', 'Chief Operating Officer', 'COO',
  'Founder', 'Co-Founder', 'Managing Director', 'MD', 'Director', 'President', 'Vice President', 'VP',
  'General Manager', 'Manager', 'Lead', 'Senior Engineer', 'Software Engineer', 'Data Scientist',
  'Product Designer', 'Architect', 'Consultant', 'Advisor', 'Partner', 'Specialist', 'Executive',
  'Account Manager', 'Sales Manager', 'Head of Operations', 'Student', 'Intern'
];

const COMPANY_SUFFIXES = [
  'Pvt Ltd', 'Private Limited', 'Ltd', 'Limited', 'Inc', 'Incorporated', 'Corp', 'Corporation',
  'LLC', 'LLP', 'Technologies', 'Solutions', 'Software', 'Labs', 'Infotech', 'Systems', 'Ventures',
  'Enterprises', 'Services', 'Consulting', 'Institute', 'College', 'University', 'Academy',
  'Hospital', 'Healthcare', 'Bank', 'Finance', 'Studio', 'Agency', 'Catering', 'Supply'
];

export function parseVisitingCardText(rawText: string): OCRScanResult {
  if (!rawText || !rawText.trim()) {
    return {
      rawText: '',
      confidence: 0,
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let name = '';
  let phone = '';
  let alternatePhone = '';
  let email = '';
  let company = '';
  let designation = '';
  let website = '';
  let address = '';
  let suggestedCategory = 'Other';

  const usedLineIndices = new Set<number>();

  // 1. Extract Email(s)
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(emailRegex);
    if (match && match.length > 0) {
      if (!email) {
        email = match[0].toLowerCase();
        usedLineIndices.add(i);
      }
    }
  }

  // 2. Extract Website(s)
  const websiteRegex = /(?:https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(websiteRegex);
    if (match && match.length > 0) {
      if (!website) {
        website = match[0].toLowerCase();
        usedLineIndices.add(i);
      }
    }
  }

  // 3. Extract Phone Number(s)
  // Handles +91, (XXX) XXX-XXXX, 10-digit Indian/US, dashed numbers
  const phonePattern = /(?:(?:TEL|PHONE|MOB|MOBILE|PH|CELL|CALL|M|T)[:\s.-]*)?(\+?[0-9]{1,3}[-.\s]?)?\(?([0-9]{3,5})\)?[-.\s]?([0-9]{3,5})[-.\s]?([0-9]{3,5})?/gi;
  const foundPhones: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if line contains digits that look like phone
    const digitsOnly = line.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 10 && digitsOnly.length <= 14) {
      // Clean up prefix labels like Tel:, Mob:, Phone:
      const cleanPhone = line.replace(/(?:TEL|PHONE|MOB|MOBILE|PH|CELL|CALL|M|T)[:.\s]*/i, '').trim();
      foundPhones.push(cleanPhone);
      usedLineIndices.add(i);
    } else {
      let match: RegExpExecArray | null;
      while ((match = phonePattern.exec(line)) !== null) {
        const candidate = match[0].replace(/[^0-9+]/g, '');
        if (candidate.length >= 10 && candidate.length <= 15 && !foundPhones.includes(match[0])) {
          foundPhones.push(match[0].trim());
          usedLineIndices.add(i);
        }
      }
    }
  }

  if (foundPhones.length > 0) {
    phone = foundPhones[0].replace(/(?:TEL|PHONE|MOB|MOBILE|PH|CELL)[:.\s]*/i, '').trim();
    if (foundPhones.length > 1) {
      alternatePhone = foundPhones[1].replace(/(?:TEL|PHONE|MOB|MOBILE|PH|CELL)[:.\s]*/i, '').trim();
    }
  }

  // 4. Extract Designation
  for (let i = 0; i < lines.length; i++) {
    if (usedLineIndices.has(i)) continue;
    const line = lines[i];
    for (const kw of DESIGNATION_KEYWORDS) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(line)) {
        designation = line;
        usedLineIndices.add(i);
        break;
      }
    }
    if (designation) break;
  }

  // 5. Extract Company / Institution
  for (let i = 0; i < lines.length; i++) {
    if (usedLineIndices.has(i)) continue;
    const line = lines[i];
    for (const suffix of COMPANY_SUFFIXES) {
      const regex = new RegExp(`\\b${suffix}\\b`, 'i');
      if (regex.test(line)) {
        company = line;
        usedLineIndices.add(i);
        break;
      }
    }
    if (company) break;
  }

  // 6. Extract Address (lines with Pin / Sector / Road / Street / Floor / City / Block)
  const addressKeywords = ['road', 'rd', 'street', 'st', 'block', 'floor', 'campus', 'sector', 'nagar', 'cross', 'layout', 'avenue', 'city', 'pincode', 'pin', 'zip', 'delhi', 'mumbai', 'bengaluru', 'bangalore', 'chennai', 'hyderabad', 'pune', 'kolkata', 'noida', 'gurugram'];
  const addressLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (usedLineIndices.has(i)) continue;
    const line = lines[i];
    const lower = line.toLowerCase();
    const isAddressLine = addressKeywords.some((kw) => lower.includes(kw)) || /\b\d{6}\b/.test(line); // 6-digit Indian PIN
    if (isAddressLine) {
      addressLines.push(line);
      usedLineIndices.add(i);
    }
  }
  if (addressLines.length > 0) {
    address = addressLines.join(', ');
  }

  // 7. Extract Name from remaining top lines
  for (let i = 0; i < lines.length; i++) {
    if (usedLineIndices.has(i)) continue;
    const line = lines[i].trim();
    // Check if line looks like a person's name (2-4 words, letters & dots, no symbols or weird numbers)
    if (/^(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|Er\.)?\s*[A-Z][a-zA-Z.'’\s-]{2,40}$/i.test(line)) {
      name = line;
      usedLineIndices.add(i);
      break;
    }
  }

  // Fallback for Name if not yet identified: take first unused line
  if (!name) {
    for (let i = 0; i < lines.length; i++) {
      if (!usedLineIndices.has(i)) {
        name = lines[i];
        usedLineIndices.add(i);
        break;
      }
    }
  }

  // Fallback for Company: check line 0 or 1 if still not set
  if (!company && lines.length > 0 && lines[0] !== name) {
    company = lines[0];
  }

  // 8. Smart Suggest Category
  const combinedContext = `${designation} ${company} ${name} ${rawText}`.toLowerCase();
  if (combinedContext.includes('professor') || combinedContext.includes('dean') || combinedContext.includes('faculty') || combinedContext.includes('lecturer') || combinedContext.includes('hod')) {
    suggestedCategory = 'Professor';
  } else if (combinedContext.includes('student') || combinedContext.includes('intern') || combinedContext.includes('b.tech') || combinedContext.includes('m.tech') || combinedContext.includes('scholar')) {
    suggestedCategory = 'Student';
  } else if (combinedContext.includes('staff') || combinedContext.includes('admin') || combinedContext.includes('operations') || combinedContext.includes('registrar')) {
    suggestedCategory = 'Staff';
  } else if (combinedContext.includes('supplier') || combinedContext.includes('vendor') || combinedContext.includes('hardware') || combinedContext.includes('catering') || combinedContext.includes('logistics')) {
    suggestedCategory = 'Vendor';
  } else if (combinedContext.includes('ceo') || combinedContext.includes('cto') || combinedContext.includes('vp') || combinedContext.includes('director') || combinedContext.includes('client') || combinedContext.includes('enterprise')) {
    suggestedCategory = 'Client';
  } else if (combinedContext.includes('customer') || combinedContext.includes('subscriber') || combinedContext.includes('buyer')) {
    suggestedCategory = 'Customer';
  }

  // Calculate Confidence
  let score = 0;
  if (name) score += 25;
  if (phone) score += 30;
  if (email) score += 20;
  if (company) score += 15;
  if (designation) score += 10;

  return {
    rawText,
    name,
    phone,
    alternatePhone,
    email,
    company,
    designation,
    website,
    address,
    suggestedCategory,
    confidence: Math.min(100, score),
  };
}
