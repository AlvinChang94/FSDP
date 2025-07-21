import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../../../../http';
import {
    Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Grid, Tooltip, IconButton
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InfoIcon from '@mui/icons-material/Info';

function EditAlerts() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alert, setAlert] = useState({
        title: "",
        message: "",
        sendDate: "",
        endDate: "",
    });
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        http.get(`/alert/${id}`).then((res) => {
            const data = res.data;

            const localDate = new Date(data.sendDate);
            const offsetDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
            const formattedDate = offsetDate.toISOString().slice(0, 16);

            const localEndDate = new Date(data.endDate);
            const offendDate = new Date(localEndDate.getTime() - localEndDate.getTimezoneOffset() * 60000)
            const formattedendDate = offendDate.toISOString().slice(0, 16);

            setAlert({
                ...data,
                sendDate: formattedDate,
                endDate: formattedendDate,
            });
            setLoading(false);
        });
    }, [id]);

    const formik = useFormik({
        initialValues: alert,
        enableReinitialize: true,
        validationSchema: yup.object({
            title: yup.string().trim().min(3).max(100).required("Title is required"),
            message: yup.string().trim().min(3).max(500).required("Message is required"),
            sendDate: yup.date()
                .min(new Date(Date.now() - 60 * 1000), 'Send Date is in the past')
                .required('Send Date is required'),
            endDate: yup.date()
                .min(yup.ref('sendDate'), 'End Date must be after Send Date')
                .required('End Date is required'),
        }),
        onSubmit: (data) => {
            data.title = data.title.trim();
            data.message = data.message.trim();
            http.put(`/alert/${id}`, data)
                .then((res) => {
                    toast.success("Alert updated!");
                    navigate("/alert");
                })
                .catch(() => toast.error("Failed to update alert."));
        }
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const deleteAlert = () => {
        http.delete(`/alert/${id}`).then(() => {
            toast.success("Alert deleted");
            navigate("/alert");
        });
    };


    //Change to Ai, now i hard coded
    const setMessage = () => {
        formik.setFieldValue('message', 'Maintanence will be from ');
    };

    const setDate = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        const formatted = localDate.toISOString().slice(0, 16);
        formik.setFieldValue('sendDate', formatted);
    }

    const [submitMessage, setSubmitMessage] = useState('');


    const setendDate = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        const formatted = localDate.toISOString().slice(0, 16);
        formik.setFieldValue('endDate', formatted);
    }

    const [submitendMessage, setSubmitendMessage] = useState('');

    return (
        <Box>
            <ToastContainer />
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit Alert
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
                                {formik.values.title.trim() && (
                                    <Tooltip title="View AI message suggestion">
                                        <IconButton onClick={setMessage}>
                                            <InfoIcon color="secondary" />
                                        </IconButton>
                                    </Tooltip>
                                )}
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
                                {formik.values.message.trim() && (
                                    <Box display='flex' alignItems='center'>
                                        <Tooltip title="View AI Send Date suggestion">
                                            <IconButton onClick={() => {
                                                setDate();
                                                setSubmitMessage('Time was chosen because...');
                                            }}>
                                                <InfoIcon color="secondary" />
                                            </IconButton>
                                        </Tooltip>
                                        {submitMessage && (
                                            <Typography color='text.secondary'>
                                                {submitMessage}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    autoComplete="off"
                                    type="datetime-local"
                                    label="Send Date"
                                    name="sendDate"
                                    InputLabelProps={{ shrink: true }}
                                    value={formik.values.sendDate}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.sendDate && Boolean(formik.errors.sendDate)}
                                    helperText={formik.touched.sendDate && formik.errors.sendDate}
                                    inputProps={{
                                        min: new Date(Date.now() - 60 * 1000).toISOString().slice(0, 16)
                                    }}
                                />
                                {formik.values.message.trim() && (
                                    <Box display='flex' alignItems='center'>
                                        <Tooltip title="View AI Send Date suggestion">
                                            <IconButton onClick={() => {
                                                setendDate();
                                                setSubmitendMessage('Time was chosen because...');
                                            }}>
                                                <InfoIcon color="secondary" />
                                            </IconButton>
                                        </Tooltip>
                                        {submitendMessage && (
                                            <Typography color='text.secondary'>
                                                {submitendMessage}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    autoComplete="off"
                                    type="datetime-local"
                                    label="End Date"
                                    name="endDate"
                                    InputLabelProps={{ shrink: true }}
                                    value={formik.values.endDate}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                                    helperText={formik.touched.endDate && formik.errors.endDate}
                                    inputProps={{ min: formik.values.sendDate || new Date().toISOString().slice(0, 16) }}
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
                <DialogTitle>Delete Alert</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this alert?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="inherit" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={deleteAlert}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default EditAlerts;
