// pages/api/logout.js

export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
  res.status(200).json({ message: 'Logged out' });
}

