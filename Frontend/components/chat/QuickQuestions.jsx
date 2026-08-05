const QUESTIONS = [
  "Is this product available?",
  "Where is my order?",
  "How long does delivery take?",
  "What payment methods do you accept?",
  "Can I return a product?",
];

export default function QuickQuestions({ onSelect }) {
  return (
    <div className="chat-quick-questions">
      <p className="chat-quick-title">Quick questions</p>
      <div className="chat-quick-list">
        {QUESTIONS.map((question) => (
          <button
            type="button"
            key={question}
            className="chat-quick-btn"
            onClick={() => onSelect(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
