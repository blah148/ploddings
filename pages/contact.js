import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import IpodMenuLink from '../components/ParentBackLink';
import jwt from 'jsonwebtoken';
import { useLoading } from '../context/LoadingContext';
import SEO from '../components/SEO';
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

export default function ContactForm({ userId, ip }) {
  const { isLoading } = useLoading();

  return (
    <div className="bodyA">
      <SEO
        title="Contact"
        description="For anything Ploddings-related where you need a hand from the other-side, from suggesting songs to help with your account, one can reach out by contacting"
        slug="/contact"
      />
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink fallBack="" />
              <div style={{ display: 'flex' }}>
                <Menu userId={userId} />
              </div>
            </div>
            <div className="narrowedFeedBody">
              <StabilizerText />
              <h1>Contact</h1>

              {/* 
              <form onSubmit={handleSubmit}>
                ...
              </form>
              */}

              <p>
                Please send messages/inquiries to:{' '}
                <a href="mailto:info@ploddings.com">info@ploddings.com</a>. Thank you.
              </p>
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

