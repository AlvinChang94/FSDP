import React, { useState } from "react";
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, TextField, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Link } from "react-router-dom";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
function Faq_Management() {
    const [faqs, setFaqs] = useState([
        { category: "Payments", question: "When is my premium due?", answer: "Your premium is due on the 1st of every month.", updated: "May 19th 2025" },
        { category: "Claims", question: "How do I file a claim?", answer: "You can file a claim via our portal.", updated: "April 20th 2025" },
        { category: "Account", question: "How can I update my contact details?", answer: "Go to your profile settings.", updated: "May 15th 2025" }
    ]);
    const [newQuestion, setNewQuestion] = useState("");
    const [newAnswer, setNewAnswer] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editQuestion, setEditQuestion] = useState("");
    const [editAnswer, setEditAnswer] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [hoveredEye, setHoveredEye] = useState(null);
    const [category, setCategory] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const categoryOptions = [
        "Payments",
        "Claims",
        "Account",
        "General",
        "Technical",
        "Policy",
        "Other"
    ];

    // Add FAQ
    const handleAddFaq = () => {
        if (newQuestion.trim() && newAnswer.trim()) {
            setFaqs([
                ...faqs,
                {
                    category,
                    question: newQuestion,
                    answer: newAnswer,
                    updated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                }
            ]);
            setNewQuestion("");
            setNewAnswer("");
        }
    };

    // Edit FAQ
    const handleEditFaq = (idx) => {
        setEditIndex(idx);
        setEditCategory(faqs[idx].category);
        setEditQuestion(faqs[idx].question);
        setEditAnswer(faqs[idx].answer);
        setEditModalOpen(true);
    };
    const handleEditSave = () => {
        setFaqs(faqs.map((faq, idx) =>
            idx === editIndex
                ? { ...faq, category: editCategory, question: editQuestion, answer: editAnswer, updated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
                : faq
        ));
        setEditModalOpen(false);
        setEditIndex(null);
    };

    // Delete FAQ
    const handleDeleteFaq = (idx) => {
        setDeleteIndex(idx);
        setDeleteModalOpen(true);
    };
    const handleDeleteConfirm = () => {
        setFaqs(faqs.filter((_, idx) => idx !== deleteIndex));
        setDeleteModalOpen(false);
        setDeleteIndex(null);
    };
    return (
        <Box sx={{ ml: -10, mt: -9, mb: -30 }}>
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
                <Box sx={{ flex: 1, bgcolor: "#f7f8fa", p: 5, minHeight: "100vh", mr: '-48px', ml: '261px' }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                        FAQ Management
                    </Typography>

                    {/* Add FAQ */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        {/* Category Dropdown */}
                        <FormControl fullWidth sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}>
                            <InputLabel id="faq-category-label">Category</InputLabel>
                            <Select
                                labelId="faq-category-label"
                                value={category}
                                label="Category"
                                onChange={e => setCategory(e.target.value)}
                            >
                                {categoryOptions.map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                            Add an FAQ question
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="e.g. What is your policy on premiums?"
                            value={newQuestion}
                            onChange={e => setNewQuestion(e.target.value)}
                            sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                            Add an FAQ answer
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="e.g. What is your policy on premiums?"
                            value={newAnswer}
                            onChange={e => setNewAnswer(e.target.value)}
                            sx={{ mb: 1, bgcolor: "#fff", borderRadius: 2 }}
                        />
                        <Typography variant="caption" sx={{ color: "#888", display: "block", mb: 2 }}>
                            *special requests to the AI can be used via encapsulating your message with "//" quotations
                        </Typography>
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
                                onClick={handleAddFaq}
                                disabled={!category || !newQuestion.trim() || !newAnswer.trim()}
                            >
                                Add
                            </Button>
                        </Box>
                    </Paper>

                    {/* FAQ Table */}
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                            Your current FAQs
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Question</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Last updated</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {faqs.map((faq, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{faq.category}</TableCell>
                                            <TableCell sx={{whiteSpace: "pre-line", wordBreak: "break-word",}}>{faq.question}</TableCell>
                                            <TableCell>{faq.updated}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEditFaq(idx)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton onClick={() => handleDeleteFaq(idx)}>
                                                    <DeleteIcon sx={{ color: "#e74c3c" }} />
                                                </IconButton>
                                                <IconButton
                                                    onMouseEnter={() => setHoveredEye(idx)}
                                                    onMouseLeave={() => setHoveredEye(null)}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                                {/* Eye hover info box */}
                                                {hoveredEye === idx && (
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            right: "9%",
                                                            bgcolor: "#fff",
                                                            color: "#222",
                                                            border: "1px solid #ccc",
                                                            borderRadius: "10px 1px 10px 10px",
                                                            p: 2,
                                                            mt: 0.2,
                                                            zIndex: 10,
                                                            minWidth: 200,
                                                            boxShadow: 3
                                                        }}
                                                    >
                                                        {/* Blank for now */}
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Edit Modal */}
                    <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                        <Box sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "#fff",
                            p: 4,
                            borderRadius: 2,
                            boxShadow: 24,
                            minWidth: 400,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            maxHeight: "80vh",
                            overflow: "auto"
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Edit FAQ</Typography>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="edit-faq-category-label">Category</InputLabel>
                                <Select
                                    labelId="edit-faq-category-label"
                                    value={editCategory}
                                    label="Category"
                                    onChange={e => setEditCategory(e.target.value)}
                                >
                                    {categoryOptions.map(opt => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Question"
                                value={editQuestion}
                                onChange={e => setEditQuestion(e.target.value)}
                                fullWidth
                                multiline
                                minRows={2}
                            />
                            <TextField
                                label="Answer"
                                value={editAnswer}
                                onChange={e => setEditAnswer(e.target.value)}
                                fullWidth
                                multiline
                                minRows={2}
                            />
                            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                                <Button
                                    variant="contained"
                                    onClick={handleEditSave}
                                    disabled={!editQuestion.trim() || !editAnswer.trim()}
                                >
                                    Save
                                </Button>
                                <Button variant="outlined" onClick={() => setEditModalOpen(false)}>
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    {/* Delete Modal */}
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
                                Are you sure you want to delete this FAQ?
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleDeleteConfirm}
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
export default Faq_Management;