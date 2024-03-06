import { useState } from 'react';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import IpodMenuLink from '../components/ParentBackLink';
import jwt from 'jsonwebtoken';
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

export default function ContactForm ({ userId, ip  }) {

  const { isLoading, startLoading, stopLoading } = useLoading();
  const [formData, setFormData] = useState({
    fname: '',
    email: '',
    subject: '',
    message: '',
  });

  const { fname, email, subject, message } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      alert('Please fill in all required fields.');
      return;
    }
		
		startLoading();

    try {
      const response = await fetch('/api/sendContactForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          fname: '',
          email: '',
          subject: '',
          message: '',
        });
        alert('Form submitted successfully!');
				stopLoading();
      } else {
				stopLoading();
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred while submitting the form.');
    }
  };

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
							<Menu userId={userId} />
						</div>
						<div className="narrowedFeedBody">
							<h1>Contact</h1>
							<form onSubmit={handleSubmit}>
								<label htmlFor="name">Name: (optional)</label>
								<input
									className="formRow"
									type="text"
									id="fname"
									name="fname"
									value={formData.fname}
									onChange={handleChange}
								/>								
								<label htmlFor="email">Email <span style={{ color: 'red' }}>*</span>:</label>
								<input
									className="formRow"
									type="email"
									id="email"
									name="email"
									value={email}
									required
									onChange={handleChange}
								/>
								<label htmlFor="subject">Subject <span style={{ color: 'red' }}>*</span>:</label>
								<select
									className="formRow"
									id="subject"
									name="subject"
									value={subject}
									required
									onChange={handleChange}
								>
									<option value="">Please select an option</option>
									<option value="General Question">General question/message</option>
									<option value="Content Suggestion">Content suggestion/request</option>
									<option value="Bug Report">Report a bug</option>
									<option value="Account Info">Account & login information</option>
								</select>
								<label htmlFor="message">Message <span style={{ color: 'red' }}>*</span>:</label>
								<textarea
									className="formRow"
									id="message"
									name="message"
									required
									value={message}
									onChange={handleChange}
								></textarea>
								<button type="submit" value="Submit">Submit</button>
							</form>
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

