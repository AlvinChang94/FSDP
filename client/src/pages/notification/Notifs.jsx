import { Link } from 'react-router-dom'
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import UserContext from '../../contexts/UserContext';
import React, { useEffect, useState, useContext } from 'react';

function Notifs() {
    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Notifications
            </Typography>
        </Box>
    );
}

export default Notifs;