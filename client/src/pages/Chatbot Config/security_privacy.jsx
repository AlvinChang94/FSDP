import React, { useState } from "react";
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Switch, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

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
function Security_privacy() {
    // Data retention toggle (frontend only)
    const [dataRetention, setDataRetention] = useState(false);

    // Human-intervention log modal
    const [logOpen, setLogOpen] = useState(false);

    // Sensitive data filters state
    const [filters, setFilters] = useState([
        {
            keyword: "NRIC / IC / ID number",
            type: "National ID",
            rule: "Mask all except last 4 digits",
            example: "S1234567A to *****567A"
        },
        {
            keyword: "Bank account number",
            type: "Financial ID",
            rule: "Mask all except last 3 digits",
            example: "123-456-789 to ******789"
        },
        {
            keyword: "Phone number",
            type: "Contact Info",
            rule: "Mask middle digits",
            example: "9123 4567 to 9*** **67"
        },
        {
            keyword: "Email address",
            type: "Contact Info",
            rule: "Mask before @",
            example: "john.doe@email.com to j***@email.com"
        },
        {
            keyword: "Credit card number",
            type: "Payment Info",
            rule: "Mask all but last 4 digits",
            example: "4111 1111 1111 1234 to **** **** **** 1234"
        }
    ]);
    const [keyword, setKeyword] = useState("");
    const [type, setType] = useState("");
    const [rule, setRule] = useState("");
    const [example, setExample] = useState("");
    const [deleteIdx, setDeleteIdx] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Add filter
    const handleAddFilter = () => {
        if (keyword && type && rule && example) {
            setFilters([
                ...filters,
                { keyword, type, rule, example }
            ]);
            setKeyword("");
            setType("");
            setRule("");
            setExample("");
        }
    };

    // Delete filter
    const handleDeleteFilter = (idx) => {
        setFilters(filters.filter((_, i) => i !== idx));
    };

    // Human-intervention log (dummy data)
    const logRows = [
        ["2025-05-22 14:37", "Can I change the beneficiary on my policy?", "Rachel Lim", "Sure! We've arranged for your consultant to contact you for a quick walkthrough."],
        ["2025-05-22 11:12", "What’s the current surrender value of my policy?", "Alvin Wong", "Pending – Consultant notified."],
        ["2025-05-21 18:54", "I need help filing a critical illness claim.", "Marcus Teo", "I've scheduled a call with you tomorrow morning to walk through the process."],
        ["2025-05-21 09:23", "Can I withdraw partial funds from my investment plan?", "Nurul A.", "Hi Nurul, yes, partial withdrawals are allowed. The below steps indicate how."],
        ["2025-05-20 16:40", "Please send me a copy of my signed policy agreement.", "James Chia", "Sure, I've emailed it to your registered address. Let me know if you didn't receive it."],
        ["2025-05-20 10:18", "Can I nominate a new guardian for my child’s policy?", "Yvonne Tan", "Pending – Escalated to policy servicing team."],
        ["2025-05-19 14:25", "There's an error in my premium deduction last month.", "Benjamin Koh", "We're looking into this for you, Benjamin. You’ll get an update within 1 business day."],
        ["2025-05-19 10:43", "Can I pause my policy payments for 3 months?", "Cheryl Ng", "Hi Cheryl, that’s possible under financial hardship. We’ve sent you the application link in the below message."],
        ["2025-05-18 20:07", "I need to update my NRIC number in your system.", "Arjun Mehta", "Pending – Compliance team to verify document upload."],
        ["2025-05-18 15:03", "I don’t understand my investment policy returns", "Jessica Ho", "Sure! We've arranged for your consultant to contact you for a quick walkthrough."],
        ["2025-05-17 09:59", "I want to cancel my policy. What’s the process?", "Leo Sim", "Hi Leo, sorry to hear that. We’ve sent you the cancellation guide and form to review."],
        ["2025-05-16 16:21", "My dependent’s name is misspelled in the policy.", "Farah Aziz", "Correction request received. Our team is updating your records now."],
        ["2025-05-16 11:44", "Is my nomination form submitted successfully?", "Gabriel Tan", "Yes, Gabriel. We've received it and it’s been processed. You’re all set!"],
        ["2025-05-15 17:02", "I want to appoint a trustee for my child's plan", "Denise Lau", "We’ve escalated this to your assigned consultant for a follow-up."]
    ];

    return (
        <Box sx={{position: 'absolute', left: {xs: 2, md: 4, lg: 220}, top: 0, width:'80vw'}}>
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
                <Box sx={{ flex: 1, bgcolor: "#f7f8fa", p: 5, minHeight: "100vh", ml: '261px', mr: '-48px' }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                        Security & Privacy
                    </Typography>

                    {/* Data retention settings */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    Data retention settings
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#444" }}>
                                    Enabled: Your chatbot will have access to the full context of each client <br /> Disabled: Your chatbot has limited context to only the client's name
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Switch

                                    checked={dataRetention}
                                    onChange={e => setDataRetention(e.target.checked)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#4287f5',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: '#4287f5',
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Human-intervention log */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    Human-intervention log
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#444" }}>
                                    View bot-human interventions and the conversations all in one log
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: "#4d8af0",
                                        color: "#fff",
                                        px: 4,
                                        py: 1,
                                        fontWeight: 600,
                                        fontSize: 18,
                                        borderRadius: 3,
                                        boxShadow: 2,
                                        '&:hover': { bgcolor: "#2e6fd8" }
                                    }}
                                    onClick={() => setLogOpen(true)}
                                >
                                    View
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Sensitive Data Filter */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                            Sensitive Data Filter
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#444", mb: 2 }}>
                            Data types that should be masked when the chatbot is referring to it
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Keyword/phrase"
                                    placeholder="e.g. User address"
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ bgcolor: "#fff", borderRadius: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Data type"
                                    placeholder="e.g. Health Info"
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    sx={{ bgcolor: "#fff", borderRadius: 2 }}
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Masking rule"
                                    placeholder="e.g. Mask middle digits"
                                    value={rule}
                                    onChange={e => setRule(e.target.value)}
                                    sx={{ bgcolor: "#fff", borderRadius: 2 }}
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Example transformation"
                                    placeholder="e.g. 8394582940 to 8********0"
                                    value={example}
                                    onChange={e => setExample(e.target.value)}
                                    sx={{ bgcolor: "#fff", borderRadius: 2 }}
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: "#4d8af0",
                                    color: "#fff",
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    fontSize: 18,
                                    borderRadius: 3,
                                    boxShadow: 2,
                                    '&:hover': { bgcolor: "#2e6fd8" }
                                }}
                                onClick={handleAddFilter}
                                disabled={!keyword || !type || !rule || !example}
                            >
                                Add
                            </Button>
                        </Box>
                    </Paper>

                    {/* Sensitive Data Filters Table */}
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                            Your sensitive data filters
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#444", mb: 2 }}>
                            All the items you have added to your sensitive data filter
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: "bold" }}>Keyword/phrase</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Data type</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Masking rule</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Example Transformation</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filters.map((filter, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{ whiteSpace: "pre-line", wordBreak: "break-word", }}>{filter.keyword}</TableCell>
                                            <TableCell sx={{ whiteSpace: "pre-line", wordBreak: "break-word", }}>{filter.type}</TableCell>
                                            <TableCell sx={{ whiteSpace: "pre-line", wordBreak: "break-word", }}>{filter.rule}</TableCell>
                                            <TableCell sx={{ whiteSpace: "pre-line", wordBreak: "break-word", }}>{filter.example}</TableCell>
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
                                Are you sure you want to delete this filter?
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => {
                                        setFilters(filters.filter((_, i) => i !== deleteIdx));
                                        setDeleteModalOpen(false);
                                    }}
                                >
                                    Delete
                                </Button>
                                <Button variant="outlined" onClick={() => setDeleteModalOpen(false)}>
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    {/* Human-intervention log modal */}
                    <Modal open={logOpen} onClose={() => setLogOpen(false)}>
                        <Box sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "#fff",
                            p: 4,
                            borderRadius: 3,
                            boxShadow: 24,
                            minWidth: 900,
                            maxWidth: "95vw",
                            maxHeight: "90vh",
                            overflow: "auto",
                            '::-webkit-scrollbar': {
                                width: 8,
                                borderRadius: 8,
                                background: '#eee'
                            },
                            '::-webkit-scrollbar-thumb': {
                                background: '#ccc',
                                borderRadius: 8,
                            }
                        }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                    Human-intervention log
                                </Typography>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: "#4ecb8f",
                                        color: "#fff",
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        px: 3,
                                        mr: -50,
                                        '&:hover': { bgcolor: "#38b87c" }
                                    }}
                                    onClick={() => { /* download functionality */ }}
                                >
                                    Download
                                </Button>
                                <IconButton onClick={() => setLogOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Typography sx={{ mb: 2, color: "#444" }}>
                                Records of employees needing to intervene during client communication
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Time</TableCell>
                                            <TableCell>Question</TableCell>
                                            <TableCell sx={{ minWidth: 73 }}>Client name</TableCell>
                                            <TableCell>Response (if any)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {logRows.map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{row[0]}</TableCell>
                                                <TableCell>{row[1]}</TableCell>
                                                <TableCell>{row[2]}</TableCell>
                                                <TableCell
                                                    sx={
                                                        row[3].startsWith("Pending")
                                                            ? { color: "#e74c3c", fontWeight: 600 }
                                                            : {}
                                                    }
                                                >
                                                    {row[3]}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Modal>
                </Box>
            </Box>
        </Box>
    );
}
export default Security_privacy;