import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Button, TextField
} from '@mui/material';
import axios from 'axios';
import UserContext from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';


function ConversationAI() {
  const { user } = useContext(UserContext);
  const userId = user?.id;
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [commonTopics, setCommonTopics] = useState([]);
  const [chatAvg, setChatAvg] = useState(null);
  const [groupAvg, setGroupAvg] = useState(null);
  const realAverageResponseTime = localStorage.getItem('realAverageResponseTime');

  const handleBack = () => {
    navigate('/ConversationDb');
  };

  useEffect(() => {
    if (!userId) return;

    const fetchCommonTopics = async () => {
      try {
        const res = await axios.post('http://localhost:3001/api/testchat/analytics/summarise-topic',


          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCommonTopics(res.data.topics || []);
      } catch (err) {
        console.error('Failed to fetch common topics', err);
        setCommonTopics([]);
      }
    };

    const fetchChatAverage = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/analytics/average-chats/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChatAvg(res.data.average_chats_per_day);
      } catch (err) {
        console.error('Failed to fetch average chats', err);
        setChatAvg(null);
      }
    };

    const fetchGroupAverage = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/analytics/average-chat-users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGroupAvg(res.data.average_group_count);
      } catch (err) {
        console.error('Failed to fetch unique users', err);
        setGroupAvg(null);
      }
    };

    fetchCommonTopics();
    fetchChatAverage();
    fetchGroupAverage();
  }, [token, userId]);

  const faqList = commonTopics.length > 0
    ? commonTopics.map(t => t.topic)
    : [];

  const faqString = faqList.join('; ');

  useEffect(() => {
  if (!userId || chatAvg === null || groupAvg === null || commonTopics.length === 0) return;

  const fetchSummary = async () => {
    setLoadingSummary(true);

    const faqList = commonTopics
      .filter(t => t.topic?.trim())
      .map(t => t.topic.trim());

    const payload = {
      average_response_time: realAverageResponseTime || '20 seconds',
      payment_schedule_response_time: '2 seconds',
      average_group_count: groupAvg ?? 0,
      average_chats_per_day: chatAvg ?? 0,
      faq: faqList
    };

    try {
      const res = await axios.post(
        'http://localhost:3001/api/testchat/summary',
        { data: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummary(res.data.summary || 'No summary available.');
    } catch (err) {
      console.error('Summary error:', err);
      setSummary('Failed to generate summary.');
    }

    setLoadingSummary(false);
  };

  fetchSummary();
}, [token, userId, chatAvg, groupAvg, commonTopics]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoadingAnswer(true);

    const payload = {
      average_response_time: realAverageResponseTime || '20 seconds',
      payment_schedule_response_time: '2 seconds',
      escalation_delay: '10.2 seconds',
      average_chats_per_day: chatAvg ?? 0,
      faq: faqList
    };

    try {
      const res = await axios.post(
        'http://localhost:3001/api/testchat/summary',
        { question, data: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatResponse(res.data.answer || 'No answer returned.');
    } catch (err) {
      console.error('Answer error:', err);
      setChatResponse('Failed to get response.');
    }

    setLoadingAnswer(false);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" mb={3}>Conversation Analytics</Typography>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      {loadingSummary ? (
        <Typography>Loading summary...</Typography>
      ) : (
        <Paper sx={{
          p: 3,
          mb: 4,
          backgroundColor: '#D3D3D3',
          color: '#000000',
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
        }}>
          <ReactMarkdown>{summary}</ReactMarkdown>

        </Paper>
      )}

      <Typography variant="h6" gutterBottom>Ask more about the data:</Typography>
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={4}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about the data..."
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleAsk} disabled={loadingAnswer || !question.trim()}>
        {loadingAnswer ? 'Waiting for answer...' : 'Ask'}
      </Button>

      {chatResponse && (
        <Paper sx={{
          p: 3,
          mt: 3,
          backgroundColor: '#D3D3D3',
          color: '#000000',
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
        }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Your question:
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {question}
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            AI answer:
          </Typography>
          <ReactMarkdown>{chatResponse}</ReactMarkdown>

        </Paper>
      )}
    </Box>
  );
}

export default ConversationAI;