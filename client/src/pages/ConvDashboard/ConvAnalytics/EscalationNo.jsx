import React from 'react';
import {
  Box, Paper, Typography, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

function AnalyticsDetail({ title }) {
  const navigate = useNavigate();

  const escalationData = [
    { day: "Mon", escalations: 4 },
    { day: "Tue", escalations: 5 },
    { day: "Wed", escalations: 3 },
    { day: "Thu", escalations: 4 },
    { day: "Fri", escalations: 6 },
    { day: "Sat", escalations: 4 },
    { day: "Sun", escalations: 4 },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Escalation Number Analytics
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Escalation Number (Past Week)
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={escalationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis label={{ value: 'Escalations', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="escalations" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This chart displays the number of escalation in the past week. Use it to monitor trends and identify potential delays.
        </Typography>
      </Paper>
    </Box>
  );
}

export default AnalyticsDetail;