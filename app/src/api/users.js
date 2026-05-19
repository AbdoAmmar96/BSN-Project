import client from './client';

export const usersApi = {
  list(params = {}) {
    return client.get('/api/admin/users', { params }).then(r => r.data);
  },
  show(id) {
    return client.get(`/api/admin/users/${id}`).then(r => r.data);
  },
  create(data) {
    return client.post('/api/admin/users', data).then(r => r.data);
  },
  update(id, data) {
    return client.put(`/api/admin/users/${id}`, data).then(r => r.data);
  },
  delete(id) {
    return client.delete(`/api/admin/users/${id}`).then(r => r.data);
  },
  toggleActive(id) {
    return client.post(`/api/admin/users/${id}/toggle-active`).then(r => r.data);
  },
};

export const ROLE_LABELS = {
  admin: 'الأدمن',
  developer: 'المطور',
  user: 'العميل',
};

export const ROLE_COLORS = {
  admin: 'bg-brand-orange text-white',
  developer: 'bg-brand-teal text-brand-purple-deep',
  user: 'bg-brand-purple text-white',
};
