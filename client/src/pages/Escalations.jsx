import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, IconButton, Menu, MenuItem, Dialog,
    DialogTitle, DialogContent, DialogContentText, Grid, Button
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Tooltip } from '@mui/material';
import http from '../http';

function Escalations() {
    const [escalations, setEscalations] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogContent, setDialogContent] = useState("");
    const [historyExpanded, setHistoryExpanded] = React.useState(false);
    const [summaryExpanded, setSummaryExpanded] = React.useState(false);
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

    const handleHistoryToggle = () => setHistoryExpanded(!historyExpanded);
    const handleSummaryToggle = () => setSummaryExpanded(!summaryExpanded);

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
                        ? { ...e, chatsummary: summary }
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
            <Typography variant="h5" sx={{mb: 2}}>Escalations</Typography>
            <Grid container spacing={2} direction="column">
                {escalations.map((escalation) => (
                    <Grid item xs={12} key={escalation.id}>
                        <Card sx={{ width: '100%', p: 2, boxShadow: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <CardContent>
                                    <Typography variant="h6"><strong>Client: </strong> {escalation.name}</Typography>
                                    <Typography variant="h7"><strong>Client ID: </strong> {escalation.escalation.clientId}</Typography>
                                    <Box sx={{
                                        mt: 2, flexGrow: 1,
                                        overflow: historyExpanded ? 'visible' : 'hidden',
                                        textOverflow: historyExpanded ? 'unset' : 'ellipsis',
                                        width: "75%",
                                        display: historyExpanded ? 'block' : '-webkit-box',
                                        WebkitBoxOrient: historyExpanded ? 'unset' : 'vertical',
                                        WebkitLineClamp: historyExpanded ? 'unset' : 2,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                    }}>
                                        <Tooltip onClick={handleHistoryToggle}
                                            sx={{
                                            }}>
                                            <Typography variant="h7" sx={{ whiteSpace: "pre-line" }}><strong>Chat History: </strong> {escalation.escalation.chathistory}</Typography>

                                        </Tooltip>
                                    </Box>

                                    {escalation.escalation.chatsummary && (
                                    <Box sx={{
                                        mt: 2, flexGrow: 1,
                                        overflow: summaryExpanded ? 'visible' : 'hidden',
                                        textOverflow: summaryExpanded ? 'unset' : 'ellipsis',
                                        width: "75%",
                                        display: summaryExpanded ? 'block' : '-webkit-box',
                                        WebkitBoxOrient: summaryExpanded ? 'unset' : 'vertical',
                                        WebkitLineClamp: summaryExpanded ? 'unset' : 2,
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                    }}>
                                        <Tooltip onClick={handleSummaryToggle}
                                            sx={{
                                            }}>
                                            <Typography variant="h7" sx={{ whiteSpace: "pre-line" }}><strong>Chat Summary: </strong> <br/>{escalation.escalation.chatsummary}</Typography>

                                        </Tooltip>
                                    </Box>
                                    )}
                                </CardContent>

                                <Box sx={{ alignSelf: 'flex-start' }}>
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
                                    </Menu>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pop-up Dialog */}
            <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
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
                        sx={{ mt: 2, whiteSpace: "pre-wrap", fontFamily: "inherit" }}
                    >
                        {dialogContent}
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default Escalations;
