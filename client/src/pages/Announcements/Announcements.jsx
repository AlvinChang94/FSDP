import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, IconButton, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import http from '../../http';
import { Edit } from '@mui/icons-material';

function Announcements() {
    const [announcementList, setAnnouncementList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        http.get("/announcements")
            .then((res) => setAnnouncementList(res.data))
            .catch((err) => console.error("Failed to fetch announcements", err));
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} justifyContent='space-between'>
                <Typography variant="h5">Announcements</Typography>
                <Box>
                    <Button sx={{ mr: 2 }} variant="contained" onClick={() => navigate("/")} color='inherit'>
                        Back to Home
                    </Button>
                    <Link to='/CreateAnnouncement'>
                        <Button color='secondary' variant='contained'>Create</Button>
                    </Link>
                </Box>
            </Box>

            <Grid container spacing={2} direction='column'>
                {announcementList.map((announcement) => (
                    <Grid item xs={12} key={announcement.id}>
                        <Card sx={{ width: '100%', padding: '16px', backgroundColor: '#fff', boxShadow: 3, minHeight: 200 }}>
                            <CardContent>
                                {/* Title & Edit Icon */}
                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                        {announcement.title}
                                    </Typography>
                                    <Link to={`/EditAnnouncement/${announcement.id}`}>
                                        <IconButton color='success'>
                                            <Edit />
                                        </IconButton>
                                    </Link>
                                </Box>

                                {/* Content */}
                                <Typography sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                    {announcement.content}
                                </Typography>

                                {/* Scheduled Date */}
                                {announcement.scheduledDate && (
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Scheduled Date: {new Date(announcement.scheduledDate).toLocaleString()}
                                    </Typography>
                                )}

                                {/* Audience */}
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        Audience:
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {announcement.AudienceisModerator ? 'Moderator' : ''} <br></br>
                                        {announcement.AudienceisUser ? 'User' : ''}
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

export default Announcements;