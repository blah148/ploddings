// pages/login.js
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send an email with a verification code to the provided email address
      const response = await axios.post('/api/send-code', { email });

      if (response.status === 200) {
        // Display a message to check their email for the verification code
        console.log('Check your email for the verification code.');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      // Verify the provided code
      const response = await axios.post('/api/verify-code', { email, code });

      if (response.status === 200) {
        // Code is valid, log the user in and redirect to a protected page
        console.log('Successfully logged in.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <p>Login to your Ploddings account.</p>

      {/* Email submission form */}
      <form onSubmit={handleEmailSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send Verification Code</button>
      </form>

      {/* Code verification form */}
      <form onSubmit={handleLoginSubmit}>
        <input
          type="text"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit">Verify Code & Login</button>
      </form>
    </div>
  );
}

