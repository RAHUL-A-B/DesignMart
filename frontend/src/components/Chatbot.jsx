import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello 👋 I can now analyze images! Upload a photo of a dress you like, and I will find it for you.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle image selection, resize it to prevent crashing, and convert to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image object to resize it
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG to save space
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setSelectedImage(compressedBase64);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !selectedImage) return;

    // Add user message to chat UI
    const userMessage = { sender: 'user', text: inputValue, image: selectedImage };
    setMessages((prev) => [...prev, userMessage]);
    
    // Extract raw base64 string without the "data:image/jpeg;base64," prefix
    const base64Image = selectedImage ? selectedImage.split(',')[1] : null;

    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chatbot/ask/', {
        message: userMessage.text,
        image: base64Image
      });

      const botMessage = {
        sender: 'bot',
        text: response.data.reply,
        products: response.data.products || []
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages((prev) => [
        ...prev, 
        { sender: 'bot', text: "Oops! Make sure Ollama is running and you downloaded the model!" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>✨ AI Style Assistant</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                <div className={`message ${msg.sender}`}>
                  {msg.text}
                  {/* Display user's uploaded image in chat */}
                  {msg.image && <img src={msg.image} alt="Uploaded" style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", marginTop: "8px" }} />}
                </div>
                
                {msg.products && msg.products.length > 0 && (
                  <div className="products-container">
                    {msg.products.map(product => (
                      <div 
                        key={product.id} 
                        className="product-card"
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img 
                          src={`http://localhost:8000${product.image}`} 
                          alt={product.title} 
                          className="product-image"
                        />
                        <p className="product-title">{product.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className="chatbot-input" onSubmit={handleSend}>
            
            {/* Image Preview Popup */}
            {selectedImage && (
              <div className="image-preview-container" style={{ position: "absolute", top: "-65px", left: "20px", background: "white", padding: "4px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", zIndex: 10 }}>
                <img src={selectedImage} alt="Preview" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }} />
                <button type="button" className="remove-image-btn" onClick={() => setSelectedImage(null)} style={{ position: "absolute", top: "-8px", right: "-8px", background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 11 }}>×</button>
              </div>
            )}

            {/* Hidden File Input & Paperclip Button */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageChange} 
            />
            <button type="button" className="attach-btn" onClick={() => fileInputRef.current.click()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>

            <input
              type="text"
              placeholder="Ask for 'black dresses' or upload a photo..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="send-btn" disabled={isLoading || (!inputValue.trim() && !selectedImage)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
