/**
 * Zero-Cost WhatsApp Desktop Protocol Generator
 * Deep-links into installed WhatsApp Desktop without paid third-party API gateways
 */

/**
 * Normalizes Bangladeshi and international phone numbers to E.164 without plus
 * e.g. 01711000000 -> 8801711000000
 * @param {string} phone
 * @returns {string} Clean digits
 */
export function sanitizePhoneNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.startsWith('01')) {
    return `880${digits.slice(1)}`;
  }
  if (digits.startsWith('880')) {
    return digits;
  }
  return digits;
}

/**
 * Builds formatted Bengali WhatsApp payment reminder
 * @param {object} params
 * @param {string} params.customerName
 * @param {string} params.shopName
 * @param {string} params.dueAmountTaka
 * @param {string} params.bKashNumber
 * @returns {string} Formatted text
 */
export function buildDueReminderMessage({ customerName, shopName, dueAmountTaka, bKashNumber }) {
  let msg = `সম্মানিত গ্রাহক ${customerName || ''},\n\n`;
  msg += `${shopName || 'আমাদের দোকানে'} আপনার বর্তমান বকেয়া ৳ ${dueAmountTaka} টাকা।\n\n`;
  if (bKashNumber) {
    msg += `বিকাশে পরিশোধ করতে পারেন:\nবিকাশ নম্বর: ${bKashNumber}\n\n`;
  }
  msg += `সুবিধাজনক সময়ে পরিশোধের অনুরোধ করা হলো।\nধন্যবাদ!\n${shopName || ''}`;
  return msg;
}

/**
 * Opens WhatsApp Desktop or Web with pre-filled message
 * @param {string} phone 
 * @param {string} message 
 */
export function openWhatsAppDirect(phone, message) {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  
  // 1. Try desktop protocol
  const desktopUri = `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;
  const webUri = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

  // If in browser, open webUri in new tab or attempt desktop protocol
  if (typeof window !== 'undefined') {
    const isWindows = navigator.platform.indexOf('Win') > -1;
    if (isWindows) {
      window.location.href = desktopUri;
    } else {
      window.open(webUri, '_blank');
    }
  }
}
