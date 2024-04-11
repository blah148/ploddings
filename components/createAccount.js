import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateAccountForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Added a state to hold error messages

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
        const errorResponse = await response.json(); // Assuming the error response will be JSON

        if (response.status === 409) { // Assuming 409 status code for "account already exists"
          alert('An account already exists under the entered email.');
          return; // Stop execution further
        } else {
          throw new Error(`Failed to create account: ${errorResponse.message || 'Unknown error'}`);
        }
      }

      const { token } = await response.json();

      // Store the JWT token as a secure cookie on the client side
      document.cookie = `auth_token=${token}; Max-Age=604800; Path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
      alert('Account successfully created. You are now logged-in');
      // Redirect to the login or dashboard page
      router.push('/'); // Adjust the route as needed
    } catch (error) {
      console.error('Error:', error.message);
      setErrorMessage(error.message); // Update the state to display the error message
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
        <button type="submit">Create account</button>
        {errorMessage && <p>{errorMessage}</p>} {/* Display any error message */}
      </form>
    </div>
  );
}

