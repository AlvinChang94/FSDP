import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, IconButton, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import http from '../../http';
import dayjs from 'dayjs';
import { AccessTime, Edit } from '@mui/icons-material';

function Notifs() {
    const [notificationList, setNotificationList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        http.get("/notification")
            .then((res) => setNotificationList(res.data))
            .catch((err) => console.error("Failed to fetch notifications", err));
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} justifyContent='space-between'>
                <Typography variant="h5">Notifications</Typography>
                <Link to='/AddNotif'>
                    <Button color='primary' variant='contained'>Add</Button>
                </Link>
            </Box>

            <Grid container spacing={2}>
                {notificationList.map((notif) => (
                    <Grid item xs={12} md={6} lg={4} key={notif.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                        {notif.title}
                                    </Typography>
                                    <Link to={`/EditNotif/${notif.id}`}>
                                        <IconButton color='primary'>
                                            <Edit />
                                        </IconButton>
                                    </Link>
                                </Box>
                                <Typography sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                    {notif.message}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }} color="text.secondary">
                                    <AccessTime sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                        Send: {dayjs(notif.sendDate).format('YYYY-MM-DD')}<br />
                                        Event: {dayjs(notif.eventDate).format('YYYY-MM-DD')}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 999 }}>
                <Button variant="contained" onClick={() => navigate(-1)} color='inherit'>
                    Back
                </Button>
            </Box>
        </Box>
    );
}

export default Notifs;