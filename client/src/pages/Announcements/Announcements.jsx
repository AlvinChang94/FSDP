import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, IconButton, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import http from '../../http';
import { Edit } from '@mui/icons-material';

function Announcements() {
    const [announcementList, setAnnouncementList] = useState([]);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [today, setToday] = useState(new Date().toLocaleString());

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            http.get('/user/auth').then((res) => {
                setUser(res.data.user);
            });
        }
    }, []);

    useEffect(() => {
        http.get("/announcements")
            .then((res) => setAnnouncementList(res.data))
            .catch((err) => console.error("Failed to fetch announcements", err));
        setToday(new Date().toLocaleString());
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} justifyContent='space-between'>
                <Typography variant="h5">Announcements</Typography>
                <Box>
                    <Button sx={{ mr: 2 }} variant="contained" onClick={() => navigate("/")} color='inherit'>
                        Back to Home
                    </Button>
                    {user && user.role == 'admin' && (
                        <Link to='/CreateAnnouncement'>
                            <Button color='secondary' variant='contained'>Create</Button>
                        </Link>
                    )}
                </Box>
            </Box>

            <Grid container spacing={2} direction='column'>
                {announcementList.map((announcement) => (
                    <Grid item xs={12} key={announcement.id}>
                        {user && user.role == 'user' && ((announcement.sendNow || (!announcement.sendNow && (new Date(announcement.scheduledDate).toLocaleString()) <= today))
                            && ((user.role == 'admin' && announcement.AudienceisModerator) || (user.role == 'user' && announcement.AudienceisUser))) ? (
                            <Card sx={{ width: '96%', padding: '16px', backgroundColor: '#fff', boxShadow: 3, minHeight: 150 }}>
                                <CardContent>
                                    {/* Title & Edit Icon */}
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                            <strong>
                                                {announcement.title}
                                            </strong>
                                        </Typography>
                                        {user && user.role == 'admin' && (
                                            <Link to={`/EditAnnouncement/${announcement.id}`}>
                                                <IconButton color='success'>
                                                    <Edit />
                                                </IconButton>
                                            </Link>
                                        )}
                                    </Box>

                                    {/* Content */}
                                    <Typography sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                        {announcement.content}
                                    </Typography>

                                    {/* Scheduled Date */}
                                    {user && user.role == 'admin' && announcement.scheduledDate && !announcement.sendNow && (
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Scheduled Date: {new Date(announcement.scheduledDate).toLocaleString()}
                                        </Typography>
                                    )}

                                    {/* Audience */}
                                    {user && user.role == 'admin' && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                Audience:
                                            </Typography>
                                            {announcement.AudienceisModerator && !announcement.AudienceisUser ? (
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    Moderator
                                                </Typography>
                                            ) : announcement.AudienceisUser && !announcement.AudienceisModerator ? (
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    User
                                                </Typography>
                                            ) : (
                                                <>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        Moderator
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        User
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ) : user && user.role == 'admin' && (
                            <Card sx={{ width: '100%', padding: '16px', backgroundColor: '#fff', boxShadow: 3, minHeight: 150 }}>
                                <CardContent>
                                    {/* Title & Edit Icon */}
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                            <strong>
                                                {announcement.title}
                                            </strong>
                                        </Typography>
                                        {user && user.role == 'admin' && (
                                            <Link to={`/EditAnnouncement/${announcement.id}`}>
                                                <IconButton color='success'>
                                                    <Edit />
                                                </IconButton>
                                            </Link>
                                        )}
                                    </Box>

                                    {/* Content */}
                                    <Typography sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                        {announcement.content}
                                    </Typography>

                                    {/* Scheduled Date */}
                                    {user && user.role == 'admin' && announcement.scheduledDate && !announcement.sendNow && (
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Scheduled Date: {new Date(announcement.scheduledDate).toLocaleString()}
                                        </Typography>
                                    )}

                                    {/* Audience */}
                                    {user && user.role == 'admin' && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                Audience:
                                            </Typography>
                                            {announcement.AudienceisModerator && !announcement.AudienceisUser ? (
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    Moderator
                                                </Typography>
                                            ) : announcement.AudienceisUser && !announcement.AudienceisModerator ? (
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    User
                                                </Typography>
                                            ) : (
                                                <>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        Moderator
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        User
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Announcements;