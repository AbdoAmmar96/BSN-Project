import client from './client';

export const paymentsApi = {
  list(params = {}) {
    return client.get('/api/payments', { params }).then(r => r.data);
  },

  initiate(data) {
    // data: { gateway, amount, currency?, project_id?, invoice_id?, phone?, months? }
    return client.post('/api/payments/initiate', data).then(r => r.data);
  },

  show(id) {
    return client.get(`/api/payments/${id}`).then(r => r.data);
  },

  recheck(id) {
    return client.post(`/api/payments/${id}/recheck`).then(r => r.data);
  },
};

export const GATEWAY_LABELS = {
  fawry: 'فوري · دفع كاش',
  paymob_card: 'بطاقة ائتمان · Paymob',
  paymob_wallet: 'محفظة موبايل · Paymob',
  paymob_installments: 'تقسيط · Souhoola/ValU',
  kashier: 'بطاقة ائتمان · Kashier',
  manual: 'تحويل بنكي',
};

export const GATEWAY_ICONS = {
  fawry: '🟠',
  paymob_card: '💳',
  paymob_wallet: '📱',
  paymob_installments: '📅',
  kashier: '💳',
  manual: '🏦',
};
