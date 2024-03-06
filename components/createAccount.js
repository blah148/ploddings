import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateAccountForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleCreateAccount = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      const response = await fetch('/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorResponse = await response.text(); // Try to read the response text
        throw new Error(`Failed to create account: ${errorResponse}`);
      }

      const { token } = await response.json();

      // Store the JWT token as a secure cookie on the client side
      document.cookie = `auth_token=${token}; Max-Age=604800; Path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;

      // Redirect to the login or dashboard page
      router.push('/'); // Adjust the route as needed
    } catch (error) {
      console.error('Error:', error.message);
      // Optionally, display the error to the user using a state variable
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateAccount}>
        <input
          type="email"
          className="inputLabel"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required // Ensure the input is filled
        />
        <button type="submit">Save Settings / Create Account</button>
      </form>
    </div>
  );
}

