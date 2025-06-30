import React, { useEffect, useState } from 'react';
import http from '../../http';
import {
  Box, Typography, Grid, Paper, Button, Dialog,
  DialogTitle, DialogContent, DialogContentText,
  DialogActions
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminActions() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await http.get('/user/all');
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMute = async (id) => {
    try {
      await http.put(`/user/mute/${id}`);
      toast.info(`User's bot has been muted`);
      fetchUsers(); 
    } catch (err) {
      toast.error("Failed to mute user's bot.");
    }
  };

  const handleUnmute = async (id) => {
    try {
      await http.put(`/user/unmute/${id}`);
      toast.success(`User's bot has been unmuted`);
      fetchUsers(); 
    } catch (err) {
      toast.error("Failed to unmute user's bot.");
    }
  };
  const handleDelete = async () => {
    try {
      await http.delete(`/user/${selectedUser.id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user.");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const confirmDelete = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const cancelDelete = () => {
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  return (
    <Box>
      <ToastContainer />
      <Typography variant="h5" sx={{ my: 2 }}>
        Moderator Actions
      </Typography>
      <Grid container spacing={2}>
        {users.map(user => (
          <Grid item xs={12} md={6} key={user.id}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1"><strong>Name:</strong> {user.name}</Typography>
              <Typography variant="subtitle2"><strong>Email:</strong> {user.email}</Typography>
              <Typography variant="subtitle2"><strong>Role:</strong> {user.role}</Typography>
              <Typography variant="subtitle2"><strong>Status:</strong> {user.muted ? "Muted 🔇" : "Active 🔊"}</Typography>
              <Box sx={{ mt: 1 }}>
                <Button variant="contained" size="small" color="warning" onClick={() => handleMute(user.id)} sx={{ mr: 1 }}>
                  Mute
                </Button>
                <Button variant="contained" size="small" color="success" onClick={() => handleUnmute(user.id)} sx={{ mr: 1 }}>
                  Unmute
                </Button>
                <Button variant="contained" size="small" color="error" onClick={() => confirmDelete(user)}>
                  Delete
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDeleteDialog} onClose={cancelDelete}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} variant="contained" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminActions;
