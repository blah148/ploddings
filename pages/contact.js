import { useState } from 'react';

const ContactForm = () => {
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

      if (response.ok) {
        setFormData({
          fname: '',
          email: '',
          subject: '',
          message: '',
        });
        alert('Form submitted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred while submitting the form.');
    }
  };

  return (
    // Use Next.js's built-in CSS support for styling if needed.
    <form onSubmit={handleSubmit}>
      <label htmlFor="fname">First Name:</label><br />
      <input
        type="text"
        id="fname"
        name="fname"
        value={fname}
        onChange={handleChange}
      /><br />
      
      <label htmlFor="email">Email <span style={{color: 'red'}}>*</span>:</label><br />
      <input
        type="email"
        id="email"
        name="email"
        value={email}
        required
        onChange={handleChange}
      /><br />
      
      <label htmlFor="subject">Subject <span style={{color: 'red'}}>*</span>:</label><br />
      <select
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
      </select><br />
      
      <label htmlFor="message">Message <span style={{color: 'red'}}>*</span>:</label><br />
      <textarea
        id="message"
        name="message"
        required
        value={message}
        onChange={handleChange}
      ></textarea><br /><br />
      
      <input type="submit" value="Submit" />
    </form>
  );
};

export default ContactForm;

