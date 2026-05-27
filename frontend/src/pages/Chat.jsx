import { useState, useEffect, useRef, useCallback } from 'react';
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
    const [currentUserId, setCurrentUserId] = useState(user?.id || null);
    const chatContainerRef = useRef(null); // Ref for the scrollable container
    
    // NEW: State to hold the attached product from ProductDetails
    const [attachedProduct, setAttachedProduct] = useState(null);

    useEffect(() => {
        if (currentUserId) return;

        api.get('/auth/profile/')
            .then(res => setCurrentUserId(res.data.id))
            .catch(err => console.error("Error fetching current user profile", err));
    }, [currentUserId]);

    const scrollChatToBottom = useCallback(() => {
        if (!chatContainerRef.current) return;
        requestAnimationFrame(() => {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        });
    }, []);

    // Pre-fill message if coming from Product Details (ChatGPT Style Attachment)
    useEffect(() => {
        if (location.state?.productTitle && location.state?.productImage) {
            // Attach the product instead of pasting text into the input box
            setAttachedProduct({
                title: location.state.productTitle,
                image: location.state.productImage
            });
            
            // Clear history so it doesn't attach again on reload
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
        scrollChatToBottom();
    }, [messages, scrollChatToBottom]);

    const sendMessage = (e) => {
        e.preventDefault();
        
        // Prevent sending if both input and attachment are empty
        if (!newMessage.trim() && !attachedProduct) return;
        if (!userId) return;

        // Combine attachment and typed message
        let contentToSend = newMessage.trim();
        if (attachedProduct) {
            // Prepend the image URL and title so the backend receives it
            contentToSend = `Hi! I'm interested in: ${attachedProduct.title}\n${attachedProduct.image}\n\n${contentToSend}`;
        }

        api.post(`/shoppers/chat/${userId}/`, { content: contentToSend })
        .then(res => {
            setMessages([...messages, res.data]);
            setNewMessage("");
            setAttachedProduct(null); // Clear attachment after sending
            
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
                    return <img key={i} src={part} alt="attachment" onLoad={scrollChatToBottom} style={{ maxWidth: '100%', borderRadius: 8, display: 'block', marginTop: 8 }} />;
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
                                const isMine = Number(msg.sender) === Number(currentUserId);
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
                            
                            {/* ChatGPT Style Attachment Preview */}
                            {attachedProduct && (
                                <div className="chat-attachment-preview">
                                    <img src={attachedProduct.image} alt="attached" />
                                    <span>{attachedProduct.title}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setAttachedProduct(null)} 
                                        className="chat-attachment-remove"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                            
                            {/* Input Field */}
                            <div className="chat-composer">
                                <input 
                                    type="text" 
                                    placeholder="Type your message..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" aria-label="Send message">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 2 11 13"></path>
                                        <path d="m22 2-7 20-4-9-9-4Z"></path>
                                    </svg>
                                </button>
                            </div>
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
