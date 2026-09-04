import type { Contact, DuplicateCheckResult } from '../types/contact.js';

export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.trim().replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+91') && cleaned.length > 12) {
    return cleaned.slice(3);
  }
  if (cleaned.startsWith('+1') && cleaned.length > 11) {
    return cleaned.slice(2);
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return cleaned.slice(1);
  }
  return cleaned.replace(/^\+/, '');
}

export function checkDuplicatePhone(contacts: Contact[], phone: string, excludeId?: string): DuplicateCheckResult {
  if (!phone || !phone.trim()) {
    return { isDuplicate: false };
  }

  const normalizedTarget = normalizePhoneNumber(phone);
  if (!normalizedTarget || normalizedTarget.length < 5) {
    return { isDuplicate: false };
  }

  for (const c of contacts) {
    if (excludeId && c.id === excludeId) continue;

    const normPhone = normalizePhoneNumber(c.phone);
    if (normPhone && (normPhone === normalizedTarget || normPhone.endsWith(normalizedTarget) || normalizedTarget.endsWith(normPhone))) {
      return { isDuplicate: true, existingContact: c, matchedField: 'phone' };
    }

    if (c.alternatePhone) {
      const normAlt = normalizePhoneNumber(c.alternatePhone);
      if (normAlt && (normAlt === normalizedTarget || normAlt.endsWith(normalizedTarget) || normalizedTarget.endsWith(normAlt))) {
        return { isDuplicate: true, existingContact: c, matchedField: 'alternatePhone' };
      }
    }
  }

  return { isDuplicate: false };
}
