import { Link } from 'react-router-dom'
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import UserContext from '../../contexts/UserContext';
import React, { useEffect, useState, useContext } from 'react';

function Notifs() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} justifyContent='space-between'>
            <Typography variant="h5" sx={{ my: 2 }}>
                Notifications
            </Typography>
            <Link to='/AddNotif'>
                <Button color='primary' variant='contained'>
                    Add
                </Button>
            </Link>
        </Box>
    );
}

export default Notifs;