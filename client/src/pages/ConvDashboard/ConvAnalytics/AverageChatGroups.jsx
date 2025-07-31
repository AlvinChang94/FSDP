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
  const { id } = useParams();
  const [groupData, setGroupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    const fetchGroupData = async () => {
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

        const res = await axios.get(`http://localhost:3001/api/analytics/average-chat-groups/${effectiveId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const rawData = res.data.chatGroupsByDay || {};
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weekMap = Object.fromEntries(weekdays.map(day => [day, 0]));

        Object.entries(rawData).forEach(([date, count]) => {
          const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
          if (weekMap.hasOwnProperty(dayName)) {
            weekMap[dayName] += count;
          }
        });

        const transformed = weekdays.map(day => ({ day, sessions: weekMap[day] }));
        setGroupData(transformed);
      } catch (err) {
        console.error('Failed to fetch group data', err);
        setGroupData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id]);

  const handleChartChange = (_, newType) => {
    if (newType !== null) setChartType(newType);
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f6fa', minHeight: '100vh' }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Chatbot Sessions per Day
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
          Sessions by Weekday
        </Typography>

        {loading ? (
          <Typography variant="body1">Loading chart...</Typography>
        ) : groupData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No chatbot sessions recorded for this week.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'bar' ? (
              <BarChart data={groupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#2e7d32" />
              </BarChart>
            ) : (
              <LineChart data={groupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#2e7d32" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Engagement Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This metric refers to the total number of conversational sessions initiated and managed by the automated chatbot within a given time frame. Each session typically starts when a user sends a message and continues until the conversation naturally ends or transitions to a human agent. It’s a direct indicator of how frequently users are relying on the chatbot for assistance.
          A high number of sessions suggests strong adoption of self-service support, while fluctuations can highlight shifts in user preference, technical issues, or content relevance. If paired with completion or escalation rates, it provides deeper insight into bot effectiveness and user satisfaction

        </Typography>
      </Paper>

    </Box>
  );
}

export default AnalyticsDetail;
