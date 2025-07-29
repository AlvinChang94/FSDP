import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

function AnalyticsDetail() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [responseTimes, setResponseTimes] = useState([]);
  const [averageTime, setAverageTime] = useState(null);

  useEffect(() => {
    const fetchResponseTimes = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`http://localhost:3001/api/analytics/message-timings/${clientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const timings = res.data.timings || [];

        if (timings.length > 0) {
          const avg = timings.reduce((acc, curr) => acc + curr.time, 0) / timings.length;
          setAverageTime(avg.toFixed(2));
        } else {
          setAverageTime(null);
        }

        setResponseTimes(timings);
      } catch (err) {
        console.error(err);
        setResponseTimes([]);
        setAverageTime(null);
      }
    };

    if (clientId) {
      fetchResponseTimes();
    }
  }, [clientId]);

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Response Time Analytics
      </Typography>

      <Typography variant="h6" gutterBottom>
        Average Response Time: {averageTime !== null ? `${averageTime} seconds` : 'Loading...'}
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={responseTimes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" tick={{ fontSize: 12 }} />
            <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value} sec`} />
            <Bar dataKey="time" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}

export default AnalyticsDetail;