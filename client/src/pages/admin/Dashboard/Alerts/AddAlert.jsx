import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Tooltip, IconButton } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../../../../http';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InfoIcon from '@mui/icons-material/Info';

function AddAlerts() {
  const navigate = useNavigate();
  const [submitMessage, setSubmitMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      title: "",
      message: "",
      sendDate: "",
    },
    validationSchema: yup.object({
      title: yup.string().trim()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be at most 100 characters')
        .required('Title is required'),
      message: yup.string().trim()
        .min(3, 'Message must be at least 3 characters')
        .max(500, 'Message must be at most 500 characters')
        .required('Message is required'),
      sendDate: yup.date()
        .min(new Date(Date.now() - 60 * 1000), 'Send Date is in the past')
        .required('Send Date is required'),
    }),
    onSubmit: (data) => {
      data.title = data.title.trim();
      data.message = data.message.trim();

      http.post("/alert", data)
        .then((res) => {
          console.log(res.data);
          toast.success("Alert added!");
          navigate("/Alert");
        })
        .catch((err) => {
          toast.error("Failed to add alert.");
          console.error(err);
        });
    }
  });

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

  return (
    <Box>
      <ToastContainer />
      <Typography variant="h5" sx={{ my: 2 }}>
        Add Alerts
      </Typography>
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
                <IconButton onClick={(setMessage)}>
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
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, gap: 2, display: 'flex' }}>
          <Button variant="contained" type="submit" color='secondary'>
            Add Alerts
          </Button>
          <Button onClick={() => navigate(-1)} variant="contained" color='inherit'>
            cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default AddAlerts;
