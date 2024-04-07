import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'cookie';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import NotificationIcon from '../components/NotificationIcon';
import jwt from 'jsonwebtoken';
import IpodMenuLink from '../components/ParentBackLink';
import SEO from '../components/SEO';
import SubscribeButton from '../components/StripeSubscription';
import OneTimePaymentButton from '../components/StripeOneTime';
import StabilizerText from '../components/StabilizerText';

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

  const handleCreateAccount = async (e) => {
    e.preventDefault(); // Prevent the form's default submission behavior
    console.log('About to try POST - client side');

    try {
      console.log('Entered function - client side');
      const response = await fetch('/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      console.log('After the POST request - client side');

      if (!response.ok) {
        const errorText = await response.text(); // Attempt to read response text for more detail
        throw new Error(`Failed to create account: ${errorText}`);
      }

      const { token } = await response.json();

      // Assuming 'setCookie' is available to set cookies
      document.cookie = `auth_token=${token}; Max-Age=604800; Path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
      alert('Account successfully created. You are now logged-in');
      router.push('/'); // Change to the appropriate route
    } catch (error) {
      console.error('Error during account creation:', error.message);
    }
  };

  return (
    <div className="bodyA">
      <SEO
        title="Subscribe | Ploddings"
        description="To persist your: (i) visit history, (ii) starred guitar tablature, and (iii) access the pitch-shifter and slow-downer, create an account on Ploddings with an email"
        slug="/subscribe"
      />
			<Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink fallBack='' />
							<div style={{display: "flex"}}>
								<NotificationIcon userId={userId} />
                <Menu userId={userId} />
							</div>
            </div>
            <div className="narrowedFeedBody">
							<StabilizerText />
              <h1>Subscribe</h1>
							<div>
								<ul>
									<li>2 credits per-month</li>
									<li>All proceeds to Mt. Zion Memorial Fund</li>
								</ul>
							</div>
							<SubscribeButton />
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
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}


