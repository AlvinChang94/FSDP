import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField } from '@mui/material';
import axios from 'axios';

const hardcodedData = {
  average_response_time: '20.5 seconds',
  payment_schedule_response_time: '22.3 seconds',
  escalation_count: 30,
  escalation_delay: '10.2 seconds',
  faq: [
    'How can I update my billing information?',
    'What is the status of my recent order?',
    'How do I reset my password?',
    'What are your working hours?',
    'How can I speak to a human agent?'
  ],
};

function ConversationAI() {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Get token from localStorage
  const token = localStorage.getItem('accessToken');

  // Auto-generate summary on mount
  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const res = await axios.post(
          'http://localhost:3001/api/testchat/summary',
          { data: hardcodedData },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSummary(res.data.summary || 'No summary available.');
      } catch (err) {
        console.error(err);
        setSummary('Failed to generate summary.');
      }
      setLoadingSummary(false);
    };
    fetchSummary();
  }, [token]);

  // Ask follow-up question
  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoadingAnswer(true);
    try {
      const res = await axios.post(
        'http://localhost:3001/api/testchat/summary',
        {
          question,
          data: hardcodedData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChatResponse(res.data.answer || 'No answer returned.');
    } catch (err) {
      console.error(err);
      setChatResponse('Failed to get response.');
    }
    setLoadingAnswer(false);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" mb={3}>Conversation Analytics</Typography>

      {loadingSummary ? (
        <Typography>Loading summary...</Typography>
      ) : (

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography
            sx={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: summary }}
          />
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
        <Paper sx={{ p: 3, mt: 3 }}>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Your question:</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{question}</Typography>
          <Typography variant="subtitle1" fontWeight="bold" mt={2} gutterBottom>AI answer:</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{chatResponse}</Typography>
        </Paper>
      )}
    </Box>
  );
}

export default ConversationAI;