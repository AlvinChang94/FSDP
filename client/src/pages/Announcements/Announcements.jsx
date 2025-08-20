import { Link, useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, IconButton, Menu, MenuItem, Button, Grid, Tooltip, Collapse
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import http from '../../http';
import { Edit } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function Announcements() {
    const [announcementList, setAnnouncementList] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [today, setToday] = useState(new Date().toLocaleString());
    const [expandedContent, setExpandedContent] = useState({});

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

    const handleMenuClick = (event, announcement) => {
        setAnchorEl(event.currentTarget);
        setSelectedAnnouncement(announcement);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const sortedForUser = [...announcementList].sort((a, b) => {
        if (a.statusForUser === b.statusForUser) {
            return a.id - b.id;
        }
        return a.statusForUser === "Unread" ? -1 : 1;
    });

    const sortedForAdmin = [...announcementList].sort((a, b) => {
        if (a.statusForAdmin === b.statusForAdmin) {
            return a.id - b.id;
        }
        return a.statusForAdmin === "Unread" ? -1 : 1;
    });

    const toggleContent = (id) => {
        setExpandedContent(prev => ({ ...prev, [id]: !prev[id] }));
    };

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
                {(user && user.role === 'user' ? sortedForUser : sortedForAdmin).map((announcement) => (
                    <Grid item xs={12} key={announcement.id}>
                        {user && user.role == 'user' && ((announcement.sendNow || (!announcement.sendNow && (new Date(announcement.scheduledDate).toLocaleString()) <= today))
                            && ((user.role == 'admin' && announcement.AudienceisModerator) || (user.role == 'user' && announcement.AudienceisUser))) ? (
                            <Card sx={{ display: 'flex', width: '96%', padding: '16px', backgroundColor: '#fff', boxShadow: 3, minHeight: 150 }}>
                                {/* Status Bar */}
                                <Box sx={{
                                    width: 6, height: 120, alignSelf: 'center', flexShrink: 0,
                                    backgroundColor: announcement.statusForUser === "Read" ? "green" : "red",
                                    borderRadius: '3px 0 0 3px',
                                }} />

                                <CardContent sx={{maxWidth: '80%'}}>
                                    {/* Title & Edit Icon */}
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                            <strong>
                                                {announcement.title}
                                            </strong>
                                        </Typography>
                                    </Box>

                                    {/* Content */}
                                    <Box sx={{ mt: 2, cursor: 'pointer' }} onClick={() => toggleContent(announcement.id)}>
                                        <Typography>
                                            {!expandedContent[announcement.id] && (
                                                <Typography sx={{ whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {announcement.content}
                                                </Typography>
                                            )}
                                        </Typography>

                                        <Collapse in={expandedContent[announcement.id]}>

                                            <Typography sx={{ whiteSpace: 'pre-line' }}>
                                                {announcement.content}
                                            </Typography>

                                        </Collapse>
                                    </Box>

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
                                    {/* Scheduled Date & Date Edited */}
                                    <Box sx={{ color: 'text.secondary', mt: 2 }}>
                                        {user && user.role == 'admin' && announcement.scheduledDate && !announcement.sendNow && (
                                            <Tooltip>
                                                <Typography sx={{ fontSize: '10px' }}>
                                                    Scheduled Date: {new Date(announcement.scheduledDate).toLocaleString()}
                                                </Typography>
                                            </Tooltip>
                                        )}
                                        {announcement.editedAt && (
                                            <Tooltip >
                                                <Typography sx={{ fontSize: '10px' }}>
                                                    Edited At: {announcement.editedAt}
                                                </Typography>
                                            </Tooltip>
                                        )}
                                        <Tooltip>
                                            <Typography sx={{ fontSize: '10px' }}>
                                                Sent at: {today}
                                            </Typography>
                                        </Tooltip>
                                        {announcement.statusForUser === "Read" && (
                                            <Tooltip>
                                                <Typography sx={{ fontSize: '10px' }}>
                                                    Read At: {new Date().toLocaleString()}
                                                </Typography>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </CardContent>
                                <Box sx={{ alignSelf: 'flex-start', ml: 'auto' }}>


                                    <IconButton onClick={(a) => handleMenuClick(a, announcement)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem onClick={async () => {
                                            try {
                                                // Call API to mark as read
                                                await http.post('/announcements/mark-user-read', {
                                                    id: selectedAnnouncement.id
                                                });

                                                // Update local state to reflect change
                                                setAnnouncementList(prev =>
                                                    prev.map(a =>
                                                        a.id === selectedAnnouncement.id
                                                            ? { ...a, statusForUser: 'Read' }
                                                            : a
                                                    )
                                                );
                                            } catch (err) {
                                                console.error("Failed to mark as read", err);
                                            } finally {
                                                handleMenuClose();
                                            }
                                        }}>
                                            Mark as Read
                                        </MenuItem>
                                    </Menu>
                                </Box>
                            </Card>
                        ) : user && user.role == 'admin' && (
                            <Card sx={{ display: 'flex', width: '97%', padding: '16px', backgroundColor: '#fff', boxShadow: 3, minHeight: 150 }}>
                                {/* Status Bar */}
                                <Box sx={{
                                    width: 6, height: 120, alignSelf: 'center', flexShrink: 0,
                                    backgroundColor: announcement.statusForAdmin === "Read" ? "green" : "red",
                                    borderRadius: '3px 0 0 3px',
                                }} />

                                <CardContent sx={{maxWidth: '80%'}}>
                                    {/* Title & Edit Icon */}
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                            <strong>
                                                {announcement.title}
                                            </strong>
                                        </Typography>

                                    </Box>


                                    {/* Content */}
                                    <Box sx={{ mt: 2, cursor: 'pointer' }} onClick={() => toggleContent(announcement.id)}>
                                        <Typography>
                                            {!expandedContent[announcement.id] && (
                                                <Typography sx={{ whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {announcement.content}
                                                </Typography>
                                            )}
                                        </Typography>

                                        <Collapse in={expandedContent[announcement.id]}>

                                            <Typography sx={{ whiteSpace: 'pre-line' }}>
                                                {announcement.content}
                                            </Typography>

                                        </Collapse>
                                    </Box>



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
                                    {/* Scheduled Date & Date Edited */}
                                    <Box sx={{ color: 'text.secondary', mt: 2 }}>
                                        {user && user.role == 'admin' && announcement.scheduledDate && !announcement.sendNow ? (
                                            <Tooltip>
                                                <Typography sx={{ fontSize: '10px' }}>
                                                    Scheduled Date: {new Date(announcement.scheduledDate).toLocaleString()}
                                                </Typography>
                                            </Tooltip>
                                        ) : announcement.sendNow ? (
                                            <Tooltip>
                                                <Typography sx={{ fontSize: '10px' }}>
                                                    Sent at: {today}
                                                </Typography>
                                            </Tooltip>
                                        ) : (null)}
                                        {announcement.editedAt && (
                                            <Tooltip >
                                                <Typography sx={{ fontSize: '10px' }}>
                                                    Edited At: {announcement.editedAt}
                                                </Typography>
                                            </Tooltip>
                                        )}
                                        {announcement.statusForAdmin === "Read" && (
                                            <Tooltip>
                                                <Typography sx={{ fontSize: '10px' }}>
                                                    Read At: {new Date().toLocaleString()}
                                                </Typography>
                                            </Tooltip>
                                        )}
                                    </Box>

                                </CardContent>

                                <Box sx={{ alignSelf: 'flex-start', ml: 'auto' }}>
                                    {user && user.role == 'admin' && (
                                        <Link to={`/EditAnnouncement/${announcement.id}`}>
                                            <IconButton color='success'>
                                                <Edit />
                                            </IconButton>
                                        </Link>
                                    )}
                                    <IconButton onClick={(a) => handleMenuClick(a, announcement)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem onClick={async () => {
                                            try {
                                                // Call API to mark as read
                                                await http.post('/announcements/mark-admin-read', {
                                                    id: selectedAnnouncement.id
                                                });

                                                // Update local state to reflect change
                                                setAnnouncementList(prev =>
                                                    prev.map(a =>
                                                        a.id === selectedAnnouncement.id
                                                            ? { ...a, statusForAdmin: 'Read' }
                                                            : a
                                                    )
                                                );
                                            } catch (err) {
                                                console.error("Failed to mark as read", err);
                                            } finally {
                                                handleMenuClose();
                                            }
                                        }}>
                                            Mark as Read
                                        </MenuItem>
                                    </Menu>

                                </Box>

                            </Card>
                        )}
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Announcements;