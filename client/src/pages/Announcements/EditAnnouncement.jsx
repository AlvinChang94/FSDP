import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../../http';
import {
    Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Grid, FormControlLabel, Checkbox
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditAnnouncement() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState({
        title: "",
        content: "",
        AudienceisModerator: false,
        AudienceisUser: false,
        sendNow: false,
        scheduledDate: null,
    });
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        http.get(`/announcements/${id}`).then((res) => {
            setAnnouncement(res.data);
            setLoading(false);
        });
    }, [id]);

    const formik = useFormik({
        initialValues: announcement,
        enableReinitialize: true,
        validationSchema: yup.object({
            title: yup.string()
                .trim()
                .min(3, "Title must be at least 3 characters.")
                .max(100, "Title cannot exceed 100 characters.")
                .required("Title is required."),

            content: yup.string()
                .trim()
                .min(3, "Content must be at least 3 characters.")
                .max(2000, "Content cannot exceed 2000 characters.")
                .required("Content is required."),

            AudienceisModerator: yup.boolean(),
            AudienceisUser: yup.boolean(),
            sendNow: yup.boolean(),
            scheduledDate: yup.date().nullable()
        }),
        onSubmit: (data) => {
            data.title = data.title.trim();
            data.content = data.content.trim();
            data.scheduledDate = data.scheduledDate || null;
            data.statusForUser = "Unread";
            data.statusForAdmin = "Unread";


            if (!data.AudienceisModerator && !data.AudienceisUser) {
                toast.error("Please select at least one audience.");
                return;
            }

            if (!data.sendNow) {
                if (!data.scheduledDate || data.scheduledDate === "") {
                    toast.error("Scheduled date is required.");
                    return;
                }

                const scheduled = new Date(data.scheduledDate);
                const now = new Date();
                if (scheduled <= now) {
                    toast.error("Scheduled date must be in the future.");
                    return;
                }
            }

            http.put(`/announcements/${id}`, data)
                .then((res) => {
                    console.log(res.data);
                    toast.success("Announcement updated!");
                    navigate("/Announcements");
                })
                .catch((err) => {
                    toast.error("Failed to update announcement.");
                    console.error(err);
                });
        }
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const deleteAnnouncement = () => {
        http.delete(`/announcements/${id}`).then(() => {
            toast.success("Announcement deleted");
            navigate("/Announcements");
        });
    };

    return (
        <Box>
            <ToastContainer />
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit Announcement
            </Typography>
            {
                !loading && (
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                {/* Title */}
                                <TextField
                                    fullWidth margin="normal" autoComplete="off"
                                    label="Announcement Title"
                                    name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.title && Boolean(formik.errors.title)}
                                    helperText={formik.touched.title && formik.errors.title}
                                />

                                {/* Content */}
                                <TextField
                                    fullWidth margin="normal" autoComplete="off"
                                    multiline minRows={3}
                                    label="Announcement Content"
                                    name="content"
                                    value={formik.values.content}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.content && Boolean(formik.errors.content)}
                                    helperText={formik.touched.content && formik.errors.content}
                                />

                                {/* Audience Selection */}
                                <Typography variant="body1">Select Audience</Typography>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="AudienceisModerator"
                                            checked={formik.values.AudienceisModerator}
                                            onChange={() => formik.setFieldValue('AudienceisModerator', !formik.values.AudienceisModerator)}
                                            onBlur={formik.handleBlur}
                                        />
                                    }
                                    label="Moderator"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="AudienceisUser"
                                            checked={formik.values.AudienceisUser}
                                            onChange={() => formik.setFieldValue('AudienceisUser', !formik.values.AudienceisUser)}
                                            onBlur={formik.handleBlur}
                                        />
                                    }
                                    label="User"
                                />
                                {formik.errors['at-least-one-audience'] && (
                                    <Typography variant="body2" color="error">
                                        {formik.errors['at-least-one-audience']}
                                    </Typography>
                                )}

                                {/* Send Now Checkbox */}
                                <Typography variant="body1">Send Announcement Now?</Typography>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="sendNow"
                                            checked={formik.values.sendNow}
                                            onChange={() => formik.setFieldValue('sendNow', !formik.values.sendNow)}
                                            onBlur={formik.handleBlur}
                                        />
                                    }
                                    label="Send Now"
                                />
                                {/* Scheduled Date Field (Visible only if Send Now is false) */}
                                {!formik.values.sendNow && (
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        autoComplete="off"
                                        type="datetime-local"
                                        label="Scheduled Send Date"
                                        name="scheduledDate"
                                        value={formik.values.scheduledDate}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            formik.setFieldValue('scheduledDate', value === "" ? null : value);
                                        }}
                                        onBlur={formik.handleBlur}
                                        InputLabelProps={{ shrink: true }}
                                        error={formik.touched.scheduledDate && Boolean(formik.errors.scheduledDate)}
                                        helperText={formik.touched.scheduledDate && formik.errors.scheduledDate}
                                    />)}
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                            <Button variant="contained" type="submit" color='secondary'>
                                Update
                            </Button>
                            <Button variant="contained" color="error" onClick={handleOpen}>
                                Delete
                            </Button>
                            <Button onClick={() => navigate('/Announcements')} variant="contained" color='inherit'>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                )
            }
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Delete Announcement</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this announcement?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="inherit" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={deleteAnnouncement}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default EditAnnouncement;
