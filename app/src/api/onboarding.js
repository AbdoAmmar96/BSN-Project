import client from './client';

export const onboardingApi = {
  show() {
    return client.get('/api/onboarding').then((r) => r.data);
  },
  save(payload) {
    return client.post('/api/onboarding', payload).then((r) => r.data);
  },
  skip() {
    return client.post('/api/onboarding/skip').then((r) => r.data);
  },
};
