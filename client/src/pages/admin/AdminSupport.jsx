import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper, List, Divider, ListItem, ListItemText } from '@mui/material';
import http from '../../http'

import { useNavigate } from 'react-router-dom';
function AdminSupport() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
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


    const handleSend = () => {
        if (!newMessage.trim() || !selectedTicket) return;
        http.post('/api/messages', {
            content: newMessage,
            senderId: user.id,
            recipientId: selectedTicket.clientId,
            ticketId: selectedTicket.ticketId
        }).then(res => {
            setMessages(prev => [...prev, res.data]);
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
            <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5', overflow: 'auto' }}>
                {/* Left bar: Tickets */}
                <Paper elevation={2} sx={{ width: 300, minWidth: 200, bgcolor: '#e3e3e3', p: 0 }}>
                    <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #ccc' }}>
                        Tickets
                    </Typography>
                    <List>
                        {tickets.map(ticket => (
                            <ListItem
                                button
                                key={ticket.id}
                                selected={selectedTicket && selectedTicket.id === ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                <ListItemText primary={`Ticket #${ticket.ticketId}`}
                                    secondary={`Client ${ticket.client.name}`} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
                {/* Right side: Conversation */}
                <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'white', width: '61vw' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        {selectedTicket ? `Conversation for ticket ${selectedTicket.ticketId}` : 'Select a ticket'}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {selectedTicket ? (
                            messages.map((msg, idx) => (
                                <Box key={idx} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color={msg.senderRole === 'admin' ? 'primary' : 'text.secondary'}>
                                        {msg.senderRole === 'admin' ? `Admin ${msg.senderName}`: `Client ${msg.senderName}`}
                                    </Typography>
                                    <Typography variant="body1">{msg.content}</Typography>
                                </Box>

                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No ticket selected.
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', mt: 2, mb: -1 }}>
                        { selectedTicket ? (
                        <>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                            />
                            <Button variant="contained" sx={{ ml: 1 }} onClick={handleSend}>Send</Button>
                        </>
                        ) : <Typography></Typography>}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
export default AdminSupport