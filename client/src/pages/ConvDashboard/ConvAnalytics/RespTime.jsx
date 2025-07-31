import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, IconButton, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

function AnalyticsDetail() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [responseTimes, setResponseTimes] = useState([]);
  const [averageTime, setAverageTime] = useState(null);
  const [chartType, setChartType] = useState('bar');

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

  const handleChartChange = (event, newType) => {
    if (newType !== null) setChartType(newType);
  };

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

      <ToggleButtonGroup
        value={chartType}
        exclusive
        onChange={handleChartChange}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="bar">Bar Chart</ToggleButton>
        <ToggleButton value="line">Line Chart</ToggleButton>
      </ToggleButtonGroup>

      <Paper elevation={3} sx={{ p: 4 }}>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'bar' ? (
            <BarChart data={responseTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" tick={{ fontSize: 10 }} />
              <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value} sec`} />
              <Bar dataKey="time" fill="#1976d2" />
            </BarChart>
          ) : (
            <LineChart data={responseTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" tick={{ fontSize: 10 }} />
              <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value} sec`} />
              <Line type="monotone" dataKey="time" stroke="#1976d2" strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Paper>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This chart illustrates how quickly responses were provided to each user question. High values may suggest delays in processing or responding, while lower times highlight efficient turnaround. Use the toggle to view trends over time or compare individual response durations. This data can help identify bottlenecks or frequent points of confusion in your conversations.
        </Typography>
      </Paper>

    </Box>
  );
}

export default AnalyticsDetail;