import client from './client';

/** Public — the live "أعمالنا" grid. */
export const portfolioApi = {
  list(params = {}) {
    return client.get('/api/portfolio', { params }).then((r) => r.data);
  },
};

/** Admin CMS — manage portfolio works. */
export const adminPortfolioApi = {
  list(params = {}) {
    return client.get('/api/admin/portfolio', { params }).then((r) => r.data);
  },
  create(formData) {
    return client
      .post('/api/admin/portfolio', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
  // Laravel can't parse multipart on PUT, so we POST with the same route.
  update(id, formData) {
    return client
      .post(`/api/admin/portfolio/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
  remove(id) {
    return client.delete(`/api/admin/portfolio/${id}`).then((r) => r.data);
  },
};
