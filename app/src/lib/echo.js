import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import apiClient from '@/api/client';

// Pusher is required by laravel-echo as the underlying broadcaster
window.Pusher = Pusher;

let echoInstance = null;

/**
 * Initializes the Echo client connected to Laravel Reverb.
 * Should be called after the user is authenticated.
 */
export function initEcho() {
  if (echoInstance) return echoInstance;

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'bsn-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],

    // Custom authorizer that uses our Sanctum bearer token
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        apiClient
          .post('/api/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((r) => callback(null, r.data))
          .catch((err) => callback(err, null));
      },
    }),
  });

  return echoInstance;
}

export function getEcho() {
  if (!echoInstance) initEcho();
  return echoInstance;
}

/**
 * Disconnect and clean up Echo (call on logout).
 */
export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}

/**
 * Helper to subscribe to a private channel and handle cleanup.
 *
 * @param channelName - e.g. "chat-room.5"
 * @param events - { 'event.name': handler, ... }
 * @returns cleanup function
 */
export function subscribeToChannel(channelName, events) {
  const echo = getEcho();
  const channel = echo.private(channelName);

  Object.entries(events).forEach(([evt, handler]) => {
    channel.listen(`.${evt}`, handler);
  });

  return () => {
    Object.keys(events).forEach((evt) => {
      channel.stopListening(`.${evt}`);
    });
    echo.leave(channelName);
  };
}
