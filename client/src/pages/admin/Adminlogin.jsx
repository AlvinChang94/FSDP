import React, { useContext } from 'react'
import UserContext from '../../contexts/UserContext';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
function AdminLogin() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const formik = useFormik({
        initialValues: {
            name: "Joe",
            email: "joe@gmail.com",
            password: "Admin1234",
            confirmPassword: "Admin1234"
        },
        validationSchema: yup.object({
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
                .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
                    "Password at least 1 letter and 1 number"),
        }),
        onSubmit: (data) => {
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();
            http.post("/user/login", data)
                .then((res) => {
                    const user = res.data.user;
                    if (user.role !== 'admin') {
                        toast.error("Only admins can log in here.");
                        return;
                    }
                    localStorage.setItem("accessToken", res.data.accessToken);
                    localStorage.setItem("userId", user.id);
                    setUser(user);
                    navigate("/admin-dashboard");
                    window.location.reload();
                })
                .catch(function (err) {
                    toast.error(`${err.response.data.message}`);
                });
        }
    });
    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <ToastContainer />
            <Typography variant="h5" sx={{ my: 2 }}>
                Login
            </Typography>
            <Box component="form" sx={{ maxWidth: '500px' }}
                onSubmit={formik.handleSubmit}>
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
                    label="Password"
                    name="password" type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                />
                <Button fullWidth variant="contained" sx={{ mt: 2 }}
                    type="submit">
                    Login
                </Button>
            </Box>
        </Box>
    )
}
export default AdminLogin
