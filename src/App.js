import React, { useState, useEffect } from "react";
import "./App.css";

const Loader = () => (
  <div className="loader-container">
    <div className="loader-text">MoneyControl Demo</div>
  </div>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([]);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  useEffect(() => {
    // Delay matches bounce + fade-out animation duration (1s + 0.5s)
    const timer = setTimeout(() => {
      setIsLoading(false); // Hide loader
    }, 1500); // Total animation duration
    return () => clearTimeout(timer);
  }, []);

  const startListening = () => {
    setListening(true);
    recognition.start();
  };

  const stopListening = () => {
    setListening(false);
    recognition.stop();
  };

  recognition.onresult = (event) => {
    const transcriptMessage = event.results[0][0].transcript;
    setMessage(transcriptMessage);
    stopListening();
    handleMessage(transcriptMessage);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    stopListening();
  };

  const handleMessage = (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, user: true },
    ]);

    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Thanks", user: false },
      ]);
    }, 500);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      handleMessage(message);
      setMessage("");
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className={`container ${!isLoading ? "visible" : ""}`}>
        <h1>MoneyControl Demo</h1>
        <div className="chat-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.user ? "user-message" : "bot-message"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
          />
          <button className="btn" onClick={handleSendMessage}>
            Send
          </button>
          <button className="btn" onClick={startListening} disabled={listening}>
            {listening ? "Listening..." : "Speak"}
          </button>
          <button className="btn" onClick={stopListening} disabled={!listening}>
            Stop
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
