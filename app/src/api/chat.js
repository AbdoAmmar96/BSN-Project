import client from './client';

export const chatApi = {
  /** List all chat rooms for current user */
  rooms() {
    return client.get('/api/chat/rooms').then(r => r.data);
  },

  /** Get a room's details + recent messages */
  show(roomId) {
    return client.get(`/api/chat/rooms/${roomId}`).then(r => r.data);
  },

  /** Load older messages (cursor pagination) */
  messages(roomId, beforeId = null) {
    const params = beforeId ? { before_id: beforeId } : {};
    return client.get(`/api/chat/rooms/${roomId}/messages`, { params }).then(r => r.data);
  },

  /** Send a text message */
  send(roomId, body, replyToId = null) {
    return client.post(`/api/chat/rooms/${roomId}/messages`, {
      body, reply_to_id: replyToId,
    }).then(r => r.data);
  },

  /** Send a message with attachment */
  sendWithFile(roomId, body, file, replyToId = null) {
    const fd = new FormData();
    if (body) fd.append('body', body);
    if (replyToId) fd.append('reply_to_id', replyToId);
    fd.append('attachment', file);
    return client.post(`/api/chat/rooms/${roomId}/messages`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  /** Mark room as read */
  markRead(roomId) {
    return client.post(`/api/chat/rooms/${roomId}/read`).then(r => r.data);
  },

  /** Broadcast typing indicator */
  typing(roomId, isTyping = true) {
    return client.post(`/api/chat/rooms/${roomId}/typing`, { is_typing: isTyping }).then(r => r.data);
  },

  /** Get-or-create a project's chat room */
  projectRoom(projectId) {
    return client.post(`/api/chat/rooms/project/${projectId}`).then(r => r.data);
  },

  /** Get-or-create direct chat with another user */
  directRoom(otherUserId) {
    return client.post(`/api/chat/rooms/direct/${otherUserId}`).then(r => r.data);
  },

  /** Delete own message */
  deleteMessage(messageId) {
    return client.delete(`/api/chat/messages/${messageId}`).then(r => r.data);
  },

  /** Open a new support ticket (creates room + first message) */
  supportTicket(subject, body) {
    return client.post('/api/chat/support', { subject, body }).then(r => r.data);
  },
};
