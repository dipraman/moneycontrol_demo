import React, { useState } from 'react';
import './App.css'; // Import the CSS file

const App = () => {
  const [message, setMessage] = useState('');
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastReceivedMessage, setLastReceivedMessage] = useState(''); // Store the last received message

  // Speech recognition and synthesis setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Configure recognition
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  // Start listening to the user's voice
  const startListening = () => {
    setListening(true);
    recognition.start();
  };

  // Stop listening
  const stopListening = () => {
    setListening(false);
    recognition.stop();
  };

  // Handle the end of speech recognition
  recognition.onresult = (event) => {
    const transcriptMessage = event.results[0][0].transcript;
    console.log('User Message:', transcriptMessage);  // Log the user's message to the console
    setMessage(transcriptMessage);  // Set the message state with the transcript
    stopListening();
    handleMessage(transcriptMessage);
  };

  // Handle errors
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    stopListening();
  };

  const handleMessage = (message) => {
    setMessages([...messages, { text: message, user: true }]);
    setLastReceivedMessage(message); // Store the last received message

    // Automatic "Thanks" reply
    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, { text: 'Thanks', user: false }]);
    }, 500);

    const substring1 = "water";
    const substring2 = "bottle";
    if ((message.indexOf(substring1) !== -1) || (message.indexOf(substring2) !== -1)) {
      console.log("Substring found!");
      // Make a call to the Flask app's /run-server endpoint
      fetch('http://localhost:8000/run-server')
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    } else {
      console.log("Substring not found.");
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      handleMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="container">
      <h1>MoneyControl Demo</h1>
      <div className="chat-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.user ? 'user-message' : 'bot-message'}`}>
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
        <button className="btn" onClick={handleSendMessage}>Send</button>
        <button className="btn" onClick={startListening} disabled={listening}>
          {listening ? 'Listening...' : 'Speak'}
        </button>
        <button className="btn" onClick={stopListening} disabled={!listening}>
          Stop
        </button>
      </div>
    </div>
  );
};

export default App;
