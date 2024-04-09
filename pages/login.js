// pages/login.js
import { useState } from 'react';
import axios from 'axios';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';
import jwt from 'jsonwebtoken';
import IpodMenuLink from '../components/ParentBackLink';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';
import Link from 'next/link';
import NotificationIcon from '../components/NotificationIcon';
import StabilizerText from '../components/StabilizerText';
import TokenAndBalance from '../components/TokensMenuItem';

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
	const { isLoading, startLoading, stopLoading } = useLoading();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
			startLoading();
      // Send an email with a verification code to the provided email address
      const response = await axios.post('/api/send-code', { email });

      if (response.status === 200) {
        // Display a message to check their email for the verification code
				alert('Check your email for the verification code');
				stopLoading();
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
			stopLoading();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
			startLoading();
      // Verify the provided code
      const response = await axios.post('/api/verify-code', { email, code });

      if (response.status === 200) {
				stopLoading();
        // Code is valid, log the user in and redirect to a protected page
				window.location.href = '/';
      }
    } catch (error) {
			stopLoading();
      console.error('Error verifying code:', error);
    }
  };

  return (
    <div className="bodyA">
       <SEO
				 title="Login"
         description="To revisit your: (i) visit history, (ii) starred tablature, and (iii) use the pitch-shifter/slow-downer, login to your Ploddings account with an email address"
         slug="/login"
       />
			<Sidebar userId={userId} ip={ip} />
			<div className="mainFeedAll">
				<div className="feedContainer">
					<Loader isLoading={isLoading} />
					<div className="mainFeed">
						<div className="topRow">
							<IpodMenuLink fallBack='' />
							<div style={{display: "flex"}}>
								{userId && <TokenAndBalance userId={userId} />}
								<NotificationIcon userId={userId} />
                <Menu userId={userId} />
							</div>
						</div>
						<div className="narrowedFeedBody">
							<StabilizerText />
						  <h1>Login</h1>
							<form onSubmit={handleEmailSubmit}>
								<label>Step 1: Receive code via email</label>
								<input
									type="email"
									placeholder="Enter your email"
									value={email}
									className="inputLabel"
									onChange={(e) => setEmail(e.target.value)}
								/>
								<button type="submit">Send Verification Code</button>
							</form>
							{/* Code verification form */}
							<form onSubmit={handleLoginSubmit}>
								<label className="marginTop" >Step 2: Submit code</label>
								<input
									type="text"
									placeholder="Enter verification code"
									value={code}
									onChange={(e) => setCode(e.target.value)}
									className="inputLabel"
								/>
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

