// Haversine formula - distance in km
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const roundToNearest5 = (n) => Math.round(n / 5) * 5;

const BASE_TIMES = {
  food:     { min: 30, max: 45 },
  grocery:  { min: 45, max: 60 },
  pharmacy: { min: 20, max: 35 },
  default:  { min: 45, max: 60 },
};

const CATEGORY_MAP = {
  pharmacy: ['pharmacy', 'pharmacie', 'صيدلية', 'صيدليات', 'pharma'],
  food:     ['food', 'restaurant', 'مطعم', 'مطاعم', 'طعام', 'resto', 'fastfood', 'fast food'],
  grocery:  ['grocery', 'store', 'supermarket', 'supermarché', 'épicerie', 'متجر', 'متاجر', 'سوبرماركت', 'بقالة', 'shop'],
};

const resolveCategory = (category = '') => {
  const lower = category.toLowerCase().trim();
  // pharmacy first to avoid 'store' matching pharmacy names
  for (const [key, aliases] of Object.entries(CATEGORY_MAP)) {
    if (aliases.some(a => lower === a || lower.startsWith(a) || lower.endsWith(a) || lower.includes(a))) return key;
  }
  return 'default';
};

/**
 * @param {object} shop  - { category, status, location: { latitude, longitude } }
 * @param {object} customerLocation - { latitude, longitude } (optional)
 * @returns {string} e.g. "40 - 55 دقيقة"
 */
const calculateDeliveryTime = (shop, customerLocation = null) => {
  const cat = resolveCategory(shop.category);
  const base = BASE_TIMES[cat] || BASE_TIMES.default;
  let minTime = base.min;
  let maxTime = base.max;

  // Distance factor
  if (customerLocation && shop.location?.latitude && shop.location?.longitude) {
    const dist = haversineDistance(
      shop.location.latitude,
      shop.location.longitude,
      customerLocation.latitude,
      customerLocation.longitude
    );
    const extra = Math.floor(dist) * 5;
    minTime += extra;
    maxTime += extra;
  }

  // Busy factor
  if (shop.status === 'BUSY') {
    minTime += 15;
    maxTime += 15;
  }

  return `${roundToNearest5(minTime)} - ${roundToNearest5(maxTime)} دقيقة`;
};

module.exports = { calculateDeliveryTime, haversineDistance };
