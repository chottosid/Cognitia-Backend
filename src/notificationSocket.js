import { WebSocketServer } from 'ws';
import { subscribeNotifications } from './utils/queue.js';

const wss = new WebSocketServer({ noServer: true });

// Map userId to set of sockets
const userSockets = new Map();

wss.on('connection', (ws, request, userId) => {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(ws);

  ws.on('close', () => {
    userSockets.get(userId).delete(ws);
    if (userSockets.get(userId).size === 0) userSockets.delete(userId);
  });
});

// Listen for notifications from Redis and push to correct user
subscribeNotifications((notification) => {
  const { userId } = notification;
  if (userSockets.has(userId)) {
    for (const ws of userSockets.get(userId)) {
      ws.send(JSON.stringify(notification));
    }
  }
});

export default wss;
