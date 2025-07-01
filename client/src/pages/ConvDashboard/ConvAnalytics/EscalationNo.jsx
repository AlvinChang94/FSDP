import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function AnalyticsDetail({ title }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
      <ArrowBackIcon fontSize="large" />
    </IconButton>
      
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Escalation Number Analytics
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          [Graph Placeholder]
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          [Insight summary or AI-generated text goes here...]
        </Typography>
      </Paper>
    </Box>
  );
}

export default AnalyticsDetail;
