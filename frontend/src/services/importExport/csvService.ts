import type { Contact } from '../../types/contact';
import { normalizePhoneNumber } from '../../utils/phoneUtils';

export interface CSVImportRow {
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  company?: string;
  designation?: string;
  category: string;
  address?: string;
  notes?: string;
  tags?: string[];
  isDuplicate?: boolean;
  duplicateWith?: string;
  isValid: boolean;
  errors: string[];
}

export function parseCSV(csvContent: string, existingContacts: Contact[]): CSVImportRow[] {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Parse header line
  const headerTokens = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim().replace(/[\s_-]/g, ''));
  
  // Find column indices
  const nameIdx = headerTokens.findIndex((h) => h.includes('name') || h.includes('fullname'));
  const phoneIdx = headerTokens.findIndex((h) => h.includes('phone') || h.includes('mobile') || h.includes('cell') || h.includes('contact'));
  const altPhoneIdx = headerTokens.findIndex((h) => h.includes('alt') || h.includes('secondaryphone') || h.includes('alternate'));
  const emailIdx = headerTokens.findIndex((h) => h.includes('email') || h.includes('mail'));
  const companyIdx = headerTokens.findIndex((h) => h.includes('company') || h.includes('institution') || h.includes('org') || h.includes('college'));
  const designationIdx = headerTokens.findIndex((h) => h.includes('designation') || h.includes('role') || h.includes('title') || h.includes('position'));
  const categoryIdx = headerTokens.findIndex((h) => h.includes('category') || h.includes('type') || h.includes('group'));
  const addressIdx = headerTokens.findIndex((h) => h.includes('address') || h.includes('location') || h.includes('city'));
  const notesIdx = headerTokens.findIndex((h) => h.includes('note') || h.includes('comment') || h.includes('desc'));
  const tagsIdx = headerTokens.findIndex((h) => h.includes('tag') || h.includes('label'));

  const existingPhoneMap = new Map<string, string>();
  existingContacts.forEach((c) => {
    const n = normalizePhoneNumber(c.phone);
    if (n) existingPhoneMap.set(n, c.name);
    if (c.alternatePhone) {
      const altN = normalizePhoneNumber(c.alternatePhone);
      if (altN) existingPhoneMap.set(altN, c.name);
    }
  });

  const parsedRows: CSVImportRow[] = [];
  const seenBatchPhones = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const tokens = parseCSVLine(lines[i]);
    if (tokens.every((t) => !t.trim())) continue;

    const name = nameIdx !== -1 && tokens[nameIdx] ? tokens[nameIdx].trim() : `Contact #${i}`;
    const rawPhone = phoneIdx !== -1 && tokens[phoneIdx] ? tokens[phoneIdx].trim() : '';
    const alternatePhone = altPhoneIdx !== -1 && tokens[altPhoneIdx] ? tokens[altPhoneIdx].trim() : '';
    const email = emailIdx !== -1 && tokens[emailIdx] ? tokens[emailIdx].trim() : '';
    const company = companyIdx !== -1 && tokens[companyIdx] ? tokens[companyIdx].trim() : '';
    const designation = designationIdx !== -1 && tokens[designationIdx] ? tokens[designationIdx].trim() : '';
    const category = categoryIdx !== -1 && tokens[categoryIdx] ? tokens[categoryIdx].trim() : 'Other';
    const address = addressIdx !== -1 && tokens[addressIdx] ? tokens[addressIdx].trim() : '';
    const notes = notesIdx !== -1 && tokens[notesIdx] ? tokens[notesIdx].trim() : '';
    const tags = tagsIdx !== -1 && tokens[tagsIdx] ? tokens[tagsIdx].split(/[,;|]/).map((t) => t.trim()).filter(Boolean) : [];

    const errors: string[] = [];
    if (!name) errors.push('Name is missing');
    if (!rawPhone) errors.push('Phone number is missing');

    const normPhone = normalizePhoneNumber(rawPhone);
    let isDuplicate = false;
    let duplicateWith = '';

    if (normPhone) {
      if (existingPhoneMap.has(normPhone)) {
        isDuplicate = true;
        duplicateWith = existingPhoneMap.get(normPhone)!;
      } else if (seenBatchPhones.has(normPhone)) {
        isDuplicate = true;
        duplicateWith = 'Duplicate in this CSV';
      }
      seenBatchPhones.add(normPhone);
    }

    parsedRows.push({
      name,
      phone: rawPhone,
      alternatePhone,
      email,
      company,
      designation,
      category: category || 'Other',
      address,
      notes,
      tags,
      isDuplicate,
      duplicateWith,
      isValid: errors.length === 0,
      errors,
    });
  }

  return parsedRows;
}

// RFC 4180 compliant CSV line tokenizer
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function exportContactsToCSV(contacts: Contact[], categoryFilter?: string): string {
  const filtered = categoryFilter && categoryFilter !== 'All'
    ? contacts.filter((c) => c.category.toLowerCase() === categoryFilter.toLowerCase())
    : contacts;

  const headers = ['Name', 'Phone', 'Alternate Phone', 'Email', 'Company', 'Designation', 'Category', 'Address', 'Notes', 'Tags', 'Source', 'Date Added'];
  
  const escapeCell = (val?: string) => {
    if (!val) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = filtered.map((c) => [
    escapeCell(c.name),
    escapeCell(c.phone),
    escapeCell(c.alternatePhone),
    escapeCell(c.email),
    escapeCell(c.company),
    escapeCell(c.designation),
    escapeCell(c.category),
    escapeCell(c.address),
    escapeCell(c.notes),
    escapeCell(c.tags?.join('; ')),
    escapeCell(c.source),
    escapeCell(new Date(c.createdAt).toLocaleDateString()),
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

export function generateSampleCSVTemplate(): string {
  const sample = `Name,Phone,Alternate Phone,Email,Company,Designation,Category,Address,Notes,Tags
"Dr. Rajesh Verma","9876500001","9876500002","rajesh.verma@delhiuniv.ac.in","Delhi University","Professor of Physics","Professor","Physics Block, North Campus, Delhi","Head of Quantum Research Lab","Academics, Key Contact"
"Kavita Sen","9823400002","","kavita.sen@techcorp.io","TechCorp Solutions","Senior Product Manager","Client","Cyber City Phase 2, Gurugram","Interested in Q4 software licensing","Enterprise, VIP"
"Amit Patel","9123400003","","amit.patel@student.edu","IIT Bombay","Computer Science Student","Student","Hostel 14, Powai, Mumbai","Class representative 2026","Student Council"
"Suresh Sharma","9811100004","","suresh@speedycouriers.in","Speedy Couriers & Logistics","Operations Manager","Vendor","Okhla Industrial Area, Delhi","Domestic courier delivery partner","Logistics, Vendor"
"Pooja Nair","9944000005","","pooja.nair@gmail.com","Freelance UI/UX","UX Designer","Customer","Indiranagar, Bangalore","Purchased template license","Design"`;
  return sample;
}

export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
