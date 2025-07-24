import React, { useState } from "react";
import { Box, Typography, Paper, FormGroup, FormControlLabel, Checkbox, TextField, Button, Grid, Select, MenuItem, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Modal, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DeleteIcon from '@mui/icons-material/Delete';

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
        path: "/config/intervention_threshold"
    }
];
const triggerTypeOptions = [
    "keyword_match",
    "retries_exceeded",
    "emotion_detected"
];

const actionOptions = [
    "escalate to human",
    "log only",
    "mask data"
];
function Intervention_threshold() {
    const location = useLocation();

    // Agent notification method
    const [notification, setNotification] = useState({
        email: false,
        dashboard: false,
        whatsapp: false
    });

    // Holding message
    const [holdingMsg, setHoldingMsg] = useState("");

    // Threshold rules
    const [rules, setRules] = useState([
        {
            ruleName: "Sensitive Terms",
            triggerType: "keyword_match",
            keyword: "surrender, beneficiary, trustee, payout, claim rejection",
            action: "escalate to human"
        },
        {
            ruleName: "Personal Info Terms",
            triggerType: "keyword_match",
            keyword: "NRIC, IC, passport, address, bank account, phone number",
            action: "mask data"
        },
        {
            ruleName: "Financial Actions",
            triggerType: "keyword_match",
            keyword: "cancel my policy, switch payment, withdraw funds",
            action: "escalate to human"
        },
        {
            ruleName: "Unanswered Questions",
            triggerType: "retries_exceeded",
            keyword: "5",
            action: "escalate to human"
        },
        {
            ruleName: "Frustration Signals",
            triggerType: "emotion_detected",
            keyword: 'angry, upset, frustrated, confused, "not helpful", "annoyed"',
            action: "escalate to human"
        }
    ]);
    const [ruleName, setRuleName] = useState("");
    const [triggerType, setTriggerType] = useState("");
    const [keyword, setKeyword] = useState("");
    const [action, setAction] = useState("");
    const [deleteIdx, setDeleteIdx] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Add rule
    const handleAddRule = () => {
        if (ruleName && triggerType && keyword && action) {
            setRules([
                ...rules,
                { ruleName, triggerType, keyword, action }
            ]);
            setRuleName("");
            setTriggerType("");
            setKeyword("");
            setAction("");
        }
    };

    // Delete rule
    const handleDeleteRule = () => {
        setRules(rules.filter((_, idx) => idx !== deleteIdx));
        setDeleteModalOpen(false);
        setDeleteIdx(null);
    };

    return (
        <Box sx={{ ml: -6, mt: -9, mb: -30 }}>
            <Box sx={{ display: "flex", bgcolor: "#181617" }}>
                {/* Secondary Nav Bar */}
                <Box sx={{
                    width: 261,
                    bgcolor: "#181f2a",
                    color: "#fff",
                    pt: 4,
                    px: 0,
                    borderRight: "1px solid #222",
                    height: "100vh",
                    position: "fixed",
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
                <Box sx={{ flex: 1, bgcolor: "#f7f8fa", p: 5, mr: '-48px', ml: '261px', minHeight: "100vh", }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                        Intervention Threshold
                    </Typography>

                    {/* Agent notification method */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                            Agent notification method
                        </Typography>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={notification.email}
                                        onChange={e => setNotification({ ...notification, email: e.target.checked })}
                                    />
                                }
                                label="Email"
                                sx={{ mr: 3 }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={notification.dashboard}
                                        onChange={e => setNotification({ ...notification, dashboard: e.target.checked })}
                                    />
                                }
                                label="Dashboard alert"
                                sx={{ mr: 3 }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={notification.whatsapp}
                                        onChange={e => setNotification({ ...notification, whatsapp: e.target.checked })}
                                    />
                                }
                                label="Whatsapp"
                                sx={{ mr: 3 }}
                            />
                        </FormGroup>
                    </Paper>

                    {/* Preferred holding message */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                            Preferred holding message
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            placeholder="e.g. We’re connecting you to a consultant…"
                            value={holdingMsg}
                            onChange={e => setHoldingMsg(e.target.value)}
                            sx={{ bgcolor: "#fff", borderRadius: 2, mb: 2 }}
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: "#4d8af0",
                                    color: "#fff",
                                    px: 3,
                                    py: 1.3,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    borderRadius: 3,
                                    boxShadow: 2,
                                    '&:hover': { bgcolor: "#2e6fd8" },
                                    mt: 0.5
                                }}
                            >
                                Save changes
                            </Button>
                        </Box>
                    </Paper>

                    {/* Intervention threshold keywords */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Intervention threshold keywords
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#444", mb: 2 }}>
                            Phrases that trigger a human intervention
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Rule name"
                                    placeholder="e.g. Sensitive Terms"
                                    value={ruleName}
                                    onChange={e => setRuleName(e.target.value)}
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ bgcolor: "#fff", borderRadius: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel id="trigger-type-label">Trigger type</InputLabel>
                                    <Select
                                        labelId="trigger-type-label"
                                        label="Trigger type"
                                        value={triggerType}
                                        onChange={e => setTriggerType(e.target.value)}
                                    >
                                        {triggerTypeOptions.map(opt => (
                                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Trigger Keyword/Pattern"
                                    placeholder="e.g. cancel my policy"
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ bgcolor: "#fff", borderRadius: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined" sx={{ bgcolor: "#fff", borderRadius: 2 }}>
                                    <InputLabel id="action-label">Action</InputLabel>
                                    <Select
                                        labelId="action-label"
                                        value={action}
                                        label="Action"
                                        onChange={e => setAction(e.target.value)}
                                    >
                                        
                                        <MenuItem value="escalate to human">escalate to human</MenuItem>
                                        <MenuItem value="log only">log only</MenuItem>
                                        <MenuItem value="mask data">mask data</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: "#4d8af0",
                                    color: "#fff",
                                    px: 3,
                                    py: 1.3,
                                    fontWeight: 600,
                                    fontSize: 14,
                                    borderRadius: 3,
                                    boxShadow: 2,
                                    '&:hover': { bgcolor: "#2e6fd8" },
                                    mt: 0.5
                                }}
                                onClick={handleAddRule}
                                disabled={!ruleName || !triggerType || !keyword || !action}
                            >
                                Add
                            </Button>
                        </Box>
                    </Paper>

                    {/* Intervention threshold table */}
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                            Your intervention threshold
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#444", mb: 2 }}>
                            All your keywords to trigger human intervention
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: "bold" }}>Rule name</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Trigger type</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Keyword/Pattern</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rules.map((rule, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{whiteSpace: "pre-line", wordBreak: "break-word",}}>{rule.ruleName}</TableCell>
                                            <TableCell>{rule.triggerType}</TableCell>
                                            <TableCell sx={{whiteSpace: "pre-line", wordBreak: "break-word",}}>{rule.keyword}</TableCell>
                                            <TableCell>{rule.action}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => { setDeleteIdx(idx); setDeleteModalOpen(true); }}>
                                                    <DeleteIcon sx={{ color: "#e74c3c" }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Delete confirmation modal */}
                    <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                        <Box sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "#fff",
                            p: 4,
                            borderRadius: 2,
                            boxShadow: 24,
                            minWidth: 350,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            alignItems: "center"
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                                Are you sure you want to delete this rule?
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleDeleteRule}
                                >
                                    Delete
                                </Button>
                                <Button variant="outlined" onClick={() => setDeleteModalOpen(false)}>
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                </Box>
            </Box>
        </Box>
    );
}
export default Intervention_threshold;