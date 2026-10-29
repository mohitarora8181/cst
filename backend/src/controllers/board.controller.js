import { ArtistProfile, Board } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

const ITEM_PROFILE_FIELDS = 'slug stageName headline headshot gender dob city heightCm isVerified availability';

async function ownBoard(id, userId) {
  const board = await Board.findOne({ _id: id, owner: userId });
  if (!board) throw ApiError.notFound('Board not found');
  return board;
}

export async function listBoards(req, res) {
  const boards = await Board.find({ owner: req.user._id })
    .sort({ updatedAt: -1 })
    .populate('castingCall', 'roleName projectName')
    .populate({ path: 'items.profile', select: 'headshot stageName' });
  res.json({ success: true, items: boards });
}

export async function getBoard(req, res) {
  const board = await Board.findOne({ _id: req.params.id, owner: req.user._id })
    .populate('castingCall', 'roleName projectName')
    .populate({ path: 'items.profile', select: ITEM_PROFILE_FIELDS });
  if (!board) throw ApiError.notFound('Board not found');
  res.json({ success: true, board });
}

export async function createBoard(req, res) {
  const board = await Board.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, board });
}

export async function updateBoard(req, res) {
  const board = await ownBoard(req.params.id, req.user._id);
  board.set(req.body);
  await board.save();
  res.json({ success: true, board });
}

export async function deleteBoard(req, res) {
  const board = await ownBoard(req.params.id, req.user._id);
  await board.deleteOne();
  res.json({ success: true });
}

export async function addToBoard(req, res) {
  const board = await ownBoard(req.params.id, req.user._id);
  if (!(await ArtistProfile.exists({ _id: req.body.profileId }))) throw ApiError.notFound('Artist not found');
  if (board.items.some((i) => i.profile.equals(req.body.profileId))) throw ApiError.conflict('Artist is already on this board');
  board.items.push({ profile: req.body.profileId, note: req.body.note });
  await board.save();
  res.status(201).json({ success: true, board });
}

export async function removeFromBoard(req, res) {
  const board = await ownBoard(req.params.id, req.user._id);
  board.items = board.items.filter((i) => !i.profile.equals(req.params.profileId));
  await board.save();
  res.json({ success: true, board });
}
