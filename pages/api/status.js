// pages/api/auth/status.js
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const token = req.cookies['auth_token'];

  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    // Token is valid
    return res.status(200).json({ isAuthenticated: true });
  } catch (error) {
    // Token verification failed
    return res.status(200).json({ isAuthenticated: false });
  }
}

