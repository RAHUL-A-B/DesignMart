import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Chat.css';

export default function Chat() {
    const { user } = useAuth();
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Gets the state passed from ProductDetails
    
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeUser, setActiveUser] = useState(null);
    const chatContainerRef = useRef(null); // Ref for the scrollable container

    // Pre-fill message if coming from Product Details
    useEffect(() => {
        if (location.state?.productTitle && location.state?.productImage) {
            // 1. Paste the message
            setNewMessage(`Hi! I'm interested in: ${location.state.productTitle}\n${location.state.productImage}`);
            
            // 2. Clear the browser history state so it doesn't paste again on reload!
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    // Fetch conversations list
    useEffect(() => {
        api.get('/shoppers/chat/conversations/')
        .then(res => {
            if (Array.isArray(res.data)) setConversations(res.data);
        })
        .catch(err => console.error("Error fetching conversations", err));
    }, []);

    // Fetch messages for active user
    useEffect(() => {
        if (!userId) return;
        
        const fetchMessages = () => {
            api.get(`/shoppers/chat/${userId}/`)
            .then(res => {
                if (Array.isArray(res.data)) {
                    setMessages(res.data);
                    const convUser = conversations.find(c => c.id === parseInt(userId));
                    if (convUser) setActiveUser(convUser);
                }
            })
            .catch(err => console.error("Error fetching messages", err));
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Polling every 3s
        return () => clearInterval(interval);
    }, [userId, conversations]);

    // Fix auto-scroll to bottom of chat box ONLY
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !userId) return;

        api.post(`/shoppers/chat/${userId}/`, { content: newMessage })
        .then(res => {
            setMessages([...messages, res.data]);
            setNewMessage("");
            
            // Refresh conversations list if it's a new conversation
            if (!conversations.find(c => c.id === parseInt(userId))) {
                api.get('/shoppers/chat/conversations/')
                   .then(res => setConversations(res.data));
            }
        })
        .catch(err => console.error("Error sending message", err));
    };

    // Helper function to render images if a message contains a URL
    const renderMessageContent = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+(?:jpg|jpeg|png|gif|webp|unsplash[^\s]*)|http:\/\/127\.0\.0\.1:8000[^\s]+)/g;
        if (urlRegex.test(text)) {
            const parts = text.split(urlRegex);
            return parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    return <img key={i} src={part} alt="attachment" style={{ maxWidth: '100%', borderRadius: 8, display: 'block', marginTop: 8 }} />;
                }
                return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
            });
        }
        return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;
    };

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <h3>Messages</h3>
                <div className="conversation-list">
                    {conversations.length === 0 ? (
                        <p className="no-conversations">No conversations yet.</p>
                    ) : (
                        conversations.map(conv => (
                            <div 
                                key={conv.id} 
                                className={`conversation-item ${parseInt(userId) === conv.id ? 'active' : ''}`}
                                onClick={() => navigate(`/chat/${conv.id}`)}
                            >
                                <div className="avatar">{conv.name ? conv.name.charAt(0).toUpperCase() : '?'}</div>
                                <div className="conv-info">
                                    <span className="conv-name">{conv.name}</span>
                                    <span className="conv-role">{conv.role === 'DESIGNER' ? 'Designer' : 'User'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="chat-main">
                {userId ? (
                    <>
                        <div className="chat-header">
                            <h3>{activeUser ? activeUser.name : `Conversation`}</h3>
                        </div>
                        <div className="chat-messages" ref={chatContainerRef}>
                            {messages.map(msg => {
                                const isMine = msg.sender === user?.id;
                                return (
                                    <div key={msg.id} className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                                        <div className="message-bubble">
                                            {renderMessageContent(msg.content)}
                                            <span className="message-time">
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <form className="chat-input-area" onSubmit={sendMessage}>
                            <input 
                                type="text" 
                                placeholder="Type your message..." 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
