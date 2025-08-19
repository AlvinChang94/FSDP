import React, { useEffect, useState, useRef } from 'react';
import http from '../http';
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button, Avatar, Paper,
  Chip, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Divider, Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { toast } from 'react-toastify';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import placeholderPfp from '../assets/placeholderpfp.png';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [waStatus, setWaStatus] = useState(null);
  const qrToastShownRef = useRef(false);
  const connectingPollRef = useRef(null);
  const [waActionLoading, setWaActionLoading] = useState(false);

  // New: derived UI state
  const [showWaTutorial, setShowWaTutorial] = useState(false);


  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoadingUser(true);
      try {
        const u = await http.get('/user/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (!mounted) return;
        setUser(u.data);
        try {
          const { data } = await http.get(`/api/wa/${u.data.id}/status`);
          if (mounted) setWaStatus(data);
        } catch (err) {
          // if 404 or other, interpret as not linked
          if (mounted) setWaStatus({ status: 'not_linked' });
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    const connected = waStatus?.status === 'ready' || waStatus?.status === 'authenticated';
    setShowWaTutorial(!connected);
  }, [waStatus]);

  const startAndPoll = async () => {
    if (!user?.id) return;

    setWaActionLoading(true);

    try {
      await http.post(`/api/wa/${user.id}/start`);

      const pollOnce = async () => {
        const res = await http.get(`/api/wa/${user.id}/status`);
        setWaStatus(res.data);

        if (
          res.data.status === 'ready' ||
          res.data.status === 'authenticated' ||
          res.data.status === 'not_linked'
        ) {
          setWaActionLoading(false);
          clearInterval(connectingPollRef.current);
          connectingPollRef.current = null;
        }
      };

      await pollOnce();
      if (!connectingPollRef.current) {
        connectingPollRef.current = setInterval(pollOnce, 1500);
      }
    } catch (err) {
      setWaActionLoading(false);
      setWaStatus({ status: 'not_linked' });
    }
  };


  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (connectingPollRef.current) clearInterval(connectingPollRef.current);
    };
  }, []);
  const handleDeLink = async () => {
    if (!user?.id) return;
    setWaActionLoading(true);
    try {
      await http.post(`/api/wa/${user.id}/delink`);
      setWaStatus({ status: 'not_linked' });
    } finally {
      setWaActionLoading(false);
    }
  };
  const refreshStatus = async () => {
    if (!user?.id) return;
    try {
      const res = await http.get(`/api/wa/${user.id}/status`);
      setWaStatus(res.data);
      // We don't touch waActionLoading here, because it's only for start/stop flows
    } catch (err) {
      setWaStatus({ status: 'not_linked' });
    }
  };


  function renderWaCard() {
    if (!waStatus) return null;

    const { status } = waStatus;
    const connected = status === 'ready' || status === 'authenticated';

    // One‑time toast trigger for QR status
    if (status === 'qr' && !qrToastShownRef.current) {
      toast.error('WhatsApp not linked. Go to User Settings to link your device.')
      qrToastShownRef.current = true;
    }

    if (connected) {
      return (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: 2, mb: 0.5 }}
        >
          <CheckCircleOutlineIcon color="success" />
          <Typography variant="body2" color="text.secondary">
            Connected
          </Typography>
        </Stack>
      );
    }

    if (status === 'qr') {
      return (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: 2, mb: 0.5 }}
        >
          <LinkOffIcon color="error" />
          <Typography variant="body2" color="text.secondary">
            QR code generated — link your device in User Settings
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mt: 2, mb: 0.5 }}
      >
        <LinkOffIcon color="error" />
        <Typography variant="body2" color="text.secondary">
          Not linked
        </Typography>
      </Stack>
    );
  }



  return (
    <Box>
      {loadingUser && <CircularProgress />}
      {!loadingUser && user && localStorage.getItem('userId') && (
        <>
          <Box sx={{ p: 4, ml: -4, mt: -6 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      alt="Profile Picture"
                      src={`http://localhost:3001/user/profilepic/${localStorage.getItem('userId')}?t=${Date.now()}`}
                      sx={{ width: 40, height: 40, mr: 2, border: '2px solid black' }}
                    > <img
                        src={placeholderPfp}
                        alt="Placeholder"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        Welcome{user?.name ? `, ${user.name}` : ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage your workspace, clients and chatbot settings from here.
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary">WhatsApp Pairing Status</Typography>
                          <Box sx={{ mt: 1 }}>{renderWaCard()}</Box>
                        </CardContent>
                        <CardActions>
                          {waStatus?.status === 'ready' || waStatus?.status === 'authenticated' ? (
                            <Button size="small" color="error" onClick={handleDeLink}>
                              De‑link
                            </Button>
                          ) : waActionLoading ? (
                            <Button size="small" disabled>
                              <CircularProgress
                                size={16}
                                color="inherit"
                                style={{ marginRight: 8 }}
                              />
                              Connecting…
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="small"
                                startIcon={<PhoneIphoneIcon />}
                                onClick={startAndPoll}
                              >
                                Start / Resume
                              </Button>

                              <Button
                                size="small"
                                color="inherit"
                                onClick={refreshStatus}
                              >
                                Refresh
                              </Button>
                            </>
                          )}
                        </CardActions>



                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent sx={{ mb: 0.05 }}>
                          <Typography variant="subtitle2" color="text.secondary">Quick Links</Typography>
                          <Grid container spacing={1} sx={{ mt: 0.5 }}>
                            {[
                              { label: 'Bot config', href: '/config/tone_personality' },
                              { label: 'My Clients', href: '/myclients' },
                              { label: 'Notifications', href: '/notifications' },
                              { label: 'Analytics', href: '/ConversationDb' }
                            ].map(btn => (
                              <Grid item key={btn.label} sm={6}>
                                <Button fullWidth size="small" variant="outlined" href={btn.href} sx={{ minWidth: 120 }}>
                                  {btn.label}
                                </Button>
                              </Grid>
                            ))}
                          </Grid>

                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>

                {showWaTutorial && (
                  <Box sx={{ mt: 3 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">WhatsApp Setup Tutorial</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Follow the steps to pair and configure WhatsApp for this account.
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                          <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle1">1) Start a session</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                Click "Start / Resume" above to start a session. The server will create an isolated WA profile for your account.
                              </Typography>
                              <Typography variant="caption" color="text.secondary">Suggested image: a screenshot of the "Start" button or server logs.</Typography>
                            </AccordionDetails>
                          </Accordion>

                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle1">2) Scan the QR</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                If the card shows "Pair required", scan the QR code with your WhatsApp mobile app: Settings → Linked devices → Link a device.
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                Suggested images: phone scanning QR, and a sample QR image. (I can provide these)
                              </Typography>
                              <Button variant="outlined" startIcon={<QrCodeIcon />}>Open QR preview</Button>
                            </AccordionDetails>
                          </Accordion>

                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle1">3) Confirm connection & test</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body2">
                                Once connected the status will show "Connected". Send a test message to confirm flow to the chatbot.
                              </Typography>
                              <Typography variant="caption" color="text.secondary">Suggested image: sample message thread.</Typography>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Account</Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>{user?.name || 'Unknown user'}</Typography>
                    <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button size="small" variant="contained" href="/settings">Settings</Button>
                      <Button size="small" sx={{ ml: 1 }} onClick={() => {
                        localStorage.removeItem('accessToken'); window.location.reload();
                      }}>Sign out</Button>
                    </Box>
                  </Card>

                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Resources</Typography>
                    <Stack
                      spacing={0.3}
                      sx={{ mt: 1, alignItems: 'center' }} // centers the whole button group
                    >
                      {[
                        { label: 'Leave a review', href: '/review' },
                        { label: 'Support Centre', href: '/contact' },
                        { label: 'Announcements', href: '/announcements' }
                      ].map(btn => (
                        <Button
                          key={btn.label}
                          href={btn.href}
                          startIcon={<LinkIcon />}
                          size="small"
                          variant="text"
                          sx={{
                            width: 200,              // fixed width keeps icons in the same X position
                            justifyContent: 'flex-start' // icon + text hug the left edge of the button
                          }}
                        >
                          {btn.label}
                        </Button>
                      ))}
                    </Stack>



                  </Card>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Tips</Typography>
                    <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                      <li>
                        <Typography variant="body2">
                          QueryEase maintains the WhatsApp connection in its servers to avoid rescanning
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                          If you want to unlink the WhatsApp connection, go to 'Linked Devices' on your device and remove the connection
                        </Typography>
                      </li>
                    </ul>
                  </Paper>

                </Stack>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      {!localStorage.getItem('userId') && (
        <Typography>No user found or not signed in.</Typography>
      )}
    </Box>
  );
}