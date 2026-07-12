const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const authService = require('../services/authService');

const login = asyncHandler(async (req, res) => {
  ok(res, await authService.login(req.body.email, req.body.password));
});

const me = asyncHandler(async (req, res) => {
  ok(res, authService.publicUser(req.user));
});

const createUser = asyncHandler(async (req, res) => {
  ok(res, await authService.createUser(req.body), { status: 201 });
});

const listUsers = asyncHandler(async (req, res) => {
  ok(res, await authService.listUsers());
});

const updateUser = asyncHandler(async (req, res) => {
  ok(res, await authService.updateUser(req.params.id, req.body, req.user));
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  ok(res, { changed: true });
});

module.exports = { login, me, createUser, listUsers, updateUser, changePassword };
