import { useState } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'cookie';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import jwt from 'jsonwebtoken';
import IpodMenuLink from '../components/ParentBackLink';
import SEO from '../components/SEO';

const verifyUserSession = (req) => {
  const token = req.cookies['auth_token'];
  if (!token) {
    return null; // No session
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Session valid
  } catch (error) {
    return null; // Session invalid
  }
};

export default function CreateAccount({ userId, ip }) {

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
    <div className="bodyA">
       <SEO
				 title="Create Account"
         description="To persist your: (i) visit history, (ii) starred guitar tablature, and (iii) access the pitch-shifter and slow-downer, create an account on Ploddings with an email"
         slug="/create-account"
       />
			<Sidebar userId={userId} ip={ip} />
			<div className="mainFeedAll">
				<div className="feedContainer">
					<Loader isLoading={isLoading} />
					<div className="mainFeed">
						<div className="topRow">
							<IpodMenuLink fallBack='' />
						  <Menu userId={userId} />
						</div>
						<div className="narrowedFeedBody">
						  <h1>Create Account</h1>
							<form>
								<input
									type="email"
									placeholder="Enter your email"
									className="inputLabel"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
								<button className="formButton" onClick={handleCreateAccount}>Create Account</button>
							</form>
						</div>
					</div>
				</div>
				<Footer userId={userId} />
			</div>
    </div>
  );
}

export async function getServerSideProps({ params, req }) {

  const userSession = verifyUserSession(req);
  const ip = req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}

