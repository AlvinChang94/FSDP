import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper, List, Divider, ListItem, ListItemText, IconButton, InputAdornment, Menu, MenuItem, Modal } from '@mui/material';
import http from '../../http'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import * as yup from 'yup';
import ListIcon from '@mui/icons-material/List';

import { useNavigate } from 'react-router-dom';
function AdminSupport() {
    const messageSchema = yup.string().trim().max(2000, 'Message cannot exceed 2000 characters');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
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
    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            http.get('/user/auth').then((res) => {
                setUser(res.data.user);
            });
        } else {
            setUser(null);
        }
    }, []);
    useEffect(() => {
        // Only redirect after user is loaded
        if (user && user.role !== 'admin') {
            navigate('/'); // not admin, redirect
        }
        if (user === null && !localStorage.getItem("accessToken")) {
            navigate('/'); // not logged in, redirect
        }
    }, [user, navigate]);

    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const isSolved = selectedTicket?.ticketStatus === 'solved';
    const [inputFocused, setInputFocused] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editMessage, setEditMessage] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [msgMenuAnchor, setMsgMenuAnchor] = useState(null);
    const [msgMenuMessage, setMsgMenuMessage] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const messagesRef = useRef(messages);
    const messagesEndRef = useRef(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTicket2, setSelectedTicket2] = useState(null);
    const prevTicketsRef = useRef([]);

    const handleMsgMenuOpen = (event, message) => {
        setMsgMenuAnchor(event.currentTarget);
        setMsgMenuMessage(message);
    };
    const handleMsgMenuClose = () => {
        setMsgMenuAnchor(null);
        setMsgMenuMessage(null);
    };

    const handleMenuOpen = (event, ticket) => {
        setAnchorEl(event.currentTarget);
        setSelectedTicket2(ticket);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedTicket2(null);

    };

    const handleDeleteTicket = async () => {
        if (!selectedTicket2) return;
        await http.delete(`/api/ticket/admin/${selectedTicket.ticketId}`);
        handleMenuClose();
        setSelectedTicket(null);
        setMessages([]);
        if (user && user.role === 'admin') {
            http.get('/api/ticket/adminget').then(res => {
                setTickets(res.data);
            }).catch(err => {
                console.log(err)
            });
        }
    };
    const handleMarkAsSolved = async () => {
        if (!selectedTicket2) return;
        await http.put(`/api/ticket/admin/${selectedTicket.ticketId}`, { ticketStatus: 'solved' });
        handleMenuClose();
        setSelectedTicket(null);
        setMessages([]);
        if (user && user.role === 'admin') {
            http.get('/api/ticket/adminget').then(res => {
                setTickets(res.data);
            }).catch(err => {
                console.log(err)
            });
        }

    };

    useEffect(() => {
        if (shouldAutoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        // Reset the flag after scroll
        setShouldAutoScroll(true);
    }, [messages]);


    const handleSend = () => {
        if (!newMessage.trim() || !selectedTicket) return;
        http.post('/api/messages', {
            content: newMessage,
            senderId: user.id,
            recipientId: selectedTicket.clientId,
            ticketId: selectedTicket.ticketId
        }).then(res => {
            setMessages(prev => [...prev, { ...res.data, senderRole: user.role, senderName: user.Name }]);
            setNewMessage("");
        });
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            http.get('/api/ticket/adminget').then(res => {
                setTickets(res.data);
            }).catch(err => {
                console.log(err)
            });
        }
    }, [user]);

    useEffect(() => {
        if (selectedTicket && user && user.role === 'admin') {
            http.get(`/api/messages/admin/conversation/${selectedTicket.ticketId}`)
                .then(res => setMessages(res.data))
                .catch(err => setMessages([]));
        } else {
            setMessages([]);
        }
    }, [selectedTicket, user]);

    useEffect(() => {
        const interval = setInterval(() => {
            try {
                http.get(`/api/ticket/adminget`).then(res => {
                        setTickets(res.data);
                    });
                if (!selectedTicket) return;
                http.get(`/api/messages/admin/conversation/${selectedTicket.ticketId}`).then(res => {
                    if (messagesRef.current.length == res.data.length) setShouldAutoScroll(false);
                    setMessages(res.data);
                });
            } catch (err) {
                console.error(err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [selectedTicket]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        if (shouldAutoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        setShouldAutoScroll(true);
    }, [messages])

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 220,
            width: '100vw',
            height: '100vh',
            overflow: 'auto',
            display: 'flex'
        }}>
            <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5', }}>
                {/* Left bar: Tickets */}
                <Paper elevation={2} sx={{ width: 300, minWidth: 200, bgcolor: '#e3e3e3', p: 0, overflow: 'auto' }}>
                    <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #ccc' }}>
                        Tickets
                    </Typography>
                    <List>
                        {tickets.map(ticket => (
                            <ListItem
                                button
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                selected={selectedTicket?.ticketId === ticket.ticketId}
                            >
                                <ListItemText primary={`Ticket #${ticket.ticketId} (${ticket.ticketStatus})`}
                                    secondary={`Client ${ticket.client.name}`} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
                {/* Right side: Conversation */}
                <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'white', width: '62vw' }}>
                    <Typography variant="h6">
                        {selectedTicket ? `Conversation for ticket ${selectedTicket.ticketId}` : 'Select a ticket'}
                    </Typography>
                    {selectedTicket && (
                        <IconButton
                            onClick={e => {
                                e.stopPropagation();
                                handleMenuOpen(e, selectedTicket);
                            }}
                            sx={{ ml: 1, width: 40, ml: 105, mt: -4.5, mb: 0.5 }}
                        >
                            <ListIcon />
                        </IconButton>
                    )}

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => setConfirmAction('solve')} disabled={selectedTicket?.ticketStatus !== 'open'}>Mark as Solved</MenuItem>
                        <MenuItem onClick={() => setConfirmAction('delete')} sx={{ color: 'red' }} disabled={selectedTicket?.ticketStatus !== 'solved'}>Delete</MenuItem>
                    </Menu>
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
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {selectedTicket ? (
                            messages.map((msg, idx, arr) => {
                                const isAdmin = msg.senderRole === 'admin';
                                const userId = Number(localStorage.getItem('userId'));
                                const showName = !isAdmin && (idx === 0 || arr[idx - 1].senderId === userId);
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
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: !isAdmin ? 'flex-start' : 'flex-end',
                                            mr: !isAdmin ? 0 : 2,
                                            mb: 1,
                                            '&:hover .msg-menu-btn': { opacity: 1 }
                                        }}
                                    >
                                        {showName && (
                                            <Typography variant="caption" sx={{ color: '#888', mb: 0.5 }}>
                                                {`Client ${msg.senderName}`}
                                            </Typography>
                                        )}
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                bgcolor: !isAdmin ? '#e0e0e0' : '#fff',
                                                color: '#222',
                                                px: 2,
                                                py: 1,
                                                maxWidth: '40%',
                                                ...(isAdmin && { paddingRight: '30px' }),

                                                borderRadius: !isAdmin
                                                    ? '16px 16px 16px 1px'
                                                    : '16px 16px 1px 16px',
                                                boxShadow: 1,
                                                wordBreak: 'break-word',
                                                alignSelf: !isAdmin ? 'flex-start' : 'flex-end',
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
                                                                    right: !isAdmin ? 'auto' : 8,
                                                                    left: !isAdmin ? 8 : 'auto',
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
                                                    right: !isAdmin ? 'auto' : 0,
                                                    left: !isAdmin ? 0 : 'auto',
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
                                        <div ref={messagesEndRef} />
                                    </Box>

                                );
                            })

                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No ticket selected.
                            </Typography>
                        )}
                    </Box>
                    <Menu
                        anchorEl={msgMenuAnchor}
                        open={Boolean(msgMenuAnchor)}
                        onClose={handleMsgMenuClose}
                    >
                        <MenuItem disabled={selectedTicket?.ticketStatus === 'solved'} onClick={() => {
                            setEditContent(msgMenuMessage.content);
                            setEditMessage(msgMenuMessage);
                            setEditModalOpen(true);

                            handleMsgMenuClose();
                        }}>Edit</MenuItem>
                        <MenuItem disabled={selectedTicket?.ticketStatus === 'solved'} onClick={async () => {

                            setDeleteMessage(msgMenuMessage);
                            setDeleteConfirmOpen(true);
                            handleMsgMenuClose();

                        }
                        }>Delete</MenuItem>
                    </Menu>
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
                                            setEditModalOpen(false);
                                            setShouldAutoScroll(false);
                                            const res = await http.get(`/api/messages/admin/conversation/${selectedTicket.ticketId}`);
                                            setMessages(res.data);
                                            setMessages(prevMessages =>
                                                prevMessages.map(m =>
                                                    m.message_uuid === editMessage.message_uuid
                                                        ? { ...m, isEdited: true }
                                                        : m))
                                        }
                                        catch (err) {
                                            console.log(err);
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

                    <Box
                        sx={{
                            mb: -5,
                            mt: 3,
                            ml: 53,
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            maxWidth: '58vw',
                            transition: 'all 0.6s cubic-bezier(.68,-0.55,.27,1.55)',
                        }}
                    >
                        {selectedTicket && isSolved ? (
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
                        ) : selectedTicket ? (<TextField
                            fullWidth
                            variant="outlined"
                            value={newMessage}
                            onChange={e => {
                                if (e.target.value.length > 2000) {
                                    return;
                                }
                                setNewMessage(e.target.value);
                            }}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => setInputFocused(false)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleSend()
                                }
                            }}
                            placeholder={inputFocused || newMessage ? '' : "Provide a response..."}
                            InputProps={{
                                maxLength: 2000,
                                sx: {
                                    bgcolor: '#CFCFCF',
                                    borderRadius: 2,
                                    '& input::placeholder': { color: "#888888", opacity: 1 }
                                },

                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => {
                                            handleSend();
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
                        ) : null}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
export default AdminSupport