import { Typography, Box, Paper, IconButton, TextField, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useState, useEffect } from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from '../http';


function Review() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [myReviews, setMyReviews] = useState([]);

    const token = localStorage.getItem('token');

    const formik = useFormik({
        initialValues: {
            comment: "",
        },
        validationSchema: yup.object({
            comment: yup.string().trim()
                .min(3, 'Comment must be at least 3 characters')
                .max(100, 'Comment must be at most 100 characters')
                .required('Comment is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            if (rating === 0) {
                toast.error("Please select a rating before submitting")
                return
            }

            const reviewData = {
                rating,
                comment: values.comment.trim(),
            };

            http.post('/reviews', reviewData)
                .then(() => {
                    toast.success('Review submitted successfully!');
                    resetForm();
                    setRating(0);
                    fetchMyReviews();
                })
                .catch(() => {
                    toast.error("Failed to submit review")

                })
        }
    });

    const fetchMyReviews = () => {
        http.get('/reviews/mine', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setMyReviews(res.data))
            .catch(() => toast.error('Failed to fetch your reviews'));
    };

    useEffect(() => {
        fetchMyReviews();
    }, []);

    return (
        <Box component='form' onSubmit={formik.handleSubmit}>
            <Paper elevation={3} sx={{ maxWidth: 1100, mx: 'auto', p: 4, mb: 4, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Submit Review
                    </Typography>
                </Box>
            </Paper>
            <Box sx={{ display: 'flex', mb: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}>
                        <StarIcon color={(hover || rating) >= star ? 'warning' : 'disabled'} />
                    </IconButton>
                ))}
            </Box>
            <Typography gutterBottom>
                Comment
            </Typography>
            <TextField
                fullWidth margin="normal" autoComplete="off"
                multiline minRows={3}
                name="comment"
                value={formik.values.comment}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.comment && Boolean(formik.errors.comment)}
                helperText={formik.touched.comment && formik.errors.comment}
            />
            <Box sx={{ mt: 2 }}>
                <Button color='secondary' variant='contained' type='submit'>
                    Submit
                </Button>
            </Box>
            <Paper elevation={3} sx={{ maxWidth: 1100, mx: 'auto', p: 4, mt: 4, bgcolor: 'white' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Your Reviews
                </Typography>
                {myReviews.length === 0 ? (
                    <Typography>No reviews yet.</Typography>
                ) : (
                    myReviews.map(review => (
                        <Box key={review.id} sx={{ mb: 2, borderBottom: '1px solid #ccc', pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        color={i < review.rating ? 'warning' : 'disabled'}
                                        fontSize="small"
                                    />
                                ))}
                            </Box>
                            <Typography variant="body1">{review.comment}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                    ))
                )}
            </Paper>
            <ToastContainer />
        </Box>
    );
}
export default Review;