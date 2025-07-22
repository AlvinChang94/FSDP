import { Box, Typography, Grid, Paper, Button, Link as MuiLink, Icon, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import RatingBarChart from './RatingBarChart';
import StarIcon from '@mui/icons-material/Star';

function AdminDash() {
    const reviews = [
        {
            id: 1,
            rating: 4,
            comment: "Good experience overall. Would recommend!",
        }]

    return (
        <Box sx = {{minHeight: '100vh',overflowY: 'auto'}}>
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
            <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                    <Paper sx={{ p: 3, width: '100%', maxWidth: 500, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                            User satisfaction metrics
                        </Typography>
                    </Paper>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Link to='/AdminDash/Satisfaction' style={{ textDecoration: 'none' }}>
                    <Box display="flex" justifyContent="center" my={2}>
                        <Paper sx={{ p: 5, width: '100%', maxWidth: 700, textAlign: 'center', border: '2px dashed #ccc', bgcolor: '#fafafa', height: 250 }}>
                            <RatingBarChart />
                        </Paper>
                    </Box>
                </Link>
            </Grid>
            <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                    <Paper sx={{ p: 3, width: '100%', maxWidth: 500, textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">
                            Business owners' review
                        </Typography>
                    </Paper>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Link to='/AdminDash/OwnerRev' style={{ textDecoration: 'none' }}>
                    <Box display="flex" justifyContent="center" my={2}>
                        {reviews.map((review) => (
                            <Grid item xs={12} md={6} lg={4} key={review.id}>
                                <Card key={review.id} sx={{ mb: 2, height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', mb: 1 }}>
                                            <Typography variant='h6' sx={{ flexGrow: 1 }}>
                                                <Box>
                                                    {review.comment}
                                                </Box>
                                                <Box>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Icon key={star}>
                                                            <StarIcon color={(review.rating) >= star ? 'warning' : 'disabled'} />
                                                        </Icon>
                                                    ))}
                                                </Box>
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Box>
                </Link>
            </Grid>
        </Box>
    );
}
export default AdminDash;