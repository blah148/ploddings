import { useState } from 'react';
import Loader from '../components/Loader';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import IpodMenuLink from '../components/ParentBackLink';
import { useLoading } from '../context/LoadingContext';

export default function Custom404 () {

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
		

    try {
      const response = await fetch('/api/sendContactForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
			
			startLoading();

      if (response.ok) {
        setFormData({
          subject: '404 error',
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
			<div className="mainFeedAll">
				<div className="feedContainer">
					<Loader isLoading={isLoading} />
					<div className="mainFeed">
						<div className="topRow">
							<IpodMenuLink fallBack="/" />
							<Menu userId={userId} />
						</div>
						<div className="narrowedFeedBody">
							<h1>404 error</h1>
							<div className="alertNotice">Ploddings has dropped many old pages, now focused solely on higher-quality, playable-MIDI tablature, scrapping old pages with PDF tablature and some outdated blogs. If there are specific pages you wish to see, please send a request.</div>
							<form>
								<label htmlFor="message">Report a missing page: <span style={{ color: 'red' }}>*</span>:</label><br />
								<textarea
									id="message"
									name="message"
									required
									value={message}
									onChange={handleChange}
								></textarea><br /><br />
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


