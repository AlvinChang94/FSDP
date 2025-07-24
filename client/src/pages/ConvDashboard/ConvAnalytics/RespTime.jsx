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

  const responseTimeData = [
  { question: "Mon", time: 20.1 },
  { question: "Tue", time: 21.0 },
  { question: "Wed", time: 19.9 },
  { question: "Thu", time: 20.5 },
  { question: "Fri", time: 20.3 },
  { question: "Sat", time: 21.2 },
  { question: "Sun", time: 20.5 },
];

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Response Time Analytics
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Average Response Time (Past Week)
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={responseTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="time" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This chart displays the average response time for each day in the past week. Use it to monitor trends and identify potential delays.
        </Typography>
      </Paper>
    </Box>
  );
}

export default AnalyticsDetail;