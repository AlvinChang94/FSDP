import { Box, Typography, Grid, Paper, Button, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

function AdminDash() {
    return (
        <Box sx={{ position: 'fixed', minHeight: '100vh', minWidth: 'calc(100vw - 284px)', bgcolor: '#f5f6fa', top: 0, left: '220px', p: 4 }}>
            <Paper elevation={3} sx={{ maxWidth: 1100, mx: 'auto', p: 4, mb: 4, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Admin Dashboard
                    </Typography>
                    <Link to='/Notification' style={{ textDecoration: 'none' }}>
                        <Button variant='contained' color='secondary'>
                            View Notifications
                        </Button>
                    </Link>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    {/* Your description here */}
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
                <Link to='/AdminDash/OwnerRev' style={{textDecoration: 'none'}}>
                    <Box display="flex" justifyContent="center" my={2}>
                        <Paper
                            sx={{ p: 5, width: '100%', maxWidth: 700, textAlign: 'center', border: '2px dashed #ccc', bgcolor: '#fafafa', }}>
                            <Typography variant="body1" color="text.secondary">
                                [Graph Placeholder]
                            </Typography>
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
                <Link to='/AdminDash/Satisfaction' style={{textDecoration: 'none'}}>
                    <Box display="flex" justifyContent="center" my={2}>
                        <Paper
                            sx={{ p: 5, width: '100%', maxWidth: 700, textAlign: 'center', border: '2px dashed #ccc', bgcolor: '#fafafa', }}>
                            <Typography variant="body1" color="text.secondary">
                                [Review placeholder]
                            </Typography>
                        </Paper>
                    </Box>
                </Link>
            </Grid>
        </Box>
    );
}
export default AdminDash;