import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="page">
      <div className="container">
        <div className="contact-section">
          <h1 className="page-title">Contact Us</h1>
          {submitted ? (
            <div className="contact-success">
              <h2 className="contact-success-title">Message Sent!</h2>
              <p className="contact-success-message">
                Thanks We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name</label>
                <input className="form-input" type="text" id="name" placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input className="form-input" type="email" id="email" placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea className="form-input form-textarea" id="message" rows="5" placeholder="Tell us what's on your mind..." required />
              </div>
              <button type="submit" className="btn btn-primary btn-large">Send Message</button>
            </form>
          )}
          <div className="contact-info">
            <h2 className="contact-info-title">Other Ways to Reach Us</h2>
            <p className="contact-info-item">Email: support@keyforge.com</p>
            <p className="contact-info-item">Phone: (+885) 123-4567</p>
            <p className="contact-info-item">Location: Cambodia,Phnom Penh </p>
          </div>
        </div>
      </div>
    </div>
  );
}
