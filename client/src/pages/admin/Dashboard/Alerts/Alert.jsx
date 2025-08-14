import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, IconButton, Button, Input } from '@mui/material';
import React, { useEffect, useState } from 'react';
import http from '../../../../http';
import dayjs from 'dayjs';
import { AccessTime, Edit, Delete, Refresh, Clear, Search } from '@mui/icons-material';
import isSameOrAfter from 'dayjs/plugin/isSameOrBefore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Alert() {
    const [alertList, setAlertList] = useState([]);
    const [filteredAlerts, setFilteredAlerts] = useState([]);
    const navigate = useNavigate();
    const [sortedby, changeSortedBy] = useState('send')
    const [search, setSearch] = useState('')

    // Check if alert between time periods
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };
    const onSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            searchAlerts();
        }
    };
    const deleteAlert = (id) => {
        http.delete(`/alert/${id}`).then(() => {
            toast.success("Deleted expired alert");
            setAlertList(prev => prev.filter(alert => alert.id !== Number(id)));
        });
    };
    const searchAlerts = () => {
        http.get(`/Alert?search=${search}`).then((res) => {
            setAlertList(sortAlerts(res.data));
        });
    };
    const onClickClear = () => {
        setSearch('');
        getAlerts();
    };
    const onClickSearch = () => {
        searchAlerts();
    }

    const sortAlerts = (alerts) => {
        return alerts.sort((a, b) => {
            if (sortedby === 'send') {
                return new Date(a.sendDate) - new Date(b.sendDate);
            } else {
                return new Date(a.endDate) - new Date(b.endDate);
            }
        });
    };

    useEffect(() => {
        http.get("/alert")
            .then((res) => {
                setAlertList(sortAlerts(res.data));
            })
            .catch((err) => console.error("Failed to fetch alert", err));
    }, [sortedby]);

    const filterByDateRange = () => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates');
            return;
        }

        const rangeStart = dayjs(startDate);
        const rangeEnd = dayjs(endDate);

        const activeAlerts = alertList.filter(alert => {
            const alertStart = dayjs(alert.sendDate);
            const alertEnd = dayjs(alert.endDate);
            return alertEnd.isAfter(rangeStart) && alertStart.isBefore(rangeEnd);
        });

        const activeIds = activeAlerts.map(a => a.id);
        setFilteredAlerts(activeIds);

        if (activeAlerts.length === 0) {
            toast.info('No active alerts in the selected period');
        } else {
            toast.success(`${activeAlerts.length} alert(s) active in the selected period`);
        }
    };

    return (
        <Box>
            <ToastContainer />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} justifyContent='space-between'>
                <Box>
                    <Typography variant="h5">Alerts</Typography>
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
            <Box display='flex' alignItems='center'>
                <Input value={search} placeholder="Search"
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown} />
                <IconButton color="primary"
                    onClick={onClickSearch}>
                    <Search />
                </IconButton>
                <IconButton color="primary"
                    onClick={onClickClear}>
                    <Clear />
                </IconButton>
                <IconButton onClick={() => { changeSortedBy(prev => prev === 'send' ? 'end' : 'send'); setSearch('') }}>
                    <Refresh />
                </IconButton>
                <Typography variant='body2' color='text.secondary'>
                    {`Sorted by ${sortedby === 'end' ? 'end date' : 'send date'}`}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={filterByDateRange}
                >
                    Check Alerts
                </Button>
            </Box>

            <Grid container spacing={2}>
                {alertList.map((alert) => {
                    const isActive = filteredAlerts.includes(alert.id);
                    return (
                        <Grid item xs={12} md={6} lg={4} key={alert.id}>
                            <Card sx={{ border: isActive ? '2px solid #4caf50' : 'none'}}>
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
                    );
                })}
            </Grid>
        </Box>
    );
}

export default Alert;