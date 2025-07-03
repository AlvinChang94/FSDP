import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, IconButton, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import http from '../../../../http';
import dayjs from 'dayjs';
import { AccessTime, Edit } from '@mui/icons-material';

function Alert() {
    const [alertList, setAlertList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        http.get("/alert")
            .then((res) =>{
                const sort = res.data.sort((b, a) => new Date(b.sendDate) - new Date(a.sendDate));        
                setAlertList(sort)})
            .catch((err) => console.error("Failed to fetch alert", err));
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} justifyContent='space-between'>
                <Typography variant="h5">Alerts</Typography>
                <Box>
                    <Button sx={{ mr: 2 }} variant="contained" onClick={() => navigate("/AdminDash")} color='inherit'>
                        Back
                    </Button>
                    <Link to='/AddAlert'>
                        <Button color='secondary' variant='contained'>Add</Button>
                    </Link>
                </Box>
            </Box>

            <Grid container spacing={2}>
                {alertList.map((alert) => (
                    <Grid item xs={12} md={6} lg={4} key={alert.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                        {alert.title}
                                    </Typography>
                                    <Link to={`/EditAlert/${alert.id}`}>
                                        <IconButton color='success'>
                                            <Edit />
                                        </IconButton>
                                    </Link>
                                </Box>
                                <Typography sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                    {alert.message}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }} color="text.secondary">
                                    <AccessTime sx={{ mr: 1 }} />
                                    <Typography variant="body2">
                                        Send: {dayjs(alert.sendDate).format('YYYY-MM-DD HH:mm')}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
 
export default Alert;