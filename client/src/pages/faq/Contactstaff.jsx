import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, IconButton, Modal, Button, TextField, InputAdornment, Fade } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SendIcon from '@mui/icons-material/Send';
function Contactstaff() {
    const bgColor = "#f5f6fa";
    const textBoxColor = "#CFCFCF";
    const placeholderColor = "#888888";
    const [openModal, setOpenModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [started, setStarted] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [inputFocused, setInputFocused] = useState(false);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, showChat]);

    const handleSend = () => {
        if (message.trim()) {
            setMessages([...messages, message]);
            setMessage('');
            setStarted(true);
        }
    };
    const inputBoxClass = started ? "slide-to-bottom" : "centered-input";
    const subtitleClass = started ? "fade-out" : "fade-in";
    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: bgColor,
            m: 0,
            p: 0,
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 2.5, pt: 1.5, pr: 2.5, ml: 27 }}>
                <Typography variant="h5" sx={{ color: '282424', fontWeight: 'bold' }}>
                Contact a moderator
                </Typography>
                <IconButton>
                    <HistoryIcon fontSize="large" />
                </IconButton>
            </Box>

            {/* Modal for ticket creation */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box sx={{
                    bgcolor: 'white', p: 4, borderRadius: 2, boxShadow: 24,
                    maxWidth: 350, mx: 'auto', mt: '20vh', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>Are you sure you want to create a ticket with a moderator?</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                handleSend();
                                setOpenModal(false);
                            }}
                        >
                            Yes
                        </Button>
                        <Button variant="outlined" onClick={() => setOpenModal(false)}>
                            No
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <Fade in={!started} timeout={500}>
                <Typography
                    variant="h6"
                    sx={{
                        position: 'absolute',
                        top: '45%',
                        left: '57.6%',
                        transform: 'translate(-50%, -50%)',
                        color: '#222',
                        fontWeight: 'bold',
                        pointerEvents: 'none'
                    }}
                >
                    What do you need to ask today?
                </Typography>
            </Fade>

            {/* Animated Input Box */}
            <Box
                className={inputBoxClass}
                sx={{
                    position: 'absolute',
                    left: '57.75%',
                    transform: 'translate(-50%, -50%)',
                    top: started ? 'calc(100vh - 50px)' : '53%',
                    width: '100%',
                    maxWidth: '76vw',
                    transition: 'all 0.6s cubic-bezier(.68,-0.55,.27,1.55)',
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            if (!started) {
                                setOpenModal(true); // show modal on first Enter
                            } else {
                                handleSend(); // send message after started
                            }
                        }
                    }}
                    placeholder={inputFocused || message ? '' : "Ask anything"}
                    InputProps={{
                        sx: {
                            bgcolor: textBoxColor,
                            borderRadius: 2,
                            '& input::placeholder': { color: placeholderColor, opacity: 1 }
                        },
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => {
                                    if (started) {
                                        handleSend();
                                    } else {
                                        setOpenModal(true);
                                    }
                                }}
                                    edge="end"
                                    sx={{ color: '#222' }}>
                                    <SendIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            {/* Messages at bottom right */}
            {started && (
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
                        {messages.slice().map((msg, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    bgcolor: '#fff',
                                    color: '#222',
                                    px: 2,
                                    py: 1,
                                    mb: 1,
                                    maxWidth: '80%',
                                    borderRadius: '16px 16px 1px 16px',
                                    boxShadow: 1,
                                    wordBreak: 'break-word',
                                    alignSelf: 'flex-end',
                                }}
                            >
                                {msg}
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </Box>
                </Box>
            )}

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
            {/* Chat dialog */}
        </Box>

    );
}

export default Contactstaff;   