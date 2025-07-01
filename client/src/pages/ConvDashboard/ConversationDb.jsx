import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Grid, Paper, Link as MuiLink } from '@mui/material';
import { AccountCircle, AccessTime, Search, Clear, Edit } from '@mui/icons-material';
import http from '../../http';
import dayjs from 'dayjs';
import global from '../../global';
import { Link } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';

function ConversationDb() {
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

            <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 1100, mx: 'auto', mb: 4 }}>
                {[
                    { title: "Average response time for each question", value: "20.5s", to: "/conv-analytics/response-time" },
                    { title: "Number of escalations", value: "30" },
                    { title: "Escalation response delay", value: "10.2s" },
                ].map((stat, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Link to={stat.to} style={{ textDecoration: 'none' }}>
                        <Paper
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '150px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                boxShadow: 3
                            }}
                        >
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                {stat.title}
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                                {stat.value}
                            </Typography>
                        </Paper>
                        </Link>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Frequently asked questions
                </Typography>
                <Paper sx={{ p: 4, mb: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                        [Chart Placeholder]
                    </Typography>
                </Paper>


                <Box textAlign="right">
                    <MuiLink component={Link} to="/ConversationAI" underline="hover" sx={{ color: '#1a73e8', fontWeight: 'bold' }}>
                        View AI Analytics Summary
                    </MuiLink>
                </Box>
            </Box>
        </Box>
    );
}

export default ConversationDb;
 
