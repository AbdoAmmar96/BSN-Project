import client from './client';

export const invoicesApi = {
  list(params = {}) {
    return client.get('/api/invoices', { params }).then(r => r.data);
  },
  show(id) {
    return client.get(`/api/invoices/${id}`).then(r => r.data);
  },
  create(data) {
    return client.post('/api/admin/invoices', data).then(r => r.data);
  },
  update(id, data) {
    return client.put(`/api/admin/invoices/${id}`, data).then(r => r.data);
  },
  delete(id) {
    return client.delete(`/api/admin/invoices/${id}`).then(r => r.data);
  },
  /** Download invoice as PDF (triggers browser save) */
  async downloadPdf(id) {
    const res = await client.get(`/api/invoices/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

export const overviewApi = {
  stats() {
    return client.get('/api/admin/overview-stats').then(r => r.data);
  },
};

export const INVOICE_STATUS = {
  draft: { label: 'مسودة', color: 'bg-gray-300 text-gray-700' },
  sent: { label: 'مرسلة', color: 'bg-blue-200 text-blue-800' },
  partial: { label: 'دفع جزئي', color: 'bg-yellow-200 text-yellow-800' },
  paid: { label: 'مدفوعة', color: 'bg-green-500 text-white' },
  overdue: { label: 'متأخرة', color: 'bg-red-500 text-white' },
  cancelled: { label: 'ملغاة', color: 'bg-gray-400 text-white' },
};
