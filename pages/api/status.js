// pages/api/status.js
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export default function handler(req, res) {
  // Parse the Cookie header
  const cookies = parse(req.headers.cookie || '');
  const token = cookies['auth_token'];

  
  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ isAuthenticated: true, userId: decoded.id });
  } catch (error) {
    // Token verification failed
    return res.status(200).json({ isAuthenticated: false });
  }
}

