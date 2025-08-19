import React, { useEffect, useState } from 'react';
import http from '../http';
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button, Avatar, Paper,
  Chip, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Divider, Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [waStatus, setWaStatus] = useState(null);
  const [loadingWa, setLoadingWa] = useState(false);

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
        // fetch WA status for this user
        setLoadingWa(true);
        try {
          const { data } = await http.get(`/api/wa/${u.data.id}/status`);
          if (mounted) setWaStatus(data);
        } catch (err) {
          // if 404 or other, interpret as not linked
          if (mounted) setWaStatus({ status: 'not_linked' });
        } finally {
          if (mounted) setLoadingWa(false);
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

  function renderWaCard() {
    if (loadingWa) return <CircularProgress size={24} />;

    const s = waStatus?.status || 'unknown';
    if (s === 'ready' || s === 'authenticated') {
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip icon={<CheckCircleOutlineIcon />} label="Connected" color="success" />
          <Typography variant="body2" color="text.secondary">WhatsApp client ready</Typography>
        </Stack>
      );
    }
    if (s === 'qr') {
      // server may include qr string at waStatus.qr
      return (
        <Box>
          <Chip icon={<QrCodeIcon />} label="Pair required" color="warning" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Scan the QR with your WhatsApp mobile app.
          </Typography>
          {/* if server provided a qr string you can render an image/QRCode here */}
          {waStatus?.qr && (
            <Box sx={{ mt: 2 }}>
              {/* Example: render QR as image or use qrcode.react */}
              {/* <QRCodeSVG value={waStatus.qr} /> */}
              <Typography variant="caption" color="text.secondary">QR available (render here)</Typography>
            </Box>
          )}
        </Box>
      );
    }
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip icon={<LinkIcon />} label="Not linked" />
        <Typography variant="body2" color="text.secondary">Start a WhatsApp session to link</Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: 24 }}>
                {user?.name ? user.name.split(' ').map(s => s[0]).slice(0,2).join('') : 'U'}
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
                    <Typography variant="subtitle2" color="text.secondary">WhatsApp</Typography>
                    <Box sx={{ mt: 1 }}>{renderWaCard()}</Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<PhoneIphoneIcon />} onClick={async () => {
                      if (!user?.id) return;
                      setLoadingWa(true);
                      try {
                        const res = await http.post(`/api/wa/${user.id}/start`);
                        setWaStatus(res);
                      } catch (err) { console.error(err); }
                      setLoadingWa(false);
                    }}>
                      Start / Resume
                    </Button>
                    <Button size="small" color="inherit" onClick={async () => {
                      if (!user?.id) return;
                      setLoadingWa(true);
                      try {
                        const res = await http.get(`/api/wa/${user.id}/status`);
                        setWaStatus(res.data);
                      } catch (err) {
                        setWaStatus({ status: 'not_linked' });
                      } finally { setLoadingWa(false); }
                    }}>
                      Refresh
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ p: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Quick Links</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                      <Button size="small" href="/config/tone_personality" variant="outlined">Chatbot Config</Button>
                      <Button size="small" href="/myclients" variant="outlined">My Clients</Button>
                      <Button size="small" href="/notifications" variant="outlined">Notifications</Button>
                      <Button size="small" href="/ConversationDb" variant="outlined">Analytics</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

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
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Button href="/review" startIcon={<LinkIcon />} size="small">Leave a review</Button>
                <Button href="/contact" startIcon={<LinkIcon />} size="small">Support Centre</Button>
                <Button href="/announcements" startIcon={<LinkIcon />} size="small">Announcements</Button>
              </Stack>
            </Card>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Tips</Typography>
              <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                <li><Typography variant="body2">Use dedicated device profiles for each user.</Typography></li>
                <li><Typography variant="body2">Keep connection active to avoid rescanning.</Typography></li>
              </ul>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}