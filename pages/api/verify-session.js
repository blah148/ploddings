// pages/api/verify-session.js
import { verifyToken } from './utils/authMiddleware';

export default async function handler(req, res) {
  try {
    const { user } = await verifyToken(req);
    res.status(200).json({ loggedIn: true, user });
  } catch (error) {
    res.status(401).json({ loggedIn: false, error: error.message });
  }
}

