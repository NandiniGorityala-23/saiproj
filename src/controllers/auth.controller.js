import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env.js';
import User from '../models/User.model.js';

const signToken = (id) =>
  jwt.sign({ id }, getEnv('JWT_SECRET'), { expiresIn: '7d' });

const sendToken = (user, status, res) => {
  const token = signToken(user._id);

  res.status(status).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.create({ name, email, password, role });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    const user = await User.findOne({ email, role }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

