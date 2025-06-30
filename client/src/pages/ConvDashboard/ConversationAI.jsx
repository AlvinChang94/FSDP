import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

function ConversationAI() {
    return (
        <Box sx={{
            position: 'fixed',
            minHeight: '100vh',
            minWidth: 'calc(100vw - 284px)',
            bgcolor: '#f5f6fa',
            top: 0,
            left: '220px',
            p: 4
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon fontSize="large" />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1 }}>
                    Conversation Analytics
                </Typography>
            </Box>

            <Paper elevation={3} sx={{
                p: 4,
                maxWidth: 900,
                mx: 'auto',
                borderRadius: '16px',
                backgroundColor: '#e0e0e0'
            }}>
                <Typography variant="body1" sx={{ fontSize: '18px', mb: 2 }}>
                    This week, the average response time across all queries was <strong>20.5 seconds</strong>. However, queries related to
                    <strong> 'payment schedules'</strong> showed a notably higher average of <strong>22.3 seconds</strong> —
                    <Box component="span" sx={{ color: 'red', fontWeight: 'bold' }}> 8.8% slower </Box>
                    than the general response time.
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '18px' }}>
                    A total of <strong>30 conversations</strong> were escalated to human agents. While the volume remains within normal range,
                    the average escalation response delay increased to <strong>10.2 seconds</strong>. This suggests a potential strain on
                    agent availability during peak periods, possibly affecting resolution speed and customer satisfaction.
                </Typography>
            </Paper>
        </Box>
    );
}

export default ConversationAI;
