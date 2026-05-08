export const STATUS_FLOW = [
  { id: 'pending',    labelAr: 'معلق',        labelFr: 'En attente',     color: '#f39c12', icon: '📋' },
  { id: 'confirmed',  labelAr: 'مؤكد',        labelFr: 'Confirmé',       color: '#3498db', icon: '✅' },
  { id: 'preparing',  labelAr: 'قيد التحضير', labelFr: 'En préparation', color: '#9b59b6', icon: '👨🍳' },
  { id: 'on_the_way', labelAr: 'في الطريق',   labelFr: 'En route',       color: '#1abc9c', icon: '🛵' },
  { id: 'delivered',  labelAr: 'تم التوصيل',  labelFr: 'Livré',          color: '#2ecc71', icon: '🎉' },
  { id: 'cancelled',  labelAr: 'ملغي',        labelFr: 'Annulé',         color: '#e74c3c', icon: '❌' },
];

export const getStatus = (id) => STATUS_FLOW.find(s => s.id === id) || STATUS_FLOW[0];
