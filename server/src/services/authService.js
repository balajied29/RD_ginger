const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { httpError } = require('../utils/respond');

const BCRYPT_COST = 12;

/** The only user shape the API ever returns — passwordHash never leaves. */
function publicUser(u) {
  return { id: u._id, email: u.email, name: u.name, role: u.role, active: u.active };
}

/** Failed logins are always the same generic message (Section 2.2 #7). */
async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  const valid = user && user.active && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) throw httpError(401, 'Invalid credentials');

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
  return { token, user: publicUser(user) };
}

async function createUser({ email, name, password, role }) {
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw httpError(400, 'Email already in use');

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const user = await User.create({ email, name, passwordHash, role });
  return publicUser(user);
}

async function listUsers() {
  const users = await User.find().sort({ createdAt: 1 });
  return users.map(publicUser);
}

async function updateUser(id, patch, actor) {
  // Lockout guard: an admin cannot deactivate or demote themselves.
  if (String(actor._id) === String(id)) {
    if (patch.active === false || (patch.role && patch.role !== 'admin')) {
      throw httpError(400, 'You cannot deactivate or demote your own account');
    }
  }
  const user = await User.findById(id);
  if (!user) throw httpError(404, 'User not found');
  Object.assign(user, patch);
  await user.save();
  return publicUser(user);
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw httpError(404, 'User not found');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw httpError(400, 'Current password is incorrect');

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
  await user.save();
}

module.exports = { login, createUser, listUsers, updateUser, changePassword, publicUser };
