import Redis from 'ioredis';

const redisPublisher = new Redis(); // default localhost:6379
const redisSubscriber = new Redis();

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
