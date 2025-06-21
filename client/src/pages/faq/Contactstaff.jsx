import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, IconButton, Modal, Button, TextField, InputAdornment, Fade, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ListIcon from '@mui/icons-material/List';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import http from '../../http';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Contactstaff() {
    const messageSchema = yup.string().trim().max(2000, 'Message cannot exceed 2000 characters');
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem('accessToken'));
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/'); // redirect to home page if not logged in
        }
    }, [isLoggedIn, navigate]);
    const bgColor = "#f5f6fa";
    const textBoxColor = "#CFCFCF";
    const placeholderColor = "#888888";
    const [openModal, setOpenModal] = useState(false);
    const [started, setStarted] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [inputFocused, setInputFocused] = useState(false);
    const [ticketId, setTicketId] = useState(null);
    const [pendingMessage, setPendingMessage] = useState('');
    const [historyOpen, setHistoryOpen] = useState(false);
    const [ticketHistory, setTicketHistory] = useState([]);
    const messagesRef = useRef(messages);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const currentTicket = ticketHistory.find(t => t.ticketId === ticketId);
    const ticket = ticketHistory.find(t => t.ticketId === ticketId);
    const isSolved = currentTicket?.ticketStatus === 'solved';
    const [msgMenuAnchor, setMsgMenuAnchor] = useState(null);
    const [msgMenuMessage, setMsgMenuMessage] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editMessage, setEditMessage] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const toastCooldownRef = useRef(0);

    const handleMenuOpen = (event, ticket) => {
        setAnchorEl(event.currentTarget);
        setSelectedTicket(ticket);
    };
    const showToastWithCooldown = (msg) => {
        const now = Date.now();
        if (now - toastCooldownRef.current > 5000) { // 5 seconds
            toast.error(msg);
            toastCooldownRef.current = now;
        }
    };


    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedTicket(null);
    };

    const handleSend = async () => {
        if (!ticketId) return;
        if (message.trim()) {
            try {
                await messageSchema.validate(message);
                const res = await http.post('/api/messages', {
                    senderId: localStorage.getItem('userId'),
                    recipientId: 0,
                    ticketId,
                    content: message
                }).catch(function (err) {
                    toast.error(`${err.response.data.message}`);
                });

                setMessages([...messages, res.data]);
                setMessage('');
                handleTicketClick(ticket.ticketId); //fixes timestamp issue, a little less smooth
            } catch (err) {
                console.log(err);
            }
        }
    };
    const inputBoxClass = started ? "slide-to-bottom" : "centered-input";
    const handleCreateTicket = async () => {
        try {
            const res = await http.post('/api/ticket', { clientId: localStorage.getItem('userId') });
            setTicketId(res.data.ticketId);
            setOpenModal(false);
            setStarted(true);
            setPendingMessage(message);
            setMessage('')
            const historyRes = await http.get(`/api/ticket/user/${localStorage.getItem('userId')}`);
            const sorted = historyRes.data.sort((a, b) => {
                if (a.ticketStatus !== b.ticketStatus) {
                    return a.ticketStatus === 'open' ? -1 : 1;
                }
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });
            setTicketHistory(sorted);
        } catch (err) {
            console.log(err);
        }
    };
    useEffect(() => {
        if (ticketId && pendingMessage) {
            http.post('/api/messages', {
                senderId: localStorage.getItem('userId'),
                recipientId: 0,
                ticketId,
                content: pendingMessage
            }).then(res => {
                setMessages(prev => [...prev, res.data]);
                setPendingMessage('');
            });
        }
    }, [ticketId, pendingMessage]);

    const handleHistoryClick = async () => {
        setHistoryOpen(true);
        const res = await http.get(`/api/ticket/user/${localStorage.getItem('userId')}`);
        // Sort: open first, then closed, each by updatedAt desc
        const sorted = res.data.sort((a, b) => {
            if (a.ticketStatus !== b.ticketStatus) {
                return a.ticketStatus === 'open' ? -1 : 1;
            }
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        setTicketHistory(sorted);
    };

    const handleTicketClick = async (ticketId) => {
        setHistoryOpen(false); // Close the modal
        const res = await http.get(`/api/messages/conversation/${ticketId}`);
        setMessages(res.data); // Set messages for the selected ticket
        setTicketId(ticketId); // Set the current ticket
        setStarted(true);      // Show the chat area if needed
    };

    useEffect(() => {
        if (shouldAutoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        // Reset the flag after scroll
        setShouldAutoScroll(true);
    }, [messages]);

    useEffect(() => {
        const interval = setInterval(() => {
            try {
                if (!ticketId) return;
                http.get(`/api/messages/conversation/${ticketId}`).then(res => {
                    if (messagesRef.current.length == res.data.length) setShouldAutoScroll(false);
                    setMessages(res.data);
                });
            } catch (err) {
                console.error("No TicketId", err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [ticketId]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const handleMarkAsSolved = async () => {
        if (!selectedTicket) return;
        await http.put(`/api/ticket/${selectedTicket.ticketId}`, { ticketStatus: 'solved' });
        handleMenuClose();
        setHistoryOpen(false);
        if (selectedTicket.ticketId == ticketId) {
            setStarted(false);
            setTicketId(null);
            setMessages([]);
        }

    };

    const handleDeleteTicket = async () => {
        if (!selectedTicket) return;
        await http.delete(`/api/ticket/${selectedTicket.ticketId}`);
        handleMenuClose();
        setHistoryOpen(false);
        if (selectedTicket.ticketId == ticketId) {
            setStarted(false);
            setTicketId(null);
            setMessages([]);
        }
    };
    const formatTimestamp = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour24: true
        });
    };

    const handleMsgMenuOpen = (event, message) => {
        setMsgMenuAnchor(event.currentTarget);
        setMsgMenuMessage(message);
    };

    const handleMsgMenuClose = () => {
        setMsgMenuAnchor(null);
        setMsgMenuMessage(null);
    };
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
            <ToastContainer />
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 2.5, pt: 1.5, pr: 2.5, ml: 27 }}>
                <Typography variant="h5" sx={{ color: '282424', fontWeight: 'bold' }}>
                    Contact a moderator
                    {ticket ? `: Ticket #${ticket.ticketId}` : ''}
                </Typography>
                <IconButton onClick={handleHistoryClick}>
                    <HistoryIcon fontSize="large" />
                </IconButton>
                <Modal open={historyOpen} onClose={() => setHistoryOpen(false)}>
                    <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, maxWidth: 500, mx: 'auto', mt: '10vh', maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
                        <IconButton
                            sx={{ position: 'absolute', top: 10, right: 10 }}
                            onClick={() => {
                                setHistoryOpen(false);
                                setStarted(false); // This will show the "What do you need to ask today" screen
                                setTicketId(null); // (optional) reset ticket selection
                                setMessages([]);   // (optional) clear messages
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                        <Typography variant="h6">Your Ticket History</Typography>
                        <List>
                            {ticketHistory.length === 0 ? (
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body2"
                                                sx={{ color: '#888', textAlign: 'center', width: '100%' }}
                                            >
                                                No tickets
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ) : (
                                ticketHistory.map(ticket => (
                                    <ListItem
                                        key={ticket.ticketId}
                                        disablePadding
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleMenuOpen(e, ticket);
                                                }}
                                            >
                                                <ListIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemButton
                                            onClick={() => handleTicketClick(ticket.ticketId)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: '#f0f0f0',
                                                }
                                            }}
                                        >

                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            color: ticket.ticketStatus === 'solved' ? 'green' : 'inherit'
                                                        }}
                                                    >
                                                        Ticket #{ticket.ticketId} ({ticket.ticketStatus})
                                                    </Typography>
                                                }
                                                secondary={`Last updated: ${new Date(ticket.updatedAt).toLocaleString()}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                )))}
                        </List>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => setConfirmAction('solve')} disabled={selectedTicket?.ticketStatus !== 'open'}>Mark as Solved</MenuItem>
                            <MenuItem onClick={() => setConfirmAction('delete')} sx={{ color: 'red' }} disabled={selectedTicket?.ticketStatus !== 'solved'}>Delete</MenuItem>
                        </Menu>
                    </Box>
                </Modal>
            </Box>

            <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)}>
                <Box sx={{
                    bgcolor: 'white', p: 4, borderRadius: 2, maxWidth: 350, mx: 'auto', mt: '20vh', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                        {confirmAction === 'solve'
                            ? 'Are you sure you want to mark this ticket as solved? You can delete it after this action.'
                            : 'Are you sure you want to delete this ticket?'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={async () => {
                                if (confirmAction === 'solve') {
                                    await handleMarkAsSolved();
                                } else if (confirmAction === 'delete') {
                                    await handleDeleteTicket();
                                }
                                setConfirmAction(null);
                            }}
                        >
                            Yes
                        </Button>
                        <Button variant="outlined" onClick={() => setConfirmAction(null)}>
                            No
                        </Button>
                    </Box>
                </Box>
            </Modal>

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
                                handleCreateTicket();
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
                {isSolved ? (
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#888',
                            textAlign: 'center',
                            width: '100%',
                            py: 2,
                        }}
                    >
                        This case has been marked as complete. You cannot edit it anymore.
                    </Typography>
                ) : (<TextField
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
                        maxLength: 2000,
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
                    autoComplete="off"
                />
                )}
            </Box>

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
                    <Box sx={{ width: '100%' }}
                    >
                        {messages.map((msg, idx, arr) => {
                            const isAdmin = msg.senderId <= 0;
                            const userId = Number(localStorage.getItem('userId'));
                            const showName = isAdmin && (idx === 0 || arr[idx - 1].senderId === userId);
                            const isLastInBlock = (() => {
                                if (idx === arr.length - 1) return true;
                                const nextMsg = arr[idx + 1];
                                return (
                                    msg.senderId !== nextMsg.senderId ||
                                    formatTimestamp(msg.timestamp) !== formatTimestamp(nextMsg.timestamp)
                                );
                            })();

                            return (
                                <Box
                                    key={msg.message_uuid || idx}
                                    sx={{
                                        position: 'relative',
                                        marginLeft: '260px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isAdmin ? 'flex-start' : 'flex-end',
                                        mb: 1,
                                        '&:hover .msg-menu-btn': { opacity: 1 }
                                    }}
                                >
                                    {showName && (
                                        <Typography variant="caption" sx={{ color: '#888', mb: 0.5 }}>
                                            {"Admin"}
                                        </Typography>
                                    )}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            bgcolor: isAdmin ? '#e0e0e0' : '#fff',
                                            color: '#222',
                                            px: 2,
                                            py: 1,
                                            maxWidth: '40%',
                                            ...(!isAdmin && { paddingRight: '30px' }),

                                            borderRadius: isAdmin
                                                ? '16px 16px 16px 1px'
                                                : '16px 16px 1px 16px',
                                            boxShadow: 1,
                                            wordBreak: 'break-word',
                                            alignSelf: isAdmin ? 'flex-start' : 'flex-end',
                                            ...(msg.isEdited && { paddingBottom: '15px' })
                                        }}
                                    >
                                        {msg.isDeleted
                                            ? <span style={{ fontStyle: 'italic', color: '#888' }}>This message has been deleted</span>
                                            : (
                                                <>
                                                    {msg.content}
                                                    {msg.isEdited && (
                                                        <span
                                                            style={{
                                                                position: 'absolute',
                                                                bottom: 4,
                                                                right: isAdmin ? 'auto' : 8,
                                                                left: isAdmin ? 8 : 'auto',
                                                                fontSize: '0.6rem',
                                                                color: '#888',
                                                                fontStyle: 'italic',
                                                                opacity: 0.85,
                                                                pointerEvents: 'none'
                                                            }}
                                                        >
                                                            (edited)
                                                        </span>
                                                    )}
                                                </>
                                            )
                                        }
                                    </Box>
                                    {Number(msg.senderId) === userId && !msg.isDeleted && (
                                        <IconButton
                                            className="msg-menu-btn"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                right: isAdmin ? 'auto' : 0,
                                                left: isAdmin ? 0 : 'auto',
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                                zIndex: 1
                                            }}
                                            onClick={e => handleMsgMenuOpen(e, msg)}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    )}

                                    {isLastInBlock && (
                                        <Typography
                                            variant="caption"
                                            sx={{ color: '#aaa', mt: 0.5, fontSize: '0.75rem', textAlign: 'right' }}
                                        >
                                            {formatTimestamp(msg.timestamp)}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
                        <Menu
                            anchorEl={msgMenuAnchor}
                            open={Boolean(msgMenuAnchor)}
                            onClose={handleMsgMenuClose}
                        >
                            <MenuItem disabled={ticket?.ticketStatus === 'solved'} onClick={() => {
                                setEditContent(msgMenuMessage.content);
                                setEditMessage(msgMenuMessage);
                                setEditModalOpen(true);

                                handleMsgMenuClose();
                            }}>Edit</MenuItem>
                            <MenuItem disabled={ticket?.ticketStatus === 'solved'} onClick={async () => {

                                setDeleteMessage(msgMenuMessage);
                                setDeleteConfirmOpen(true);
                                handleMsgMenuClose();

                            }
                            }>Delete</MenuItem>
                        </Menu>
                        <div ref={messagesEndRef} />
                    </Box>
                </Box>

            )}
            <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <Box sx={{
                    bgcolor: 'white',
                    p: 3,
                    borderRadius: 2,
                    maxWidth: 350,
                    mx: 'auto',
                    mt: '20vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                        Are you sure you want to delete this message?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={async () => {
                                await http.put(`/api/messages/del/${deleteMessage.message_uuid}`);
                                setDeleteConfirmOpen(false);
                                setShouldAutoScroll(false);
                                setMessages(prevMessages =>
                                    prevMessages.map(m =>
                                        m.message_uuid === deleteMessage.message_uuid
                                            ? { ...m, isDeleted: true }
                                            : m
                                    )
                                );
                            }}
                        >
                            Delete
                        </Button>
                        <Button variant="outlined" onClick={() => setDeleteConfirmOpen(false)}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'white',
                    p: 3,
                    borderRadius: 2,
                    maxWidth: 400,
                    width: '90%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxHeight: '80vh',
                    overflow: 'auto'
                }}>
                    <TextField
                        label="Edit Message"
                        value={editContent}
                        onChange={e => {
                            if (e.target.value.length > 2000) {
                                showToastWithCooldown('Message cannot exceed 2000 characters');
                                return;
                            }
                            setEditContent(e.target.value)
                        }}
                        fullWidth
                        multiline
                        minRows={2}
                        placeholder={editMessage?.content.trim() || ''}
                    />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={async () => {
                                try {
                                    await messageSchema.validate(editContent);
                                    await http.put(`/api/messages/${editMessage.message_uuid}`, { content: editContent });
                                    const messageUuid = editMessage.message_uuid;
                                    setEditModalOpen(false);
                                    setShouldAutoScroll(false);
                                    const res = await http.get(`/api/messages/conversation/${ticketId}`);
                                    setMessages(res.data);
                                    setMessages(prevMessages =>
                                        prevMessages.map(m =>
                                            m.message_uuid === editMessage.message_uuid
                                                ? { ...m, isEdited: true }
                                                : m))
                                }
                                catch (err) {
                                    showToastWithCooldown(err.response?.data?.error || 'An error occurred');
                                    return;
                                }

                            }}
                            disabled={editContent.trim() === ''}
                        >
                            Save
                        </Button>
                        <Button variant="outlined" onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>


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