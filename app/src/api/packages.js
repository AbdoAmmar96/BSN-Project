import client from './client';

export const packagesApi = {
  publicList(serviceType) {
    const params = serviceType ? { service_type: serviceType } : {};
    return client.get('/api/packages', { params }).then(r => r.data);
  },
  adminList() {
    return client.get('/api/admin/packages').then(r => r.data);
  },
  create(data) {
    return client.post('/api/admin/packages', data).then(r => r.data);
  },
  update(id, data) {
    return client.put(`/api/admin/packages/${id}`, data).then(r => r.data);
  },
  remove(id) {
    return client.delete(`/api/admin/packages/${id}`).then(r => r.data);
  },
};

export const SERVICE_TYPE_LABELS = {
  web: 'تطوير المواقع',
  ecommerce: 'المتاجر الإلكترونية',
  branding: 'الهوية البصرية',
  marketing: 'التسويق الرقمي',
};
