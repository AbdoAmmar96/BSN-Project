import client from './client';

export const authApi = {
  register(data) {
    return client.post('/api/auth/register', data).then(r => r.data);
  },

  login(email, password) {
    return client.post('/api/auth/login', { email, password }).then(r => r.data);
  },

  me() {
    return client.get('/api/auth/me').then(r => r.data);
  },

  logout() {
    return client.post('/api/auth/logout').then(r => r.data);
  },

  updateProfile(data) {
    return client.put('/api/auth/profile', data).then(r => r.data);
  },

  changePassword(data) {
    return client.put('/api/auth/password', data).then(r => r.data);
  },

  forgotPassword(email) {
    return client.post('/api/auth/forgot-password', { email }).then(r => r.data);
  },

  resetPassword(payload) {
    return client.post('/api/auth/reset-password', payload).then(r => r.data);
  },
};
