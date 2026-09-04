import type { Contact } from '../../types/contact';
import { downloadFile } from './csvService';

export function generateVCard(contact: Contact): string {
  const parts = contact.name.trim().split(/\s+/);
  const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
  const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] || '';

  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
    `N:${lastName};${firstName};;;`,
    contact.company ? `ORG:${contact.company};` : '',
    contact.designation ? `TITLE:${contact.designation}` : '',
    contact.phone ? `TEL;TYPE=CELL,VOICE:${contact.phone}` : '',
    contact.alternatePhone ? `TEL;TYPE=WORK,VOICE:${contact.alternatePhone}` : '',
    contact.email ? `EMAIL;TYPE=INTERNET,PREF:${contact.email}` : '',
    contact.address ? `ADR;TYPE=WORK,POSTAL:;;${contact.address};;;;` : '',
    contact.notes ? `NOTE:${contact.notes.replace(/\n/g, '\\n')}` : '',
    contact.category ? `CATEGORIES:${contact.category}${contact.tags?.length ? ',' + contact.tags.join(',') : ''}` : '',
    'END:VCARD',
  ].filter(Boolean);

  return vcardLines.join('\r\n');
}

export function exportContactAsVCard(contact: Contact): void {
  const vcard = generateVCard(contact);
  const filename = `${contact.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.vcf`;
  downloadFile(vcard, filename, 'text/vcard;charset=utf-8;');
}

export function exportAllContactsAsVCard(contacts: Contact[], filename = 'contacts_export.vcf'): void {
  const allVcards = contacts.map(generateVCard).join('\r\n\r\n');
  downloadFile(allVcards, filename, 'text/vcard;charset=utf-8;');
}
