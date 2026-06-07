/**
 * هل المتجر مفتوح الآن بناءً على جدول أوقاته؟
 * @param {Object} shop - كائن المتجر (يحتوي على schedule و status)
 * @returns {boolean}
 */
export function isShopOpen(shop) {
  if (!shop) return true;

  // إذا المتجر مغلق يدوياً
  if (shop.status === 'CLOSED') return false;

  // إذا الجدول غير مفعّل → مفتوح دائماً (ما دام status ≠ CLOSED)
  const sch = shop.schedule;
  if (!sch || !sch.enabled) return true;

  const now = new Date();
  const todayDay = now.getDay(); // 0=أحد ... 6=سبت

  // تحقق من أن اليوم الحالي في أيام العمل
  const days = sch.days || [0, 1, 2, 3, 4, 5, 6];
  if (!days.includes(todayDay)) return false;

  // مقارنة الوقت الحالي مع openTime/closeTime (HH:MM)
  const toMinutes = (hhmm) => {
    const [h, m] = (hhmm || '00:00').split(':').map(Number);
    return h * 60 + m;
  };

  const nowMin   = now.getHours() * 60 + now.getMinutes();
  const openMin  = toMinutes(sch.openTime  || '08:00');
  const closeMin = toMinutes(sch.closeTime || '22:00');

  // دعم الجداول التي تتجاوز منتصف الليل (مثلاً 22:00 → 02:00)
  if (closeMin < openMin) {
    return nowMin >= openMin || nowMin < closeMin;
  }

  return nowMin >= openMin && nowMin < closeMin;
}
