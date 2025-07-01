import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../../../../http';
import {
    Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Grid
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditNotif() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notification, setNotification] = useState({
        title: "",
        message: "",
        sendDate: "",
    });
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        http.get(`/notification/${id}`).then((res) => {
            setNotification(res.data);
            setLoading(false);
        });
    }, [id]);

    const formik = useFormik({
        initialValues: notification,
        enableReinitialize: true,
        validationSchema: yup.object({
            title: yup.string().trim().min(3).max(100).required("Title is required"),
            message: yup.string().trim().min(3).max(500).required("Message is required"),
            sendDate: yup.date().required("Send Date is required"),
        }),
        onSubmit: (data) => {
            data.title = data.title.trim();
            data.message = data.message.trim();
            http.put(`/notification/${id}`, data)
                .then((res) => {
                    toast.success("Notification updated!");
                    navigate("/notification");
                })
                .catch(() => toast.error("Failed to update notification."));
        }
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const deleteNotification = () => {
        http.delete(`/notification/${id}`).then(() => {
            toast.success("Notification deleted");
            navigate("/notification");
        });
    };

    return (
        <Box>
            <ToastContainer />
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit Notification
            </Typography>
            {
                !loading && (
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth margin="normal" autoComplete="off"
                                    label="Title"
                                    name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.title && Boolean(formik.errors.title)}
                                    helperText={formik.touched.title && formik.errors.title}
                                />
                                <TextField
                                    fullWidth margin="normal" autoComplete="off"
                                    multiline minRows={3}
                                    label="Message"
                                    name="message"
                                    value={formik.values.message}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.message && Boolean(formik.errors.message)}
                                    helperText={formik.touched.message && formik.errors.message}
                                />
                                <TextField
                                    fullWidth margin="normal" autoComplete="off"
                                    type="datetime-local"
                                    label="Send Date"
                                    name="sendDate"
                                    InputLabelProps={{ shrink: true }}
                                    value={formik.values.sendDate}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.sendDate && Boolean(formik.errors.sendDate)}
                                    helperText={formik.touched.sendDate && formik.errors.sendDate}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                            <Button variant="contained" type="submit" color='secondary'>
                                Update
                            </Button>
                            <Button variant="contained" color="error" onClick={handleOpen}>
                                Delete
                            </Button>
                            <Button onClick={() => navigate(-1)} variant="contained" color='inherit'>
                                cancel
                            </Button>
                        </Box>
                    </Box>
                )
            }
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Delete Notification</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this notification?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="inherit" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={deleteNotification}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default EditNotif;
