import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, IconButton, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import http from '../../../../http';
import dayjs from 'dayjs';
import { AccessTime, Edit, Delete, Refresh } from '@mui/icons-material';
import isSameOrAfter from 'dayjs/plugin/isSameOrBefore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Alert() {
    const [alertList, setAlertList] = useState([]);
    const navigate = useNavigate();
    const [sortedby, changeSortedBy] = useState('send')

    const deleteAlert = (id) => {
        http.delete(`/alert/${id}`).then(() => {
            toast.success("Deleted expired alert");
            setAlertList(prev => prev.filter(alert => alert.id !== Number(id)));
        });
    };

    useEffect(() => {
        http.get("/alert")
            .then((res) => {
                const sort = res.data.sort((a, b) => {
                    if (sortedby == 'send') {
                        return new Date(a.sendDate) - new Date(b.sendDate);
                    } else {
                        return new Date(a.endDate) - new Date(b.endDate);
                    }
                });
                setAlertList(sort)
            })
            .catch((err) => console.error("Failed to fetch alert", err));
    }, [sortedby]);

    return (
        <Box>
            <ToastContainer />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} justifyContent='space-between'>
                <Box>
                    <Typography variant="h5">Alerts</Typography>
                    <Box display='flex' alignItems='center'>
                        <IconButton onClick={() => changeSortedBy(prev => prev === 'send' ? 'end' : 'send')}>
                            <Refresh />
                        </IconButton>
                        <Typography variant='body2' color='text.secondary'>
                            {`Sorted by ${sortedby === 'end' ? 'end date' : 'send date'}`}
                        </Typography>
                    </Box>
                </Box>
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
                                        Send: {dayjs(alert.sendDate).format('YYYY-MM-DD HH:mm')} <br />
                                        End: {dayjs(alert.endDate).format('YYYY-MM-DD HH:mm')}
                                    </Typography>
                                </Box>
                                {dayjs().isSameOrAfter(dayjs(alert.endDate)) && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }} color="text.secondary">
                                        <Typography variant='body2'>
                                            Alert Expired, Delete?
                                        </Typography>
                                        <IconButton onClick={() => deleteAlert(alert.id)}>
                                            <Delete color='error' />
                                        </IconButton>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Alert;