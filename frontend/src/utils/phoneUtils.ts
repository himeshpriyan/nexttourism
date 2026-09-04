/**
 * Phone number normalization & helper utility functions
 */

export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-numeric characters except leading '+'
  const cleaned = phone.trim().replace(/[^0-9+]/g, '');
  
  // If it starts with +91, remove +91 for standard Indian 10-digit matching, or keep standard 10 digits
  if (cleaned.startsWith('+91') && cleaned.length > 12) {
    return cleaned.slice(3);
  }
  if (cleaned.startsWith('+1') && cleaned.length > 11) {
    return cleaned.slice(2);
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return cleaned.slice(1);
  }
  // Strip leading '+' if present
  return cleaned.replace(/^\+/, '');
}

export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  
  // Format standard 10 digit number as (XXX) XXX-XXXX or XXXXX XXXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && phone.startsWith('+91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function getWhatsAppUrl(phone: string, name?: string): string {
  if (!phone) return '#';
  let cleanDigits = phone.replace(/[^0-9]/g, '');
  // Default to adding 91 if standard 10 digit Indian number
  if (cleanDigits.length === 10) {
    cleanDigits = `91${cleanDigits}`;
  }
  const greeting = name ? `Hi ${encodeURIComponent(name)}, ` : 'Hello, ';
  return `https://wa.me/${cleanDigits}?text=${greeting}`;
}

export function getCallUrl(phone: string): string {
  if (!phone) return '#';
  return `tel:${phone.replace(/[^0-9+]/g, '')}`;
}

export function getSmsUrl(phone: string, body?: string): string {
  if (!phone) return '#';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return body ? `sms:${cleanPhone}?body=${encodeURIComponent(body)}` : `sms:${cleanPhone}`;
}

export function getMailtoUrl(email: string, subject?: string): string {
  if (!email) return '#';
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-700',
  'from-lime-500 to-emerald-600',
];

export function getAvatarGradient(name: string): string {
  if (!name) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}
