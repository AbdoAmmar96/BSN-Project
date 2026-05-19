import client from './client';

export const notificationsApi = {
  list() {
    return client.get('/api/notifications').then(r => r.data);
  },
  markRead(id) {
    return client.post(`/api/notifications/${id}/read`).then(r => r.data);
  },
  markAllRead() {
    return client.post('/api/notifications/read-all').then(r => r.data);
  },
};
