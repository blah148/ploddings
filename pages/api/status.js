// pages/api/status.js
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export default function handler(req, res) {
  // Parse the Cookie header
  const cookies = parse(req.headers.cookie || '');
  const token = cookies['auth_token'];

  console.log('this is the token data from status.js first', token);
  
  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    // Token is valid
    console.log('this is the token data from status.js', token);
    return res.status(200).json({ isAuthenticated: true });
  } catch (error) {
    // Token verification failed
    return res.status(200).json({ isAuthenticated: false });
  }
}

