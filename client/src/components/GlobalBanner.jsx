import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import http from '../http';

function GlobalBanner() {
    const [activeAlerts, setActiveAlerts] = useState([]);

    useEffect(() => {
        http.get("/alert/active")
            .then(res => setActiveAlerts(res.data))
            .catch(err => console.error("Failed to fetch alerts", err));
    }, []);

    const handleDismiss = async (id) => {
        try {
            await http.post(`/alert/${id}/dismiss`);
            setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
        } catch (err) {
            console.error('Failed to dismiss alert', err);
        }
    };

    if (activeAlerts.length === 0) return null;

    return (
        <Box
            sx={{
                backgroundColor: 'rgba(255, 236, 179, 0.8)',
                backdropFilter: 'blur(5px)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1300,
                padding: 2,
                maxHeight: '6em',
                overflowY: 'auto', 
                scrollbarWidth: 'thin', 
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: '3px' }
            }}
        >
            {activeAlerts.map((alert) => (
                <Box
                    key={alert.id}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
                >
                    <Typography>
                        <strong>{alert.title}:</strong> {alert.message}
                    </Typography>
                    <IconButton onClick={() => handleDismiss(alert.id)} size="small" aria-label="close">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            ))}
        </Box>
    );
}

export default GlobalBanner;
