import { useState } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'cookie';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';

export default function CreateAccount() {

	const { isLoading, setIsLoading } = useLoading();

  const router = useRouter();
  const [email, setEmail] = useState('');

	const handleCreateAccount = async () => {
		try {
			const response = await fetch('/api/create-account', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			if (!response.ok) {
				throw new Error('Failed to create account');
			}

			const { token } = await response.json();

			// Store the JWT token as a secure cookie on the client side
			document.cookie = `auth_token=${token}; Max-Age=604800; Path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;

			// Redirect to the login or dashboard page
			router.push('/'); // Change to the appropriate route
		} catch (error) {
			console.error('Error:', error);
		}
	};

  return (
    <div>
      <h1>Create Account</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleCreateAccount}>Create Account</button>
    </div>
  );
}

