import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisPublisher = new Redis(redisUrl);
const redisSubscriber = new Redis(redisUrl);

const NOTIFICATION_CHANNEL = 'notifications';

export function publishNotification(notification) {
  redisPublisher.publish(NOTIFICATION_CHANNEL, JSON.stringify(notification));
}

export function subscribeNotifications(handler) {
  redisSubscriber.subscribe(NOTIFICATION_CHANNEL, (err, count) => {
    if (err) {
      console.error('Failed to subscribe: %s', err.message);
    }
  });

  redisSubscriber.on('message', (channel, message) => {
    if (channel === NOTIFICATION_CHANNEL) {
      handler(JSON.parse(message));
    }
  });
}
