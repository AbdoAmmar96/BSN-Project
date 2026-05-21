import client from './client';

export const projectsApi = {
  list(params = {}) {
    return client.get('/api/projects', { params }).then(r => r.data);
  },
  show(id) {
    return client.get(`/api/projects/${id}`).then(r => r.data);
  },
  create(data) {
    return client.post('/api/projects', data).then(r => r.data);
  },
  update(id, data) {
    return client.put(`/api/projects/${id}`, data).then(r => r.data);
  },
  delete(id) {
    return client.delete(`/api/admin/projects/${id}`).then(r => r.data);
  },
  addMember(projectId, userId, role = 'contributor') {
    return client.post(`/api/admin/projects/${projectId}/members`, { user_id: userId, role }).then(r => r.data);
  },
  removeMember(projectId, userId) {
    return client.delete(`/api/admin/projects/${projectId}/members/${userId}`).then(r => r.data);
  },
};

export const tasksApi = {
  forProject(projectId) {
    return client.get(`/api/projects/${projectId}/tasks`).then(r => r.data);
  },
  mine(params = {}) {
    return client.get('/api/dev/tasks', { params }).then(r => r.data);
  },
  create(projectId, data) {
    return client.post(`/api/projects/${projectId}/tasks`, data).then(r => r.data);
  },
  update(id, data) {
    return client.put(`/api/tasks/${id}`, data).then(r => r.data);
  },
  delete(id) {
    return client.delete(`/api/tasks/${id}`).then(r => r.data);
  },
};

export const deliverablesApi = {
  forProject(projectId) {
    return client.get(`/api/projects/${projectId}/deliverables`).then(r => r.data);
  },
  upload(projectId, formData) {
    return client.post(`/api/projects/${projectId}/deliverables`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  approve(id) {
    return client.post(`/api/deliverables/${id}/approve`).then(r => r.data);
  },
  delete(id) {
    return client.delete(`/api/deliverables/${id}`).then(r => r.data);
  },
};

// ============================================
// CONSTANTS
// ============================================

export const PROJECT_STATUS = {
  draft: { label: 'مسودة', color: 'bg-gray-300 text-gray-700' },
  pending: { label: 'في الانتظار', color: 'bg-yellow-200 text-yellow-800' },
  pending_assignment: { label: 'بانتظار التعيين', color: 'bg-yellow-300 text-yellow-900' },
  quoted: { label: 'عرض مرسل', color: 'bg-blue-200 text-blue-800' },
  approved: { label: 'موافق عليه', color: 'bg-brand-teal text-brand-purple-deep' },
  in_progress: { label: 'قيد التنفيذ', color: 'bg-brand-orange text-white' },
  review: { label: 'مراجعة', color: 'bg-brand-purple text-white' },
  revision: { label: 'تعديلات', color: 'bg-orange-300 text-orange-900' },
  completed: { label: 'مكتمل', color: 'bg-green-500 text-white' },
  cancelled: { label: 'ملغي', color: 'bg-red-400 text-white' },
  on_hold: { label: 'موقف مؤقت', color: 'bg-gray-400 text-white' },
};

export const SERVICE_TYPE = {
  web: { label: 'تطوير ويب', icon: '⚡' },
  ecommerce: { label: 'متجر إلكتروني', icon: '🛒' },
  branding: { label: 'هوية بصرية', icon: '🎨' },
  marketing: { label: 'تسويق رقمي', icon: '📈' },
  seo: { label: 'SEO', icon: '🔍' },
  email: { label: 'إيميل ماركتنج', icon: '✉️' },
  other: { label: 'أخرى', icon: '📌' },
};

export const TASK_STATUS = {
  todo: { label: 'للعمل', color: 'bg-gray-200 text-gray-700' },
  in_progress: { label: 'جاري', color: 'bg-brand-orange text-white' },
  review: { label: 'مراجعة', color: 'bg-brand-purple text-white' },
  done: { label: 'تم', color: 'bg-green-500 text-white' },
};

export const TASK_PRIORITY = {
  low: { label: 'منخفضة', color: 'bg-gray-300 text-gray-700', dot: 'bg-gray-400' },
  normal: { label: 'عادية', color: 'bg-blue-200 text-blue-800', dot: 'bg-blue-500' },
  high: { label: 'عالية', color: 'bg-brand-orange text-white', dot: 'bg-brand-orange' },
  urgent: { label: 'عاجلة', color: 'bg-red-500 text-white', dot: 'bg-red-500' },
};
