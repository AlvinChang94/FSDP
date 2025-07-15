import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, InputAdornment, Fade, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditNoteIcon from '@mui/icons-material/EditNote';
import http from '../http';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//Later: Add 'chat title' to schema
function Preview() {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem('accessToken'));
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/'); // redirect to home page if not logged in
        }
    }, [isLoggedIn, navigate]);
    const [message, setMessage] = useState('');
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputFocused, setInputFocused] = useState(false);
    const messagesEndRef = useRef(null);
    const [userChats, setUserChats] = useState([]);
    const toastCooldownRef = useRef(0);
    const [loading, setLoading] = useState(false);
    const showToastWithCooldown = (msg) => {
        const now = Date.now();
        if (now - toastCooldownRef.current > 5000) { // 5 seconds
            toast.error(msg);
            toastCooldownRef.current = now;
        }
    };

    // Group chats by date for section headers
    const groupedChats = userChats.reduce((acc, chat) => {
        const dateKey = new Date(chat.updatedAt || chat.createdAt).toLocaleDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(chat);
        return acc;
    }, {});

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (message.trim()) {
            setLoading(true);
            try {
                let currentChatId = chatId;
                if (!chatId) {
                    const res = await http.post(`/api/testchat/`, { clientId: localStorage.getItem('userId') });
                    currentChatId = res.data.chat_id;
                    setChatId(currentChatId)
                    await fetchChats();
                }
                setMessages(prev => [...prev, { content: message, sender: 'user' }]);
                const updatedMessages = [...messages, { content: message, sender: 'user' }];
                setMessage('');

                const bedrockMessages = updatedMessages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: [msg.content]
                }));
                const res = await http.post('/api/testchat/botmessage', {
                    messages: bedrockMessages,
                    sender_id: localStorage.getItem('userId'),
                    chat_id: currentChatId,
                    content: message,
                    sender: 'user'
                });
                setMessages(prev => [...prev, { content: res.data.llmReply, sender: 'assistant' }]);

            } catch (err) {
                console.error('Failed to send message:', err);
            }
            setLoading(false);
        }
    };
    const fetchChats = async () => {
        try {
            const res = await http.get(`/api/testchat/user/${localStorage.getItem('userId')}`);
            // Save chats to state (create a new state: userChats)
            setUserChats(res.data);

        } catch (err) {
            console.error('Failed to fetch chats:', err);
        }
    };
    useEffect(() => {
        fetchChats();
    }, []);
    const fetchMessages = async (chatId) => {
        try {
            const res = await http.get(`/api/testchat/message/${chatId}`);
            setMessages(res.data);
            setMessage('');
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };
    function formatBotMessage(text) {
        if (!text) return '';
        // Bold: **text**
        let html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        // Paragraphs: split on double newlines
        // Line breaks: single newline to <br>
        html = html.replace(/<pre>/g, '').replace(/<\/pre>/g, '');
        html = html.replace(/\n/g, '<br>');
        html = html.replace(/###/g, '•');

        return html;
    }
    function AnimatedDots() {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 30,
                    px: 1.5,
                    borderRadius: 2,
                    background: '#7ec4fa'
                }}
            >
                {[0, 1, 2].map(i => (
                    <Box
                        key={i}
                        sx={{
                            width: 6,
                            height: 7,
                            borderRadius: '50%',
                            background: '#cdcdcdff',
                            mx: 0.5,
                            opacity: 0.5,
                            animation: `dotFade 1.2s infinite`,
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
                <style>
                    {`
          @keyframes dotFade {
            0%, 80%, 100% { opacity: 0.5; }
            40% { opacity: 1; }
          }
        `}
                </style>
            </Box>
        );
    }

    const inputBoxClass = messages.length > 0 ? "slide-to-bottom" : "centered-input";

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: "#181617",
            m: 0,
            p: 0,
            overflow: 'hidden',
            display: 'flex'
        }}>
            {/* Left Nav Bar */}
            <Box sx={{
                marginLeft: '220px',
                width: 260,
                height: '100vh',
                bgcolor: '#232122',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #222',
                zIndex: 3
            }}>
                <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ToastContainer />
                    <EditNoteIcon sx={{ fontSize: 32, color: '#fff' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
                        Test chats
                    </Typography>
                </Box>
                <Box sx={{ px: 2, pb: 1 }}>
                    <button
                        style={{
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            color: '#7ec4fa',
                            fontWeight: 600,
                            fontSize: 16,
                            textAlign: 'left',
                            padding: '8px 0 8px 8px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#232b33'}
                        onMouseOut={e => e.currentTarget.style.background = 'none'}
                        onClick={() => {
                            setChatId(null);
                            setMessages([]);
                            setMessage('');
                        }}
                    >
                        + New chat
                    </button>
                </Box>
                <Divider sx={{ bgcolor: '#333' }} />
                <Box sx={{ flex: 1, overflowY: 'auto', pt: 1 }}>
                    <Box sx={{ flex: 1, overflowY: 'auto', pt: 1 }}>
                        {userChats.length === 0 ? (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#aaa',
                                    textAlign: 'center',
                                    mt: 0,
                                    fontStyle: 'italic'
                                }}
                            >
                                No test cases
                            </Typography>
                        ) : (
                            Object.entries(groupedChats).map(([section, chats]) => (
                                <Box key={section}>
                                    <Typography variant="caption" sx={{ color: '#aaa', pl: 2, pb: 0.5, display: 'block', fontSize: 13 }}>
                                        {section}
                                    </Typography>
                                    <List dense disablePadding>
                                        {chats.map(chat => (
                                            <ListItem key={chat.chat_id} disablePadding>
                                                <ListItemButton
                                                    onClick={() => {
                                                        setChatId(chat.chat_id);
                                                        fetchMessages(chat.chat_id);
                                                    }}
                                                    sx={{
                                                        borderRadius: 2,
                                                        mx: 1,
                                                        my: 0.5,
                                                        color: '#fff',
                                                        '&:hover': {
                                                            bgcolor: '#232b33',
                                                            color: '#7ec4fa'
                                                        },
                                                        transition: 'background 0.2s, color 0.2s'
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={`Chat ${chat.chat_id}`}
                                                        primaryTypographyProps={{
                                                            fontSize: 15,
                                                            fontWeight: 500,
                                                            sx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>
            </Box>
            <Box sx={{ width: '58vw' }}>
                {/* Main Chat Area */}
                <Box sx={{ flex: 1, position: 'relative', height: '100vh' }}>
                    <Fade in={messages.length === 0} timeout={500}>
                        <Typography
                            variant="h4"
                            sx={{
                                position: 'absolute',
                                top: '45%',
                                left: '57.6%',
                                transform: 'translate(-50%, -50%)',
                                color: '#fff',
                                fontWeight: 'bold',
                                pointerEvents: 'none'
                            }}
                        >
                            What can I help with?
                        </Typography>
                    </Fade>

                    {/* Animated Input Box */}
                    <Box
                        className={inputBoxClass}
                        sx={{
                            position: 'absolute',
                            left: '57.75%',
                            transform: 'translate(-50%, -50%)',
                            top: messages.length > 0 ? 'calc(100vh - 67px)' : '53%',
                            width: '100%',
                            maxWidth: '76vw',
                            transition: 'all 0.6s cubic-bezier(.68,-0.55,.27,1.55)',
                            marginTop: '15px',
                        }}
                    >
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={message}
                            multiline
                            minRows={1}
                            maxRows={3}
                            onChange={e => {
                                if (e.target.value.length > 2000) {
                                    showToastWithCooldown('Message cannot exceed 2000 characters');
                                    return;
                                }
                                setMessage(e.target.value);
                            }}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); if (!loading) handleSend();}
                            }}
                            placeholder={inputFocused || message ? '' : "Test a prompt"}
                            InputProps={{
                                maxLength: 2000,
                                sx: {
                                    bgcolor: "#232325",
                                    borderRadius: 2,
                                    color: '#fff',
                                    '& input': { color: '#fff' },
                                    '& input::placeholder': { color: "#888888", opacity: 1 }
                                },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleSend} edge="end" sx={{ color: loading ? '#b0b0b0' : '#7ec4fa', cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
                                            <SendIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            autoComplete="off"
                        />
                    </Box>

                    {/* Messages vertical display */}
                    {messages.length > 0 && (
                        <Box
                            sx={{
                                position: 'fixed',
                                right: 0,
                                bottom: 105,
                                width: '100vw',
                                maxHeight: '85vh',
                                display: 'flex',
                                flexDirection: 'column',
                                overflowY: 'auto',
                                zIndex: 2,
                                pr: 2.5
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                {messages.map((msg, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                            mt: 1.5,
                                            mb: 1,
                                            ml: msg.sender == 'assistant' ? 65 : 0, // assistant on left, user on right
                                            mr: msg.sender == 'user' ? 0 : 'auto',

                                        }}
                                    >
                                        <Box
                                            sx={{
                                                bgcolor: msg.sender === 'user' ? '#232325' : '#7ec4fa',
                                                color: msg.sender === 'user' ? '#fff' : '#181617',
                                                px: 2,
                                                py: 1.5,
                                                maxWidth: msg.sender === 'user' ? '30%': '50%',
                                                borderRadius: msg.sender === 'user'
                                                    ? '16px 16px 1px 16px'
                                                    : '16px 16px 16px 1px',
                                                boxShadow: 1,
                                                wordBreak: 'break-word',
                                                whiteSpace: 'pre-line',
                                                fontWeight: 400,
                                                minWidth: '2    0px',
                                                overflowX: 'hidden'
                                            }}
                                            // Render markdown/bold/paragraphs
                                            dangerouslySetInnerHTML={{ __html: formatBotMessage(msg.content) }}
                                        />
                                    </Box>
                                ))}
                                {loading && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            mt: 5,
                                            mb: 1,
                                            ml: 65,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                bgcolor: '#7ec4fa',
                                                color: '#181617',
                                                px: 2,
                                                py: 0,
                                                maxWidth: '50%',
                                                borderRadius: '16px 16px 16px 1px',
                                                boxShadow: 1,
                                                fontWeight: 500,
                                                fontSize: 18,
                                                minHeight: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <AnimatedDots />
                                        </Box>
                                    </Box>
                                )}
                                <div ref={messagesEndRef} />
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Animation styles */}
                <style>
                    {`
                .centered-input {
                    /* No extra styles needed, handled by sx */
                }
                .slide-to-bottom {
                    /* No extra styles needed, handled by sx */
                }
                .fade-in {
                    opacity: 1;
                    transition: opacity 0.5s;
                }
                .fade-out {
                    opacity: 0;
                    transition: opacity 0.5s;
                }
                `}
                </style>
            </Box>
        </Box>
    );
}

export default Preview;