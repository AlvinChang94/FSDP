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
            try {
                let currentChatId = chatId;
                if (!chatId) {
                    const res = await http.post(`/api/testchat/`, { clientId: localStorage.getItem('userId') });
                    currentChatId = res.data.chat_id;
                    setChatId(currentChatId)
                    await fetchChats();

                }
                await http.post(`/api/testchat/message`, { sender_id: localStorage.getItem('userId'), chat_id: currentChatId, content: message });
                setMessages(prev => [...prev, { content: message }]);
                setMessage('');

            } catch (err) {
                console.error('Failed to send message:', err);
            }
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
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

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
                            top: messages.length > 0 ? 'calc(100vh - 50px)' : '53%',
                            width: '100%',
                            maxWidth: '76vw',
                            transition: 'all 0.6s cubic-bezier(.68,-0.55,.27,1.55)',
                        }}
                    >
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={message}
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
                                if (e.key === 'Enter') handleSend();
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
                                        <IconButton onClick={handleSend} edge="end" sx={{ color: '#7ec4fa' }}>
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
                                bottom: 90,
                                width: '100vw',
                                maxHeight: '78vh',
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
                                            position: 'relative',
                                            marginLeft: '260px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            mb: 1
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                bgcolor: '#232325',
                                                color: '#fff',
                                                px: 2,
                                                py: 1,
                                                maxWidth: '40%',
                                                paddingRight: '30px',
                                                borderRadius: '16px 16px 1px 16px',
                                                boxShadow: 1,
                                                wordBreak: 'break-word',
                                                alignSelf: 'flex-end'
                                            }}
                                        >
                                            {msg.content}
                                        </Box>
                                    </Box>
                                ))}
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