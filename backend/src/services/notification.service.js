import { Notification } from '../models/index.js';

/** Fire-and-forget in-app notification; never blocks or fails the caller. */
export function notify(userId, { type = 'system', title, body, link }) {
  return Notification.create({ user: userId, type, title, body, link }).catch((err) =>
    console.warn('[notify] failed', err.message)
  );
}

export function notifyMany(userIds, payload) {
  if (!userIds.length) return Promise.resolve();
  return Notification.insertMany(userIds.map((user) => ({ user, ...payload })), { ordered: false }).catch((err) =>
    console.warn('[notify] bulk failed', err.message)
  );
}
