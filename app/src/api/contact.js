import client from './client';

export const contactApi = {
  send(data) {
    return client.post('/api/contact', data).then(r => r.data);
  },
};
