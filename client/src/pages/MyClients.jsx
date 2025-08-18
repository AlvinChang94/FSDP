import React, { useEffect, useState, useRef } from 'react';
import http from '../http';
import { toast } from 'react-toastify';

import {
    Card,
    CardContent,
    Typography,
    Grid,
    IconButton,
    Modal,
    Box,
    TextField,
    Button,
    Stack,
    Tooltip,
    Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    minWidth: 600,
    maxWidth: 600,
    maxHeight: '60vh',
    overflowY: 'auto'
};
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import { Formik, Form, FieldArray, ErrorMessage } from 'formik';




export default function MyClients() {
    const editClientSchema = Yup.object().shape({
        contactName: Yup.string()
            .max(100, 'Contact name must be at most 100 characters')
            .required('Contact name is required'),

        // Array of custom fields
        customFields: Yup.array().of(
            Yup.object().shape({
                title: Yup.string()
                    .max(20, 'Custom title must be at most 20 characters')
                    .nullable(), // allow empty if optional
                value: Yup.string()
                    .max(100, 'Custom entry must be at most 100 characters')
                    .nullable()
            })
        ),

        clientsummary: Yup.string()
            .max(2000, 'Client summary must be at most 2000 characters')
            .nullable()

    });

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [viewing, setViewing] = useState(false);
    const [aiPreview, setAiPreview] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const toastCooldownRef = useRef(0);


    useEffect(() => {
        let mounted = true;
        async function fetchClients() {
            try {
                const { data } = await http.get('/api/clients');
                if (mounted) setClients(data || []);
            } catch (err) {
                console.error('Failed to load clients', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchClients();
        return () => { mounted = false; };
    }, []);

    const openEdit = (client) => {
        setEditing({ ...client }); // Copy all fields for dynamic edit
    };

    const saveEdit = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const { data } = await http.put(`/api/clients/${editing.id}`, editing);
            const refreshed = await http.get('/api/clients');
            setClients(refreshed.data);
            setEditing(null);

        } catch (err) {
            console.error('Save failed', err);
            alert('Save failed. See console.');
        } finally {
            setSaving(false);
        }
    };
    const handleGenerateSummary = async () => {
        try {
            setAiLoading(true);

            const res = await http.post(
                '/api/clients/generate-summary',
                { clientId: editing.id, userId: localStorage.getItem('userId') },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const data = res.data;
            console.log(data)
            if (!data ||
                (Array.isArray(data) && data.length === 0) ||
                (typeof data === 'object' && Object.keys(data).length === 0)
            ) {
                showToastWithCooldown('No client messages to retrieve');
            }


            // Update summary field directly
            // Store in aiOverview for Dialog preview
            setAiPreview(data.summary);

        } catch (err) {
            console.error('Error generating summary:', err);
        } finally {
            setAiLoading(false);
        }
    };

    const acceptAIPreview = () => {
        setEditing(prev => ({ ...prev, clientsummary: aiPreview }));
        setAiPreview('');
    };

    function markersToHtml(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // bold between **
            .replace(/\n/g, '<br>'); // convert line breaks
    }

    const showToastWithCooldown = (msg) => {
        const now = Date.now();
        if (now - toastCooldownRef.current > 5000) { // 5 seconds
            toast.error(msg);
            toastCooldownRef.current = now;
        }
    };

    return (
        <Box sx={{ ml: -25 }}>
            <Typography variant="h4" gutterBottom>
                <b>My clients</b>
            </Typography>

            {loading && <Typography>Loading clients...</Typography>}
            {!loading && clients.length === 0 && (
                <Typography>There are currently no clients. Whenever a client messages you on WhatsApp, they will be added here</Typography>
            )}

            <Grid container spacing={2} sx={{ mt: 1 }}>
                {clients.map(client => (
                    <Grid item xs={12} sm={6} md={4} key={client.id}>
                        <Card
                            sx={{ cursor: 'pointer', position: 'relative' }}
                            onClick={() => setViewing(client)}
                        >
                            <IconButton
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openEdit(client);
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold">
                                    {client.ClientUsers?.[0]?.contactName || client.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {client.phoneNumber}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Modal open={!!viewing} onClose={() => setViewing(null)}>
                <Box sx={modalStyle}>
                    {viewing && (
                        <Stack spacing={2}>
                            {/* Normal primitive fields only (skip id + any object/array) */}
                            {(viewing?.ClientUsers?.[0]?.contactName || viewing?.name) && (
                                <Box>
                                    <Typography variant="subtitle2">Contact Name</Typography>
                                    <Typography variant="body1" sx={{
                                        whiteSpace: 'pre-line',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}>
                                        {viewing.ClientUsers[0].contactName || viewing?.name}
                                    </Typography>
                                </Box>
                            )}
                            {viewing?.phoneNumber && (
                                <Box>
                                    <Typography variant="subtitle2">Phone Number</Typography>
                                    <Typography variant="body1" sx={{
                                        whiteSpace: 'pre-line',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}>
                                        {viewing.phoneNumber}
                                    </Typography>
                                </Box>
                            )}


                            {/* Custom fields from ClientUsers */}
                            {(viewing?.ClientUsers?.[0]?.customFields || []).map((field, idx) => (
                                <Box key={idx}>
                                    <Typography variant="subtitle2">{field.title || 'Untitled Field'}</Typography>
                                    <Typography variant="body1" sx={{
                                        whiteSpace: 'pre-line',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}>{field.value}</Typography>
                                </Box>
                            ))}

                            {/* Client Summary from ClientUsers */}
                            {viewing?.ClientUsers?.[0]?.clientSummary && (
                                <Box>
                                    <Typography variant="subtitle2">Client Summary</Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            whiteSpace: 'pre-line', // preserves line breaks
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word',
                                            minHeight: '9rem',      // ~6 lines
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(markersToHtml(viewing.ClientUsers[0].clientSummary || ""))
                                        }}

                                    >
                                    </Typography>
                                </Box>
                            )}

                            {/* Close button */}
                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button variant="contained" onClick={() => setViewing(null)}>Close</Button>
                            </Box>
                        </Stack>

                    )}
                </Box>
            </Modal>


            <Modal open={!!editing} onClose={() => setEditing(null)}>
                <Box
                    sx={modalStyle}
                    component="form"
                    onSubmit={async e => {
                        e.preventDefault();
                        try {
                            // abortEarly: false ensures we collect *all* validation errors
                            await editClientSchema.validate(editing, { abortEarly: false });

                            // If valid, proceed
                            saveEdit();

                        } catch (err) {
                            if (err.name === 'ValidationError') {
                                // Show every message as a toast
                                err.inner.forEach(error => {
                                    toast.error(error.message);
                                });
                            } else {
                                toast.error('Something went wrong while validating.');
                            }
                        }

                    }}
                >
                    {editing && (
                        <Stack spacing={2}>
                            {Object.entries(editing).map(([key, value]) => {
                                if (key === 'id' || key === 'clientsummary' || key === 'customFields' || key === 'phoneNumber' || typeof value === 'object' || key === 'name') return null;
                                return (
                                    <TextField
                                        label="Contact Name"
                                        value={editing.contactName || editing.name || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val.length === 100) {
                                                showToastWithCooldown('Maximum 100 characters reached');
                                            }
                                            setEditing(prev => ({ ...prev, contactName: e.target.value }))
                                        }}
                                        fullWidth
                                        margin="normal"
                                        inputProps={{ maxLength: 100 }}
                                    />

                                );
                            })}


                            {(editing?.customFields || []).map((field, idx) => (
                                <TextField
                                    key={idx}
                                    label={field.title || 'Untitled Field'}
                                    value={field.value}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val.length === 100) {
                                            showToastWithCooldown('Maximum 100 characters reached');
                                        }
                                        const newFields = [...(editing.customFields || [])];
                                        newFields[idx].value = e.target.value;
                                        setEditing({ ...editing, customFields: newFields });
                                    }}
                                    fullWidth
                                    margin="normal"
                                    inputProps={{ maxLength: 100 }}
                                />
                            ))}


                            {/* Client summary */}
                            <TextField
                                label="Client Summary"
                                value={editing.clientsummary || ''}
                                onChange={e => {
                                    const val = e.target.value;

                                    // If you want to warn at exactly 2000 chars:
                                    if (val.length === 2000) {
                                        showToastWithCooldown('Maximum 2000 characters reached');
                                    }
                                    setEditing(prev => ({ ...prev, clientsummary: e.target.value }))
                                }}
                                fullWidth
                                margin="normal"
                                multiline
                                minRows={6}
                                inputProps={{ maxLength: 2000 }}
                            />


                            {/* Bottom actions */}
                            <Box display="flex" flexDirection="column" gap={2} mt={2}>

                                {/* Generate summary */}
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Button
                                        variant="outlined"
                                        onClick={handleGenerateSummary}
                                        disabled={aiLoading}
                                    >

                                        {aiLoading ? 'Generating...' : 'Generate summary with overview'}
                                    </Button>
                                    <Tooltip title="This analyses the client's messages and auto-generates a summary.">
                                        <IconButton size="small">
                                            <Typography variant="body2" fontWeight="bold">?</Typography>
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                                {aiPreview && (
                                    <Paper sx={{ p: 2, mt: 2, bgcolor: '#f5f5f5' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>AI-Generated Summary:</Typography>
                                        <Typography dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(markersToHtml(aiPreview))
                                        }}
                                        ></Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                            <Button variant="contained" onClick={acceptAIPreview}>
                                                Accept
                                            </Button>
                                            <Button variant="outlined" color="secondary" onClick={() => setAiPreview('')}>
                                                Discard
                                            </Button>
                                        </Stack>
                                    </Paper>
                                )}


                                {/* Add custom field */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                    <Tooltip title="Add custom fields with a title and entry">
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            sx={{
                                                mt: -1,
                                                width: 36,
                                                height: 36,
                                                borderRadius: '50%',
                                                p: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden'
                                            }}
                                            TouchRippleProps={{ center: true }}
                                            onClick={() =>
                                                setEditing(prev => ({
                                                    ...prev,
                                                    customFields: [
                                                        ...(prev?.customFields || []),
                                                        { title: '', value: '' }
                                                    ]
                                                }))
                                            }
                                        >
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                {/* Edit existing custom fields */}
                                {(editing?.customFields || []).map((field, idx) => (
                                    <Stack key={idx} direction="row" spacing={1}>
                                        <TextField
                                            label="Field Title"
                                            value={field.title}
                                            onChange={e => {
                                                const val = e.target.value;

                                                // Show warning exactly at 100 chars
                                                if (val.length === 20) {
                                                    showToastWithCooldown('Maximum 20 characters reached');
                                                }
                                                const newFields = [...(editing.customFields || [])];
                                                newFields[idx].title = e.target.value;
                                                setEditing({ ...editing, customFields: newFields });
                                            }}
                                            fullWidth
                                            inputProps={{ maxLength: 20 }}
                                        />
                                        <TextField
                                            label="Field Entry"
                                            value={field.value}
                                            onChange={e => {
                                                const val = e.target.value;

                                                // Show warning exactly at 100 chars
                                                if (val.length === 100) {
                                                    showToastWithCooldown('Maximum 100 characters reached');
                                                }

                                                const newFields = [...(editing.customFields || [])];
                                                newFields[idx].value = e.target.value;
                                                setEditing({ ...editing, customFields: newFields });
                                            }}
                                            fullWidth
                                            inputProps={{ maxLength: 100 }}
                                        />
                                        <IconButton
                                            color="error"
                                            onClick={() => {
                                                const newFields = [...(editing.customFields || [])];
                                                newFields.splice(idx, 1);
                                                setEditing({ ...editing, customFields: newFields });
                                            }}
                                        >
                                            ✕
                                        </IconButton>
                                    </Stack>
                                ))}

                                {/* Cancel / Save buttons */}
                                <Box display="flex" gap={1} justifyContent="flex-end">
                                    <Button onClick={() => setEditing(null)}>Cancel</Button>
                                    <Button type="submit" variant="contained" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                </Box>

                            </Box>
                        </Stack>
                    )}
                </Box>
            </Modal>
        </Box>
    );
}