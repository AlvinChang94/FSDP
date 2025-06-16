import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Grid, Paper, Link as MuiLink } from '@mui/material';
import { AccountCircle, AccessTime, Search, Clear, Edit } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import global from '../global';
import { Link } from 'react-router-dom';
import UserContext from '../contexts/UserContext';

function Support() {
    return (
        <Box sx={{position: 'fixed', minHeight: '100vh', minWidth: 'calc(100vw - 284px)', bgcolor: '#f5f6fa', top: 0, left: '220px', p: 4}}>
            {/* Top white rectangle */}
            <Paper elevation={3} sx={{ maxWidth: 1100, mx: 'auto', p: 4, mb: 4, bgcolor: 'white' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Support Centre for QueryEase
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {/* Your description here */}
                    Welcome to the support centre. Find answers to common questions or reach out for more help.
                </Typography>
            </Paper>

            {/* FAQ cards */}
            <Grid container spacing={3} maxWidth={1100} sx={{ justifyContent: 'flex-start' }}>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Guide to Using Our Website
                        </Typography>
                        <MuiLink component={Link} to="/faq/guide" target="_blank" underline="hover" sx={{ display: 'block', mb: 0.5 }} color="#1a73e8">
                            Read the full guide
                        </MuiLink>
                        <MuiLink component={Link} to="/faq/guide#specific-section" underline="hover" sx={{ display: 'block' }} color="#1a73e8">
                            Go to Specific Section
                        </MuiLink>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold">
                            How to Link Your Account
                        </Typography>
                        <MuiLink component={Link} to="/faq/link-account" target="_blank" underline="hover" color="#1a73e8" sx={{ display: 'block', mb: 3.5 }}>
                            Learn how to link your account
                        </MuiLink>
                        <MuiLink>
                            
                        </MuiLink>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Troubleshooting Login Issues
                        </Typography>
                        <MuiLink component={Link} to="/faq/login-issues" target="_blank" underline="hover" color="#1a73e8">
                            Troubleshoot login problems
                        </MuiLink>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Need More Support?
                        </Typography>
                        <MuiLink component={Link} to="/contact" target="_blank" underline="hover" color="#1a73e8">
                            Contact us
                        </MuiLink>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Support;   