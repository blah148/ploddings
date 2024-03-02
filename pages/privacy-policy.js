// pages/privacy.js
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import IpodMenuLink from '../components/ParentBackLink';
import jwt from 'jsonwebtoken';
import Loader from '../components/Loader';
import { useLoading } from '../context/LoadingContext';
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

export default function PrivacyPolicy({ userId, ip }) {

	const { isLoading, setIsLoading } = useLoading();

  return (
		<div className="bodyA">
        <SEO
					title="Privacy Policy"
          description="Keep in-tune with the privacy-policies of Ploddings. No 3rd-party tracking software from Google gets used, and all account information is deletable on request"
          slug="/privacy-policy"
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
												<h1>Privacy Policy</h1>
												<p>Ploddings is dedicated to safeguarding the privacy of all users. This Privacy Policy outlines the types of personal information collected and how it is used and protected.</p>

												<h2>Information Collection and Use</h2>
												<p>Ploddings is a guitar education platform offering tablature, written content, and video tutorials to the online learning experience. No third-party cookies are used for tracking analytics, ensuring the browsing habits of all visitors remains outside the reach of unknown parties.</p>

												<h2>MuseScore Embedded Content</h2>
												<p>Some song pages incorporate embedded tablature from MuseScore, which contains Yandex tracking software. Although this tracking is not within the control of the site, Ploddings is actively working on blocking using JavaScript content-security-policies to protect your privacy, and users will be updated about progress on that front.</p>

												<h2>Local Storage for Guests</h2>
												<p>Guest visitors have their browsing history and starred items saved in the local storage of their device browser history. This information is private to you and can be deleted at any time by clearing your browser's history.</p>

												<h2>Data Security for Registered Users</h2>
												<p>For users with an account, Ploddings stores your email address, page-visit history, and list of starred items securely within a Supabase database. All of that data is removable upon request; please use the contact form to make that request and receive confirmation of the deletion.</p>

												<h2>Your Privacy</h2>
												<p>Online privacy is extremely important. Ploddings is committed to maintaining the confidentiality and integrity of user information, providing transparency about the data practices used. Robust security measures are implemented and continuously updated so that the minimal information stored is never compromised.</p>

												<p>For any questions or concerns regarding this Privacy Policy, please do not hesitate to reach out via the site contact form.</p>
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

