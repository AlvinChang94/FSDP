import { Typography, Box, Button, Grid, Card, CardContent, Icon, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import http from '../../../http';
import { Star, Delete, Check, Refresh } from '@mui/icons-material'
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
    const [readReviewIds, setReadReviewIds] = useState([]);
    const [showRead, setShowRead] = useState(false);

    useEffect(() => {
        http.get('/reviews')
            .then((res) => {
                setReviewList(res.data)
            })
            .catch((err) => console.error("Failed to fetch review data"))
        http.get('/read-reviews')
            .then((res) => {
                setReadReviewIds(res.data)
            })
            .catch((err) => console.error("Failed to fetch read reviews"))
    }, []);

    const deleteReview = (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        http.delete(`/reviews/${id}`)
            .then(() => setReviewList(prev => prev.filter(r => r.id !== id)))
            .catch(() => toast.error('Failed to delete review'));
    };

    const markReviewAsRead = (id) => {
        http.post(`/read-reviews/${id}/read`)
            .then(() => {
                setReadReviewIds(prev => [...prev, id]);
                toast.success('Marked as read');
            })
            .catch(() => toast.error('Failed to mark review as read'));
    };

    const handleRefreshClick = () => {
        setShowRead(prev => !prev);
    };

    return (
        <Box>
            <ToastContainer />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant='h5' sx={{ my: 2, mr: 1 }}>
                        Owner reviews
                    </Typography>
                    <Tooltip title={showRead ? "Show Unread" : "Show Read"}>
                        <IconButton onClick={handleRefreshClick}>
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Button onClick={() => navigate(-1)} variant="contained" color='inherit'>
                    back
                </Button>
            </Box>
            <Grid container spacing={2}>
                {(showRead
                    ? reviewList.filter(review => readReviewIds.includes(review.id))
                    : reviewList.filter(review => !readReviewIds.includes(review.id))
                ).map((review) => (
                    <Grid item xs={12} md={6} lg={4} key={review.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant='h6' sx={{ flexGrow: 1 }}>
                                        <Box justifyContent='space-between' display='flex'>
                                            {review.comment}
                                            <Box>
                                                <IconButton onClick={() => deleteReview(review.id)}>
                                                    <Delete color='error' />
                                                </IconButton>
                                                {!showRead && (<Tooltip title="Mark as read">
                                                    <IconButton onClick={() => markReviewAsRead(review.id)}>
                                                        <Check />
                                                    </IconButton>
                                                </Tooltip>)}
                                            </Box>
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