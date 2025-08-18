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

function AnalyticsDetail({ title }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [chatData, setChatData] = useState([]);
  const [averageChats, setAverageChats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');


  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const localUserRaw = localStorage.getItem('user');
        const localUserId = localUserRaw ? JSON.parse(localUserRaw).id : null;
        const effectiveId = id || localUserId;

        if (!effectiveId) {
          console.warn('Client ID not available — skipping request.');
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:3001/api/analytics/average-chats/${effectiveId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const rawData = res.data.chatCountsByDay || {};
        const average = res.data.average_chats_per_day;
        setAverageChats(typeof average === 'number' ? average : null);

        // Aggregate by weekday
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weekMap = Object.fromEntries(weekdays.map(day => [day, 0]));

        Object.entries(rawData).forEach(([date, count]) => {
          const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
          if (weekMap.hasOwnProperty(dayName)) {
            weekMap[dayName] += count;
          }
        });

        const transformed = weekdays.map(day => ({
          day,
          chats: weekMap[day]
        }));

        setChatData(transformed);
      } catch (err) {
        console.error('Failed to fetch chat data', err);
        setChatData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [id]);

  const handleChartChange = (event, newType) => {
    if (newType !== null) setChartType(newType);
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Weekly Chat Analytics
      </Typography>

      <ToggleButtonGroup
        value={chartType}
        exclusive
        onChange={handleChartChange}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="bar">Bar Chart</ToggleButton>
        <ToggleButton value="line">Line Chart</ToggleButton>
      </ToggleButtonGroup>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Activity: Monday to Sunday
        </Typography>

        {loading ? (
          <Typography variant="body1">Loading chart...</Typography>
        ) : chatData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No activity recorded this week.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'bar' ? (
              <BarChart data={chatData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Chats', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="chats" fill="#1976d2" />
              </BarChart>
            ) : (
              <LineChart data={chatData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Chats', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="chats" stroke="#1976d2" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          This metric represents the total number of chats initiated by all users within a single day. It reflects the overall volume of conversations handled by the platform and serves as a key indicator of system-wide engagement.
        </Typography>
        {averageChats !== null && (
          <Typography variant="body1" fontWeight="bold">
            Average chats per day: {parseFloat(averageChats).toFixed(2)}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default AnalyticsDetail;
