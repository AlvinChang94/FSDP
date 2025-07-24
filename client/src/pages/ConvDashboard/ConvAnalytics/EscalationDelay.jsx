import React from 'react';
import {
  Box, Paper, Typography, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

function AnalyticsDetail() {
  const navigate = useNavigate();

  const escalationDelayData = [
    { day: "Mon", delay: 9.8 },
    { day: "Tue", delay: 10.5 },
    { day: "Wed", delay: 9.7 },
    { day: "Thu", delay: 10.9 },
    { day: "Fri", delay: 10.3 },
    { day: "Sat", delay: 10.1 },
    { day: "Sun", delay: 10.4 },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Escalation Response Delay Analytics
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Escalation Response Delay (Past Week)
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={escalationDelayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="delay" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The chart shows the average escalation response delay in seconds for each day over the past week. The average delay across the week is approximately 10.2 seconds, indicating relatively prompt escalation handling.
        </Typography>
      </Paper>
    </Box>
  );
}

export default AnalyticsDetail;