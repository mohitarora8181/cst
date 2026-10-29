import { Notification } from '../models/index.js';

export async function listNotifications(req, res) {
  const [items, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({ success: true, items, unread });
}

export async function markRead(req, res) {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true });
  res.json({ success: true });
}

export async function markAllRead(req, res) {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true });
}
