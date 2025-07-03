import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography, IconButton, Menu, MenuItem, Dialog,
    DialogTitle, DialogContent, DialogContentText, Grid
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Tooltip } from '@mui/material';

function Escalations() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogContent, setDialogContent] = useState("");

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const openDialog = (type) => {
        setDialogTitle(type);

        if (type === "Generate Client Summary") {
            setDialogContent(
                `Name: Jane Doe
Email: janedoe@example.com
Role: Client
Status: Active
Escalation History: 2 past escalations
Last Escalation: June 15, 2025`
            );
        } else if (type === "Generate Chat Summary") {
            setDialogContent(
                `Jane Doe expressed frustration over delayed responses.
She asked about account limits and billing.
Escalation triggered after 2 unresolved follow-ups.
Suggested next action: assign a senior support rep.`
            );
        }

        setDialogOpen(true);
        handleMenuClose();
    };

    const closeDialog = () => {
        setDialogOpen(false);
    };

    const person = {
        name: "Jane Doe",
        email: "janedoe@example.com",
        occupation: "Marketing Manager",
        chatPreview: [
            { sender: "Jane", message: "Hi, I've been waiting on this for 3 days..." },
            { sender: "Support", message: "Apologies! Let me look into that for you." },
            { sender: "Jane", message: "Please escalate this. I’ve asked twice already." },
        ]
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                    <Card sx={{ width: '100%', p: 2, boxShadow: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <CardContent>
                                <Typography variant="h6"><strong>Name:</strong> {person.name}</Typography>
                                <Typography variant="body1"><strong>Email:</strong> {person.email}</Typography>
                                <Typography variant="body1"><strong>Occupatuion:</strong> {person.occupation}</Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Tooltip title={`${person.chatPreview[0]?.sender}: ${person.chatPreview[0]?.message}`}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "text.secondary",
                                                opacity: 0.7,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: "100%",
                                            }}
                                        >
                                            💬 {person.chatPreview[0]?.sender}: {person.chatPreview[0]?.message}
                                        </Typography>
                                    </Tooltip>
                                </Box>
                            </CardContent>

                            <Box sx={{ alignSelf: 'flex-start' }}>
                                <IconButton onClick={handleMenuClick}>
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={() => openDialog("Generate Client Summary")}>
                                        Generate Client Summary
                                    </MenuItem>
                                    <MenuItem onClick={() => openDialog("Generate Chat Summary")}>
                                        Generate Chat Summary
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </Card>
                </Grid>
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
