import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function VerifyEmail() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      code: ''
    },
    validationSchema: yup.object({
      email: yup.string().trim().email('Enter a valid email').required('Email is required'),
      code: yup.string().trim().length(6, 'Code must be 6 digits').required('Verification code is required')
    }),
    onSubmit: (values) => {
      http.post('/user/verify-email', values)
        .then(() => {
          toast.success('Email verified successfully!');
          setTimeout(() => navigate('/login'), 2000);
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Verification failed');
        });
    }
  });

  return (
    <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ToastContainer />
      <Typography variant="h5" sx={{ my: 2 }}>
        Verify Your Email
      </Typography>
      <Box component="form" sx={{ maxWidth: '500px' }} onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth margin="dense" autoComplete="off"
          label="Email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth margin="dense" autoComplete="off"
          label="Verification Code"
          name="code"
          value={formik.values.code}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
        />
        <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
          Verify Email
        </Button>
      </Box>
    </Box>
  );
}

export default VerifyEmail;
