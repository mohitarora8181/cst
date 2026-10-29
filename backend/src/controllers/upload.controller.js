import { uploadToImgbb } from '../services/imgbb.service.js';
import { ApiError } from '../utils/ApiError.js';

export async function uploadImage(req, res) {
  if (!req.file) throw ApiError.badRequest('Attach an image in the "image" field');
  const name = `${req.user.role}-${req.user._id}-${Date.now()}`;
  const image = await uploadToImgbb(req.file, name);
  res.status(201).json({ success: true, image });
}
