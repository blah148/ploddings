// utils/authMiddleware.js
import jwt from 'jsonwebtoken';

export async function verifyToken(req) {
  const token = req.cookies['auth_token'];
  if (!token) {
    throw new Error('No token provided'); // Throw an error instead of directly responding
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log('this is the user data', decoded);
    return { user: decoded }; // Return decoded token data
  } catch (error) {
    throw new Error('Invalid token'); // Throw an error for invalid tokens
  }
}

