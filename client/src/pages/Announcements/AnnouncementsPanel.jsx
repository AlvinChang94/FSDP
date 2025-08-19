import React, { useState, useEffect, handleClick } from 'react';
import {
    Drawer, Button, Box, IconButton, Typography, Accordion, AccordionSummary, AccordionDetails,
    List, ListItemButton, ListItemText, Tooltip, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import http from '../../http.js';
import { Link } from 'react-router-dom';
import Popover from '@mui/material/Popover';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const AnnouncementsPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [panelAnnouncementList, setPanelAnnouncementList] = useState([]);
    const [escalationsList, setEscalationsList] = useState([]);
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverAnchor, setPopoverAnchor] = useState(null);
    const [popoverAnnouncementId, setPopoverAnnouncementId] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAnnouncement, setDialogAnnouncement] = useState(null);
    const [today, setToday] = useState(new Date().toLocaleString());
    const [announcementsExpanded, setAnnouncementsExpanded] = useState(true);


    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            http.get('/user/auth').then((res) => {
                setUser(res.data.user);
            });
        }
    }, []);

    const toggleDrawer = (open) => () => {
        setIsOpen(open);
    };

    useEffect(() => {
        if (isOpen) {
            http.get("/announcements")
                .then((res) => setPanelAnnouncementList(res.data))
                .catch((err) => console.error("Failed to fetch announcements", err));
            setToday(new Date().toLocaleString());
            http.get("/escalations/clients_full_data")
                .then((res) => setEscalationsList(res.data))
                .catch((err) => console.error("Failed to fetch escalations", err))

        }
    }, [isOpen]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const handlePopoverOpen = (event, announcementId) => {
        setPopoverAnchor(event.currentTarget);
        setPopoverAnnouncementId(announcementId);
    };

    const handlePopoverClose = () => {
        setPopoverAnchor();
        setPopoverAnnouncementId();
    };

    const handleExpandClick = () => {
        const announcement = panelAnnouncementList.find(a => a.id === popoverAnnouncementId);
        setDialogAnnouncement(announcement);
        setDialogOpen(true);
        handlePopoverClose();
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setDialogAnnouncement();
    };

    const isPopoverOpen = Boolean(popoverAnchor);
    return (
        <>
            <ListItemButton onClick={toggleDrawer(true)} sx={{ textTransform: 'none', color: 'white' }}>
                <ListItemText primary='Announcements' />
            </ListItemButton>
            <Drawer anchor='right' open={isOpen} onClose={toggleDrawer(false)}>
                <Box sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1e212e' }}>

                    <Accordion defaultExpanded disableGutters='true' expanded={announcementsExpanded}
                        onChange={() => setAnnouncementsExpanded(!announcementsExpanded)} square sx={{ backgroundColor: '#1e212e', color: 'white', boxShadow: 'none' }}>
                        <AccordionSummary sx={{
                            position: 'relative',
                            pl: 4,
                            pr: 4,
                            justifyContent: 'center',
                            '& .MuiAccordionSummary-content': {
                                justifyContent: 'center',
                            },
                        }} expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                            <Typography>ANNOUNCEMENTS</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ backgroundColor: '#cdcdcd', p: 0 }}>
                            <Box sx={{ overflowY: 'auto', height: 575, ...(user && user.role == 'user' && { height: 263 }) }}>
                                <AccordionDetails>
                                    <Grid container spacing={2} direction='column'>
                                        {panelAnnouncementList.filter(announcement =>
                                            (announcement.sendNow || (!announcement.sendNow && (new Date(announcement.scheduledDate).toLocaleString()) <= today)) && ((user.role == 'admin' && announcement.AudienceisModerator) || (user.role == 'user' && announcement.AudienceisUser)))
                                            .map((announcement) => (
                                                <Grid item xs={12} >
                                                    <AccordionDetails sx={{ mb: 0.5 }}>
                                                        <Card sx={{ backgroundColor: '#fff', boxShadow: 'none', mb: -3.5, mt: -1, width: 235 }}>
                                                            <CardContent>
                                                                {/* Title & Edit Icon */}
                                                                <Box>
                                                                    <Typography variant="h7" sx={{
                                                                        flexGrow: 1, p: '5px', overflow: 'hidden', textOverflow: 'ellipsis',
                                                                        display: '-webkit-box',
                                                                        WebkitBoxOrient: 'vertical',
                                                                        WebkitLineClamp: 1
                                                                    }}>
                                                                        <strong>
                                                                            {announcement.title}
                                                                        </strong>
                                                                    </Typography>
                                                                </Box>

                                                                {/* Content */}
                                                                <Typography sx={{
                                                                    whiteSpace: 'pre-wrap', p: '4px', fontSize: '12px', color: '#7f7f7f', overflow: 'hidden', textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitBoxOrient: 'vertical',
                                                                    WebkitLineClamp: 2
                                                                }}>
                                                                    {announcement.content}
                                                                </Typography>
                                                            </CardContent>
                                                            <IconButton
                                                                type="button"
                                                                aria-describedby={popoverAnnouncementId === announcement.id ? 'simple-popover' : undefined}
                                                                onClick={(e) => handlePopoverOpen(e, announcement.id)}
                                                                sx={{ ml: 22 }}
                                                            >
                                                                <MoreVertIcon />
                                                            </IconButton>

                                                            {/* Popover for this announcement */}
                                                            <Popover
                                                                id="simple-popover"
                                                                open={popoverAnnouncementId === announcement.id && isPopoverOpen}
                                                                anchorEl={popoverAnchor}
                                                                onClose={handlePopoverClose}
                                                                anchorOrigin={{
                                                                    vertical: 'bottom',
                                                                    horizontal: 'left',
                                                                }}
                                                                elevation={3}
                                                            >
                                                                <Button sx={{ textTransform: 'none' }} onClick={handleExpandClick}>
                                                                    Expand
                                                                </Button>
                                                            </Popover>
                                                        </Card>
                                                        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                                                            <DialogTitle>{dialogAnnouncement?.title}</DialogTitle>
                                                            <DialogContent dividers>
                                                                <Typography whiteSpace="pre-wrap">
                                                                    {dialogAnnouncement?.content}
                                                                </Typography>
                                                            </DialogContent>
                                                            <Button onClick={handleDialogClose} sx={{ m: 2 }}>
                                                                Close
                                                            </Button>
                                                        </Dialog>
                                                    </AccordionDetails>
                                                </Grid>
                                            ))}
                                    </Grid>
                                </AccordionDetails>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                    {user && user.role == "user" && (
                        <Accordion defaultExpanded disableGutters='true' square='true' sx={{ backgroundColor: '#1e212e', color: 'white', boxShadow: 'none' }}>
                            <AccordionSummary sx={{
                                position: 'relative',
                                pl: 4,
                                pr: 4,
                                justifyContent: 'center',
                                '& .MuiAccordionSummary-content': {
                                    justifyContent: 'center',
                                },
                            }} expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                                <Typography>ESCALATIONS</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: '#cdcdcd', p: 0 }}>
                                <Box sx={{ overflowY: 'auto', height: announcementsExpanded ? 263 : 526 }}>
                                    <AccordionDetails>
                                        <Grid container spacing={2} direction='column'>
                                            {escalationsList
                                                .sort((a, b) => {
                                                    if (a.escalation.status === b.escalation.status) {
                                                        return a.escalation.clientId - b.escalation.clientId;
                                                    }
                                                    return a.escalation.status === "Pending" ? -1 : 1;
                                                })
                                                .map((escalation) => (
                                                    <Grid item xs={12}>
                                                        <AccordionDetails sx={{ mb: 0.5 }}>
                                                            <Card sx={{ backgroundColor: '#fff', boxShadow: 'none', mb: -3.5, mt: -1, width: 235 }}>
                                                                <Box sx={{ display: 'flex', mt: 1, mb: 1 }}>
                                                                    {/* Status Indicator Bar */}
                                                                    <Box sx={{
                                                                        width: 6,
                                                                        height: 80,
                                                                        alignSelf: 'center',
                                                                        flexShrink: 0,
                                                                        backgroundColor: escalation.escalation.status === 'Pending' ? 'red' : 'green',
                                                                        borderRadius: '2px 0 0 2px',
                                                                        mr: 1
                                                                    }} />

                                                                    <CardContent sx={{ flexGrow: 1, p: 1 }}>
                                                                        <Typography sx={{ fontSize: '15px' }}><strong>Client: </strong>{escalation.name}</Typography>
                                                                        <Typography sx={{ fontSize: '12px' }}><strong>Client ID: </strong>{escalation.escalation.clientId}</Typography>
                                                                        <Typography sx={{ fontSize: '12px' }}><strong>Status: </strong>{escalation.escalation.status}</Typography>

                                                                        <Box sx={{
                                                                            flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis',
                                                                            display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, mt: 1
                                                                        }}>
                                                                            <Typography  sx={{ whiteSpace: "pre-line", fontSize: '12px' }}>
                                                                                <strong>Chat History: </strong>
                                                                                <Typography sx={{ fontSize: '12px' }}>{escalation.escalation.chathistory}</Typography>
                                                                            </Typography>
                                                                        </Box>
                                                                        {escalation.escalation.chatsummary && (
                                                                            <Box sx={{
                                                                                flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis',
                                                                                display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, mt: 1, mb: -1
                                                                            }}>
                                                                                <Typography  sx={{ whiteSpace: "pre-line", fontSize: '12px' }}>
                                                                                    <strong>Chat Summary: </strong>
                                                                                    <Typography sx={{ fontSize: '12px' }}>{escalation.escalation.chatsummary}</Typography>
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                    </CardContent>
                                                                </Box>
                                                            </Card>
                                                        </AccordionDetails>
                                                    </Grid>
                                                ))}
                                        </Grid>
                                    </AccordionDetails>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    )}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            backgroundColor: '#1e212e',
                            p: 0,
                            width: '100%'
                        }}
                    >
                        {user && user.role == 'admin' ? (
                            <Link to='/CreateAnnouncement'>
                                <Button variant="contained" fullWidth>
                                    <Typography>Create Announcement</Typography>
                                </Button>
                            </Link>
                        ) : (
                            <Link to='/Escalations'>
                                <Button variant="contained" fullWidth>
                                    <Typography>View Escalations</Typography>
                                </Button>
                            </Link>
                        )}
                        <Link to='/Announcements'>
                            <Button variant="contained" fullWidth>
                                {user && user.role == 'admin' ? (
                                    <Typography>View All Announcements</Typography>
                                ) : (
                                    <Typography>View Announcements</Typography>
                                )}
                            </Button>
                        </Link>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default AnnouncementsPanel;