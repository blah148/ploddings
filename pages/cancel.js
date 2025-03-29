import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import IpodMenuLink from '../components/ParentBackLink';
import Menu from '../components/Menu';
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

const Cancel = ({ userId, ip }) => {
  return (
    <div className="bodyA">
      <SEO title="Payment Canceled" description="Payment was not completed." slug="/cancel" />
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink fallBack='' />
              <div style={{ display: "flex" }}>
                <Menu userId={userId} />
              </div>
            </div>
            <div className="narrowedFeedBody">
              <StabilizerText />
              <h1>Payment Canceled</h1>
              <p>Your payment was canceled. Please try again or contact support if you need assistance.</p>
              <div className="accountNotice">
                <div>Try again? Go to: <Link href="/create-user" passHref>create user</Link></div>
              </div>
            </div>
          </div>
        </div>
        <Footer userId={userId} />
      </div>
    </div>
  );
};

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

export default Cancel;

