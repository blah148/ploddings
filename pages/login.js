import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';
import { useRouter } from 'next/router'; // Import useRouter for accessing the URL query
import Link from 'next/link';
import IpodMenuLink from '../components/ParentBackLink';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';
import NotificationIcon from '../components/NotificationIcon';
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

export default function Login({ userId, ip }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const { isLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();

  // Extract session_id from the URL and verify it
  useEffect(() => {
    const { session_id } = router.query;
    if (session_id) {
      verifyPaymentSession(session_id);
    }
  }, [router.query]); // Depend on router.query to ensure it's updated after client-side navigation

  const verifyPaymentSession = async (sessionId) => {
    try {
      const response = await axios.get(`/api/verify-payment?session_id=${sessionId}`);
      if (response.data.success) {
        setMessage('Payment successful! Please log in to access your account.');
      } else {
        setMessage('Payment verification failed. Please try your payment again.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setMessage('An error occurred while verifying payment.');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    startLoading();
    try {
      const response = await axios.post('/api/send-code', { email });
      if (response.status === 200) {
        alert('Check your email for the verification code');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
    }
    stopLoading();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    startLoading();
    try {
      const response = await axios.post('/api/verify-code', { email, code });
      if (response.status === 200) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error verifying code:', error);
    }
    stopLoading();
  };

  return (
    <div className="bodyA">
      <SEO title="Login" description="To revisit your: (i) visit history, (ii) starred tablature, and (iii) use the pitch-shifter/slow-downer, login to your Ploddings account with an email address" slug="/login" />
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink fallBack='' />
              <div style={{ display: "flex" }}>
                <NotificationIcon userId={userId} />
                <Menu userId={userId} />
              </div>
            </div>
            <div className="narrowedFeedBody">
              <StabilizerText />
              <h1>Login</h1>
              {message && <p>{message}</p>}
              <form onSubmit={handleEmailSubmit}>
                <label>Step 1: Receive code via email</label>
                <input type="email" placeholder="Enter your email" value={email} className="inputLabel" onChange={(e) => setEmail(e.target.value)} />
                <button type="submit">Send Verification Code</button>
              </form>
              <form onSubmit={handleLoginSubmit}>
                <label className="marginTop">Step 2: Submit code</label>
                <input type="text" placeholder="Enter verification code" value={code} className="inputLabel" onChange={(e) => setCode(e.target.value)} />
                <button type="submit">Verify Code & Login</button>
              </form>
              <div className="accountNotice">
                <div>Don't have an account? <Link href="/create-account" passHref>Create an account</Link></div>
              </div>
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
