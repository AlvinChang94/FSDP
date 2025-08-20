import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, IconButton, Menu, MenuItem, Dialog,
    DialogTitle, DialogContent, DialogContentText, Grid, Collapse
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import http from '../http';

function Escalations() {
    const [escalations, setEscalations] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogContent, setDialogContent] = useState("");
    const [expandedHistories, setExpandedHistories] = useState({});
    const [expandedSummaries, setExpandedSummaries] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedEscalation, setSelectedEscalation] = useState(null);


    useEffect(() => {
        http.get("/escalations/clients_full_data")
            .then((res) => setEscalations(res.data))
            .catch((err) => console.error("Failed to fetch escalations", err));
    }, []);

    const handleMenuClick = (event, escalation) => {
        setAnchorEl(event.currentTarget);
        setSelectedEscalation(escalation);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const openDialog = (type, escalation) => {
        setDialogTitle(type);
        setSelectedEscalation(escalation);
        setDialogContent("Generating summary...");
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
    };


    //Tooltip toggles
    const toggleHistory = (id) => {
        setExpandedHistories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSummary = (id) => {
        setExpandedSummaries(prev => ({ ...prev, [id]: !prev[id] }));
    };


    const generateChatSummary = async (escalation) => {
        if (!escalation) return;

        setLoading(true);
        setDialogContent("Generating summary...");

        try {
            const response = await http.post("/escalations/generate-summary", {
                clientId: escalation.escalation.clientId,
                chathistory: escalation.escalation.chathistory,
            });

            const summary = response.data.chatsummary || "No summary returned.";
            setDialogContent(summary);

            // Optional: update local escalation state with the summary
            setEscalations(prev =>
                prev.map(e =>
                    e.escalation.clientId === escalation.escalation.clientId
                        ? {
                            ...e,
                            escalation: {
                                ...e.escalation,
                                chatsummary: summary
                            }
                        }
                        : e
                )
            );
        } catch (err) {
            console.error(err);
            setDialogContent("Failed to generate summary.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Box >
            <Typography variant="h5" sx={{ mb: 2 }}>Escalations</Typography>
            <Grid container spacing={2} direction="column">
                {escalations
                    .sort((a, b) => {
                        if (a.escalation.status === b.escalation.status) {
                            return a.escalation.clientId - b.escalation.clientId;
                        }
                        return a.escalation.status === "Pending" ? -1 : 1;
                    })
                    .map((escalation) => (
                        <Grid item xs={12} key={escalation.id}>
                            <Card sx={{ width: '100%', p: 2, boxShadow: 3 }}>
                                <Box sx={{ display: 'flex' }}>
                                    <Box sx={{
                                        width: 6, height: 150, alignSelf: 'center', flexShrink: 0,
                                        backgroundColor: escalation.escalation.status === 'Pending' ? 'red' : escalation.escalation.status === 'Completed' ? 'green' : 'grey',
                                        borderRadius: '2px 0 0 2px',
                                    }} />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6"><strong>Client: </strong> {escalation.name}</Typography>
                                        <Typography variant="h7"><strong>Client ID: </strong> {escalation.escalation.clientId}</Typography> <br />
                                        <Typography variant="h7"><strong>Status: </strong> {escalation.escalation.status}</Typography>
                                        <Box sx={{ mt: 2, cursor: 'pointer', width: "80%" }} onClick={() => toggleHistory(escalation.id)}>
                                            <Collapse in={expandedHistories[escalation.id]} collapsedSize={48} timeout="auto">
                                                <Typography
                                                    sx={{
                                                        whiteSpace: 'pre-line',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <strong>Chat History:</strong> <br />
                                                    {escalation.escalation.chathistory}
                                                </Typography>
                                            </Collapse>
                                        </Box>

                                        {escalation.escalation.chatsummary && (
                                            <Box sx={{ mt: 2, cursor: 'pointer', width: "80%" }} onClick={() => toggleSummary(escalation.id)}>
                                                <Collapse in={expandedSummaries[escalation.id]} collapsedSize={48} timeout="auto">
                                                    <Typography
                                                        sx={{
                                                            whiteSpace: 'pre-line',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <strong>Chat Summary:</strong> <br />
                                                        {escalation.escalation.chatsummary}
                                                    </Typography>
                                                </Collapse>
                                            </Box>
                                        )}
                                    </CardContent>

                                    <Box sx={{ alignSelf: 'flex-start', ml: 'auto' }}>
                                        {escalation.escalation.status === 'Pending' && (
                                            <>
                                                <IconButton onClick={(e) => handleMenuClick(e, escalation)}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={anchorEl}
                                                    open={Boolean(anchorEl)}
                                                    onClose={handleMenuClose}
                                                >
                                                    <MenuItem onClick={() => {
                                                        openDialog("Chat Summary", selectedEscalation);
                                                        generateChatSummary(selectedEscalation);
                                                        handleMenuClose();
                                                    }}>
                                                        Generate Chat Summary
                                                    </MenuItem>

                                                    <MenuItem onClick={async () => {
                                                        try {
                                                            // Call API to mark as complete
                                                            await http.post('/escalations/mark-complete', {
                                                                clientId: selectedEscalation.escalation.clientId
                                                            });

                                                            // Update local state
                                                            setEscalations(prev =>
                                                                prev.map(e =>
                                                                    e.escalation.clientId === selectedEscalation.escalation.clientId
                                                                        ? {
                                                                            ...e,
                                                                            escalation: {
                                                                                ...e.escalation,
                                                                                status: 'Completed'
                                                                            }
                                                                        }
                                                                        : e
                                                                )
                                                            );
                                                        } catch (err) {
                                                            console.error("Failed to mark as complete", err);
                                                        } finally {
                                                            handleMenuClose();
                                                        }
                                                    }}>
                                                        Mark as Complete
                                                    </MenuItem>

                                                </Menu>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))
                }
            </Grid >

            {/* Pop-up Dialog */}
            < Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm" >
                <DialogTitle
                    sx={{
                        backgroundColor: "#1D212B",
                        color: "#fff",
                        textAlign: "center",
                        fontWeight: "bold"
                    }}
                >
                    {dialogTitle}
                </DialogTitle>
                <DialogContent sx={{ minHeight: 250 }}>
                    <DialogContentText
                        component="pre"
                        sx={{ mt: 2, whiteSpace: "pre-wrap", fontFamily: "inherit", color: 'black' }}
                    >
                        {dialogContent}
                    </DialogContentText>
                </DialogContent>
            </Dialog >
        </Box >
    );
}

export default Escalations;
