import client from './client';

export const ordersApi = {
  list(params = {}) {
    return client.get('/api/orders', { params }).then((r) => r.data);
  },
  show(id) {
    return client.get(`/api/orders/${id}`).then((r) => r.data);
  },
  create(payload) {
    return client.post('/api/orders', payload).then((r) => r.data);
  },
  update(id, payload) {
    return client.put(`/api/orders/${id}`, payload).then((r) => r.data);
  },
  calculate(payload) {
    return client.post('/api/orders/calculate', payload).then((r) => r.data);
  },
  checkout(id) {
    return client.post(`/api/orders/${id}/checkout`).then((r) => r.data);
  },
  uploadAttachment(id, file) {
    const fd = new FormData();
    fd.append('file', file);
    return client
      .post(`/api/orders/${id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};

export const couponsApi = {
  validate(payload) {
    return client.post('/api/coupons/validate', payload).then((r) => r.data);
  },
};

export const addonsApi = {
  list(serviceType) {
    const params = serviceType ? { service_type: serviceType } : {};
    return client.get('/api/packages/addons', { params }).then((r) => r.data);
  },
};

// ---- Admin CMS (Phase 4) ----

export const adminAddonsApi = {
  list(params = {}) {
    return client.get('/api/admin/addons', { params }).then((r) => r.data);
  },
  create(payload) {
    return client.post('/api/admin/addons', payload).then((r) => r.data);
  },
  update(id, payload) {
    return client.put(`/api/admin/addons/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return client.delete(`/api/admin/addons/${id}`).then((r) => r.data);
  },
};

export const adminBundlesApi = {
  list() {
    return client.get('/api/admin/bundles').then((r) => r.data);
  },
  create(payload) {
    return client.post('/api/admin/bundles', payload).then((r) => r.data);
  },
  update(id, payload) {
    return client.put(`/api/admin/bundles/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return client.delete(`/api/admin/bundles/${id}`).then((r) => r.data);
  },
};

export const adminCouponsApi = {
  list() {
    return client.get('/api/admin/coupons').then((r) => r.data);
  },
  create(payload) {
    return client.post('/api/admin/coupons', payload).then((r) => r.data);
  },
  update(id, payload) {
    return client.put(`/api/admin/coupons/${id}`, payload).then((r) => r.data);
  },
  remove(id) {
    return client.delete(`/api/admin/coupons/${id}`).then((r) => r.data);
  },
};
