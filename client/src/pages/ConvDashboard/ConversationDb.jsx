import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Grid, Paper, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import UserContext from '../../contexts/UserContext';
import axios from 'axios';

function ConversationDb() {
    const { user } = useContext(UserContext);
    const [averageTime, setAverageTime] = useState(null);
    const [commonTopics, setCommonTopics] = useState([]);

    useEffect(() => {
        const fetchCommonTopics = async () => {
            if (user?.id) {
                try {
                    const token = localStorage.getItem('accessToken');
                    const res = await axios.get(`http://localhost:3001/api/analytics/common-topics/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setCommonTopics(res.data.topics || []);
                } catch (err) {
                    setCommonTopics([]);
                }
            }
        };
        fetchCommonTopics();
    }, [user]);
    useEffect(() => {
        const fetchAverageTime = async () => {
            if (user?.id) {
                try {
                    const token = localStorage.getItem('accessToken');
                    const res = await axios.get(`http://localhost:3001/api/analytics/response-time/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setAverageTime(res.data.averageResponseTime);
                    localStorage.setItem('realAverageResponseTime', res.data.averageResponseTime);
                } catch (err) {
                    setAverageTime(null);
                }
            }
        };
        fetchAverageTime();
    }, [user]);

    return (
        <Box sx={{ minHeight: '100vh', overflowY: 'auto'}}>
            <Paper elevation={3} sx={{ maxWidth: 1100, mx: 'auto', p: 4, mb: 4, bgcolor: 'white' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Conversation Analytics Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View your conversation analytics here
                </Typography>
            </Paper>

            <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 1100, mx: 'auto', mb: 4 }}>
                {[
                    {
                        title: "Average response time for each question",
                        value: averageTime !== null ? `${averageTime.toFixed(2)} seconds` : "Loading...",
                        to: `/conv-analytics/response-time/${user?.id}`
                    },
                    { title: "Number of escalations", value: "30", to: "/conv-analytics/escalation-no" },
                    { title: "Escalation response delay", value: "10.2s", to: "/conv-analytics/escalation-delay" },
                ].map((stat, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Link to={stat.to} style={{ textDecoration: 'none' }}>
                            <Paper
                                sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    height: '150px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    boxShadow: 3
                                }}
                            >
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {stat.title}
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {stat.value}
                                </Typography>
                            </Paper>
                        </Link>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Frequently asked questions
                </Typography>
                <Paper sx={{ p: 4, mb: 2 }}>
                    {commonTopics.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={commonTopics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="topic" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#1976d2" name="Number of Questions" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Loading common topics...
                        </Typography>
                    )}
                </Paper>

                <Box textAlign="right">
                    <MuiLink component={Link} to="/ConversationAI" underline="hover" sx={{ color: '#1a73e8', fontWeight: 'bold' }}>
                        View AI Analytics Summary
                    </MuiLink>
                </Box>
            </Box>
        </Box>
    );
}

export default ConversationDb;