import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import http from '../../http';  // your axios/http instance
import { toast, ToastContainer } from 'react-toastify';

function AdminActions() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await http.get('/user/all'); 
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  const toggleMute = async (userId) => {
    try {
      await http.put(`/moderator/users/${userId}/mute`);
      toast.success('User mute status updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update mute status');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await http.delete(`/moderator/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <Box p={3}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom>
        Moderator Actions - Manage Users
      </Typography>

      {loading ? (
        <Typography>Loading users...</Typography>
      ) : users.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {users.map(user => (
            <Grid item xs={12} md={6} lg={4} key={user.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{user.name}</Typography>
                <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Muted: {user.isMuted ? 'Yes' : 'No'}
                </Typography>

                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 1, mr: 1 }}
                  onClick={() => toggleMute(user.id)}
                >
                  {user.isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default AdminActions;
