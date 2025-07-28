import { Typography, Box, Button, Grid, Card, CardContent, Icon, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import http from '../../../http';
import { Star, Delete } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


dayjs.extend(utc);
dayjs.extend(timezone);

function OwnerRev() {
    const navigate = useNavigate();
    const [reviewList, setReviewList] = useState([]);

    useEffect(() => {
        http.get('/reviews')
            .then((res) => {
                setReviewList(res.data)
            })
            .catch((err) => console.error("Failed to fetch review data"))
    }, []);

    const deleteReview = (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        http.delete(`/reviews/${id}`)
            .then(() => setReviewList(prev => prev.filter(r => r.id !== id)))
            .catch(() => toast.error('Failed to delete review'));
    };

    return (
        <Box>
            <ToastContainer />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='h5' sx={{ my: 2 }}>
                    Owner reviews
                </Typography>
                <Button onClick={() => navigate(-1)} variant="contained" color='inherit'>
                    back
                </Button>
            </Box>
            <Grid container spacing={2}>
                {reviewList.map((review) => (
                    <Grid item xs={12} md={6} lg={4} key={review.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant='h6' sx={{ flexGrow: 1 }}>
                                        <Box justifyContent='space-between' display='flex'>
                                            {review.comment}
                                            <IconButton onClick={() => deleteReview(review.id)}>
                                                <Delete color='error' />
                                            </IconButton>
                                        </Box>
                                        <Box>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Icon key={star}>
                                                    <Star color={(review.rating) >= star ? 'warning' : 'disabled'} />
                                                </Icon>
                                            ))}
                                        </Box>
                                        <Box variant='body2'>
                                            <Typography color='text.secondary'>
                                                Sent on: {dayjs(review.createdAt).tz('Asia/Singapore').format('ddd, MMM D YYYY, h:mm A')}
                                            </Typography>
                                        </Box>
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
export default OwnerRev;