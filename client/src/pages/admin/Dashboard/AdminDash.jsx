import { Box, Typography, Grid, Paper, Button, Link as MuiLink, Icon, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import RatingBarChart from './RatingBarChart';
import StarIcon from '@mui/icons-material/Star';
import React from 'react';
import http from '../../../http';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function AdminDash() {
    const [allReviews, setAllReviews] = React.useState([]);
    const [chosenReview, setChosenReview] = React.useState(null);
    const [isChoosingReview, setIsChoosingReview] = React.useState(false);

    React.useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await http.get("/reviews");
                setAllReviews(res.data);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            }
        }

        const savedReview = localStorage.getItem("chosenReview");
        if (savedReview) {
            setChosenReview(JSON.parse(savedReview));
        }

        fetchReviews();
    }, []);

    const handleChooseReview = async () => {
        if (allReviews.length === 0) return;

        setIsChoosingReview(true);
        try {
            const response = await http.post("/choose-review", {
                reviews: allReviews,
                instruction: "Find the most important or critical review and return it."
            });

            if (response.data && response.data.review) {
                setChosenReview(response.data.review);
                localStorage.setItem("chosenReview", JSON.stringify(response.data.review));
                toast.success("AI-selected review updated.");
            } else {
                toast.error("Unexpected response from server");
                console.error("Unexpected response", response.data);
            }
        } catch (error) {
            toast.error("Failed to generate suggestions.");
            console.error(error);
        } finally {
            setIsChoosingReview(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', overflowY: 'auto' }}>
            <ToastContainer />
            <Paper elevation={3} sx={{ maxWidth: 1100, mx: 'auto', p: 4, mb: 4, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Admin Dashboard
                    </Typography>
                    <Link to='/Alert' style={{ textDecoration: 'none' }}>
                        <Button variant='contained' color='secondary'>
                            View Alerts
                        </Button>
                    </Link>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Welcome to the admin dashboard
                </Typography>
            </Paper>
            <Box display="flex" justifyContent="center">
                <Paper sx={{ p: 3, width: '100%', maxWidth: 500, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                        User satisfaction metrics
                    </Typography>
                </Paper>
            </Box>
            <Link to='/AdminDash/Satisfaction' style={{ textDecoration: 'none' }}>
                <Box display="flex" justifyContent="center" my={2}>
                    <Paper sx={{ p: 5, width: '100%', maxWidth: 700, textAlign: 'center', border: '2px dashed #ccc', bgcolor: '#fafafa', height: 250 }}>
                        <RatingBarChart />
                    </Paper>
                </Box>
            </Link>
            <Link to='/AdminDash/OwnerRev' style={{ textDecoration: 'none' }}>
                <Box display="flex" justifyContent="center">
                    <Paper sx={{ p: 3, width: '100%', maxWidth: 500, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                            Business owners' review
                        </Typography>
                    </Paper>
                </Box>
            </Link>
            {chosenReview ? (
                <Box>
                    <Link to='/AdminDash/OwnerRev' style={{ textDecoration: 'none' }}>
                        <Box display="flex" justifyContent="center" my={2}>
                            <Paper sx={{ p: 3, width: '100%', maxWidth: 500, textAlign: 'center' }}>
                                <Typography variant='h6' sx={{ flexGrow: 1 }}>
                                    <Box>{chosenReview.comment}</Box>
                                    <Box>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Icon key={star}>
                                                <StarIcon color={chosenReview.rating >= star ? 'warning' : 'disabled'} />
                                            </Icon>
                                        ))}
                                    </Box>
                                </Typography>
                            </Paper>
                        </Box>
                    </Link>
                    <Box display="flex" justifyContent="center" my={2}>
                        <Button
                            variant="contained"
                            onClick={handleChooseReview}
                            disabled={isChoosingReview || allReviews.length === 0}
                        >
                            Select Most Important Review
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box display="flex" justifyContent="center" my={2}>
                    <Button
                        variant="contained"
                        onClick={handleChooseReview}
                        disabled={isChoosingReview || allReviews.length === 0}
                    >
                        No review selected yet <br />
                        (Select Most Important Review)
                    </Button>
                </Box>
            )}
        </Box>
    );
}
export default AdminDash;