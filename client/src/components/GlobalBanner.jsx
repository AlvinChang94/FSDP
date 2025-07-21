import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import http from '../http';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const DISMISSED_ALERTS_KEY = 'dismissedAlerts';

function GlobalBanner() {
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [dismissedIds, setDismissedIds] = useState(() => {
        const saved = localStorage.getItem(DISMISSED_ALERTS_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        http.get("/alert")
            .then((res) => {
                const now = dayjs();
                const active = res.data.filter(alert => {
                    const send = dayjs(alert.sendDate);
                    const end = dayjs(alert.endDate);
                    if (!send.isValid()) return false;
                    if (!end.isValid()) return now.isSameOrAfter(send);
                    return now.isSameOrAfter(send) && now.isSameOrBefore(end);
                });
                setActiveAlerts(active);
            })
            .catch(err => console.error("Failed to fetch alert", err));
    }, []);

    const handleDismiss = (id) => {
        setDismissedIds(prev => {
            const updated = [...prev, id];
            localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const visibleAlerts = activeAlerts.filter(alert => !dismissedIds.includes(alert.id));

    if (visibleAlerts.length === 0) return null;

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
          }}
        >
            {visibleAlerts.map((alert) => (
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
