export default function normalizePhoneNumber(input) {
    const digits = input.trim().replace(/\D/g, '');
    const last10 = digits.slice(-10);
    return /^[6-9]\d{9}$/.test(last10) ? last10 : null;
  }