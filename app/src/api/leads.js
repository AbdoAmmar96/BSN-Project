import client from './client';

export const leadsApi = {
  list(params = {}) {
    return client.get('/api/leads', { params }).then((r) => r.data);
  },
  show(id) {
    return client.get(`/api/leads/${id}`).then((r) => r.data);
  },
  create(payload) {
    return client.post('/api/leads', payload).then((r) => r.data);
  },
};

export const quotesApi = {
  list(params = {}) {
    return client.get('/api/quotes', { params }).then((r) => r.data);
  },
  show(id) {
    return client.get(`/api/quotes/${id}`).then((r) => r.data);
  },
  accept(id) {
    return client.post(`/api/quotes/${id}/accept`).then((r) => r.data);
  },
  reject(id) {
    return client.post(`/api/quotes/${id}/reject`).then((r) => r.data);
  },
  negotiate(id) {
    return client.post(`/api/quotes/${id}/negotiate`).then((r) => r.data);
  },
};

// Admin-side
export const adminLeadsApi = {
  list(params = {}) {
    return client.get('/api/admin/leads', { params }).then((r) => r.data);
  },
  show(id) {
    return client.get(`/api/admin/leads/${id}`).then((r) => r.data);
  },
  assign(id) {
    return client.post(`/api/admin/leads/${id}/assign`).then((r) => r.data);
  },
  buildQuote(id, payload) {
    return client.post(`/api/admin/leads/${id}/quote`, payload).then((r) => r.data);
  },
};

export const adminQuotesApi = {
  addItem(id, item) {
    return client.post(`/api/admin/quotes/${id}/items`, item).then((r) => r.data);
  },
  removeItem(id, itemId) {
    return client.delete(`/api/admin/quotes/${id}/items/${itemId}`).then((r) => r.data);
  },
  update(id, payload) {
    return client.put(`/api/admin/quotes/${id}`, payload).then((r) => r.data);
  },
  send(id) {
    return client.post(`/api/admin/quotes/${id}/send`).then((r) => r.data);
  },
};

export const adminOrdersApi = {
  list(params = {}) {
    return client.get('/api/admin/orders', { params }).then((r) => r.data);
  },
  show(id) {
    return client.get(`/api/admin/orders/${id}`).then((r) => r.data);
  },
  assign(id, developerId) {
    return client.post(`/api/admin/orders/${id}/assign`, { developer_id: developerId }).then((r) => r.data);
  },
  hold(id) {
    return client.post(`/api/admin/orders/${id}/hold`).then((r) => r.data);
  },
  cancel(id, reason) {
    return client.post(`/api/admin/orders/${id}/cancel`, { reason }).then((r) => r.data);
  },
};
