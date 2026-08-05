import { useState } from "react";
import { isEmailValid } from "../../utils/chatUtils";
import { generateId } from "../../services/chatStorageService";

export default function GuestChatForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!isEmailValid(email)) nextErrors.email = "Please enter a valid email address.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      customerId: generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    });
  }

  return (
    <form className="chat-guest-form" onSubmit={handleSubmit}>
      <p className="chat-guest-heading">Start a conversation</p>
      <p className="chat-guest-sub">
        Tell us how we can reach you so our support team can help.
      </p>
      <div className="chat-guest-field">
        <label htmlFor="chat-guest-name">Name</label>
        <input
          id="chat-guest-name"
          type="text"
          value={name}
          placeholder="Your name"
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <span className="chat-guest-error">{errors.name}</span>}
      </div>
      <div className="chat-guest-field">
        <label htmlFor="chat-guest-email">Email</label>
        <input
          id="chat-guest-email"
          type="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span className="chat-guest-error">{errors.email}</span>}
      </div>
      <div className="chat-guest-field">
        <label htmlFor="chat-guest-phone">Phone (optional)</label>
        <input
          id="chat-guest-phone"
          type="tel"
          value={phone}
          placeholder="(+855) 1234 5678"
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <button type="submit" className="chat-guest-submit">
        Start Chat
      </button>
    </form>
  );
}
