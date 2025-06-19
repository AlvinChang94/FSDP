import React, { useState } from "react";
import { Box, Typography, Paper, Checkbox, FormControlLabel, FormGroup, Radio, RadioGroup, TextField, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';

const configNav = [
    {
        label: "Tone & Personality",
        icon: <PsychologyIcon />,
        path: "/config/tone_personality"
    },
    {
        label: "FAQ Management",
        icon: <QuestionMarkIcon />,
        path: "/config/faq_management"
    },
    {
        label: "Security & Privacy",
        icon: <SecurityIcon />,
        path: "/config/security_privacy"
    },
    {
        label: "Intervention Threshold",
        icon: <EmojiEmotionsIcon />,
        path: "/config/intervetion_threshold"
    }
];
function Faq_Management() {
    return (
        <Box sx={{ ml: -6, mt: -4, mb: -30 }}>
            <Box sx={{ display: "flex", bgcolor: "#181617" }}>
                {/* Secondary Nav Bar */}
                <Box sx={{
                    width: 250,
                    bgcolor: "#181f2a",
                    color: "#fff",
                    pt: 4,
                    px: 0,
                    borderRight: "1px solid #222",
                    height: "96.9vh"
                }}>
                    <Typography sx={{ color: "#bfcfff", fontWeight: 700, fontSize: 18, pl: 4, mb: 2 }}>
                        Chatbot boundaries
                    </Typography>
                    <List>
                        {configNav.map((item) => (
                            <ListItem key={item.label} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    selected={location.pathname === item.path}
                                    sx={{
                                        borderRadius: 2,
                                        mx: 1,
                                        my: 0.5,
                                        color: location.pathname === item.path ? "#4287f5" : "#fff",
                                        bgcolor: location.pathname === item.path ? "#e6edff" : "transparent",
                                        '&:hover': {
                                            bgcolor: "#232b33",
                                            color: "#7ec4fa"
                                        },
                                        transition: 'background 0.2s, color 0.2s'
                                    }}
                                >
                                    <ListItemIcon sx={{ color: location.pathname === item.path ? "#4287f5" : "#fff", minWidth: 36 }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontWeight: location.pathname === item.path ? 700 : 500,
                                            fontSize: 16
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Main Content */}
                <Box sx={{ flex: 1, bgcolor: "#f7f8fa", p: 5, mr: '-48px' }}>
                    d
                </Box>
            </Box>
        </Box>
    );
}
export default Faq_Management;