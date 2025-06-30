import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Grid, Paper, Link as MuiLink } from '@mui/material';
import { AccountCircle, AccessTime, Search, Clear, Edit } from '@mui/icons-material';
import http from '../../http';
import dayjs from 'dayjs';
import global from '../../global';
import { Link } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';

function ConversationAI() {
    return (
                <Box sx={{ position: 'fixed', minHeight: '100vh', minWidth: 'calc(100vw - 284px)', bgcolor: '#f5f6fa', top: 0, left: '220px', p: 4 }}>
            <Paper elevation={3} sx={{ maxWidth: 1100, mx: 'auto', p: 4, mb: 4, bgcolor: 'white' }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Conversation Analytics Dashboard
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                View your conversation analytics here
                            </Typography>
                        </Paper>
            </Box>
        );
    }
    
    export default ConversationAI;
