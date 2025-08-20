import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Box, Typography, Paper, TextField, Button, Avatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, List, ListItem, ListItemIcon, ListItemText, Stack, Tooltip
} from "@mui/material";
import AttachmentIcon from "@mui/icons-material/Attachment";
import CloseIcon from "@mui/icons-material/Close";
import { QRCodeSVG } from 'qrcode.react';
import http from "../http";
import UserContext from "../contexts/UserContext";
import * as Yup from 'yup';
import { toast } from 'react-toastify';
const phoneRegex = /^[0-9+\-#*]+$/;
const passwordRegex = /^(?=.*[0-9]).{8,}$/;
export const userSettingsSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Full Name must be at least 3 characters')
    .max(50, 'Full Name must be at most 50 characters')
    .required('Full Name is required'),

  email: Yup.string()
    .max(50, 'Email must be at most 50 characters')
    .email('Invalid email format')
    .required('Email is required'),

  phone: Yup.string()
    .nullable()
    .transform((value, originalValue) => {
      // Convert empty string to null so nullable() works
      return originalValue === '' ? null : value;
    })

    .min(8, 'Phone Number must be at least 8 characters')
    .max(20, 'Phone Number must be at most 20 characters')
    .matches(phoneRegex, 'Phone Number can only contain 0-9, +, -, *, #'),

  businessName: Yup.string()
    .max(50, 'Business Name must be at most 50 characters')
    .nullable(),

  businessDesc: Yup.string()
    .max(2000, 'Business Overview must be at most 2000 characters')
    .nullable(),
  currentPassword: Yup.string()
    .matches(passwordRegex, 'Current password must be at least 8 characters and contain at least 1 number')
    .nullable(),

  newPassword: Yup.string()
    .matches(passwordRegex, 'New password must be at least 8 characters and contain at least 1 number')
    .nullable(),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .nullable()

});


function UserSettings() {
  const toastCooldownRef = useRef(0);
  const showErrorWithCooldown = (msg) => {
    const now = Date.now();
    if (now - toastCooldownRef.current > 5000) { // 5 seconds
      toast.error(msg);
      toastCooldownRef.current = now;
    }
  };
  const showSuccessWithCooldown = (msg) => {
    const now = Date.now();
    if (now - toastCooldownRef.current > 5000) { // 5 seconds
      toast.success(msg)
      toastCooldownRef.current = now;
    }
  };

  // Example state (replace with real user data/fetch logic)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessDesc: "",
    profilePic: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [files, setFiles] = useState([]);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const { setUser } = useContext(UserContext);


  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Keep File for uploading
    setProfile(prev => ({
      ...prev,
      profilePic: file,
      profilePicPreview: URL.createObjectURL(file) // extra state for preview
    }));

    setProfilePicFile(file); // if you also track it separately
  };


  const handleSave = async () => {
    try {
      await userSettingsSchema.validate(profile, { abortEarly: false });
      if (newPassword || confirmPassword || currentPassword) {
        await userSettingsSchema.validate(
          {
            ...profile,
            currentPassword,
            newPassword,
            confirmPassword
          },
          { abortEarly: false }
        );

        if (!currentPassword) {
          showErrorWithCooldown("Please enter your current password.");
          return;
        }
        if (newPassword !== confirmPassword) {
          showErrorWithCooldown("New passwords do not match.");
          return;
        }
        // Check current password with backend
        const verifyRes = await http.post("/user/verify-password", {
          currentPassword,
        });
        if (!verifyRes.data.valid) {
          showErrorWithCooldown("Current password is incorrect.");
          return;
        }
      }
      const fd = new FormData();
      fd.append('name', profile.name);
      fd.append('email', profile.email);
      fd.append('phone', profile.phone);
      fd.append('businessName', profile.businessName);
      fd.append('businessDesc', profile.businessDesc);

      if (profile.profilePic instanceof File) {
        fd.append('profilePic', profile.profilePic);
      }
      if (newPassword) fd.append('newPassword', newPassword);
      await http.put('/user/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const res = await http.get('/user/auth1');
      setUser(res.data.user);
      showSuccessWithCooldown('Settings saved!');
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach(e => showErrorWithCooldown(e.message));
      } else {
        showErrorWithCooldown(`Something went wrong while saving. ${err}`);
      }

    }
  };
  useEffect(() => {
    http.get("/user/me")
      .then(res => {
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone_num || "",
          businessName: res.data.business_name || "",
          businessDesc: res.data.business_overview || "",
          profilePic: "", // leave empty unless you manage profilePic separately
        });
      })
      .catch(err => {
        console.error("Failed to fetch user profile:", err);
      });
    http.get('/user/policy-files')
      .then(res => setFiles(res.data))
      .catch(err => console.error('Failed to fetch files', err));
  }, []);


  const [openAIOverview, setOpenAIOverview] = useState(false);
  const [aiForm, setAIForm] = useState({
    businessName: profile.businessName,
    industry: "",
    targetAudience: "",
    uniqueSellingPoint: "",
    extraNotes: ""
  });
  const [aiOverview, setAIOverview] = useState("");
  const [aiLoading, setAILoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);


  const handleAIFormChange = (e) => {
    setAIForm({ ...aiForm, [e.target.name]: e.target.value });
  };

  const handleAIGenerate = async () => {
    setAILoading(true);
    try {
      const res = await http.post('/user/generate-overview', aiForm);
      setAIOverview(res.data.overview);
    } catch {
      setAIOverview("Failed to generate overview.");
    }
    setAILoading(false);
  };

  const handleAIAccept = () => {
    setProfile({ ...profile, businessDesc: aiOverview });
    setOpenAIOverview(false);
    setAIOverview("");
  };

  const handleDelete = (filename) => {
    http.delete(`/user/policy-files/${encodeURIComponent(filename)}`).then(() => {
      setFiles(prev => prev.filter(f => f !== filename));
    });
  };


  const handleFileUpload = async e => {
    const formData = new FormData();
    for (let file of e.target.files) {
      formData.append('files', file);
    }

    try {
      setIsUploading(true);
      await http.post('user/upload-policy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Now fetch the updated list
      const res = await http.get('/user/policy-files');
      setFiles(res.data);
    } catch (err) {
      if (err.response?.data?.message) {
        showErrorWithCooldown(err.response.data.message);
      } else {
        showErrorWithCooldown('Error uploading or fetching files', err);
      }
    } finally {
      setIsUploading(false);
    }

  };

  //Whatsapp linking
  const [status, setStatus] = useState('init');
  const [qr, setQr] = useState(null);
  const [userName, setName] = useState('');
  const [userId, setId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const pollerRef = useRef(null);

  // Centralized update
  const updateStatusAndQr = (data) => {
    setStatus(data.status);

    if (['ready', 'delinked', 'auth_failure'].includes(data.status)) {
      setQr(null);
    } else {
      // only overwrite if server sends a qr field
      if ('qr' in data) {
        setQr(data.qr || null);
      }
    }
  };

  const fetchStatusOnce = async () => {
    try {
      const { data } = await http.get(`/api/wa/${userId}/status`);
      console.log(data.qr)
      updateStatusAndQr(data);

      // stop polling on terminal statuses
      if (['ready', 'delinked', 'auth_failure'].includes(data.status)) {
        if (pollerRef.current) clearInterval(pollerRef.current);
        pollerRef.current = null;
        setIsConnecting(false);
        return true;
      }
    } catch (err) {
      console.error('Error fetching WA status:', err);
    }
    return false;
  };

  const poll = async () => {
    if (pollerRef.current) clearInterval(pollerRef.current);
    const done = await fetchStatusOnce();
    if (done) return;

    pollerRef.current = setInterval(fetchStatusOnce, 1500);
  };

  const start = async () => {
    await http.post(`/api/wa/${userId}/start`);
    await fetchStatusOnce(); // instant update
    poll();
  };

  const logout = async () => {
    await http.post(`/api/wa/${userId}/delink`);
    setStatus('init');
    setQr(null);
  };

  const handleWhatsAppConnect = async () => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
    setIsConnecting(true);
    await start();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, []);

  // Fetch user + initial status
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await http.get('/user/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setName(res.data.name || '');
        setId(res.data.id || '');
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    poll()
  }, [userId]);

  return (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', width: '100%' }}>

      <Box sx={{ width: '650px' }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          User Settings
        </Typography>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Profile
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              src={profile.profilePicPreview || `http://localhost:3001/user/profilepic/${localStorage.getItem('userId')}`}
              sx={{ width: 72, height: 72, mr: 3 }}
            />
            <Button variant="outlined" component="label">
              Upload Picture
              <input type="file" accept="image/*" hidden onChange={handlePicChange} />
            </Button>
          </Box>
          <TextField
            label="Full Name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            label="Email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={profile.phone}
            onChange={e => {
              // Remove disallowed characters live
              const val = e.target.value.replace(/[^0-9+\-#*]/g, '');
              setProfile(prev => ({ ...prev, phone: val }));
            }}

            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 20 }}
          />
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Change Password
          </Typography>
          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 3 }} />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Business context
            </Typography>

            <Tooltip title="Provide your chatbot with some context to establish a foundation">
              <IconButton size="small">
                <Typography variant="body2" fontWeight="bold">?</Typography>
              </IconButton>
            </Tooltip>
          </Stack>
          <TextField
            label="Business Name"
            name="businessName"
            value={profile.businessName}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            label="Business Overview"
            name="businessDesc"
            value={profile.businessDesc}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
            placeholder="Describe what your business does, your target audience, and any important details."
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 2000 }}
          />
          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() => setOpenAIOverview(true)}
          >
            Generate Overview with AI
          </Button>

          <Dialog open={openAIOverview} onClose={() => setOpenAIOverview(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Generate Business Overview with AI</DialogTitle>
            <DialogContent>
              <TextField
                label="Business Name"
                name="businessName"
                value={aiForm.businessName}
                onChange={handleAIFormChange}
                fullWidth sx={{ mb: 2, mt: 1 }}
                inputProps={{ maxLength: 70 }}
              />
              <TextField
                label="Industry"
                name="industry"
                value={aiForm.industry}
                onChange={handleAIFormChange}
                fullWidth sx={{ mb: 2 }}
                inputProps={{ maxLength: 70 }}
              />
              <TextField
                label="Target Audience"
                name="targetAudience"
                value={aiForm.targetAudience}
                onChange={handleAIFormChange}
                fullWidth sx={{ mb: 2 }}
                inputProps={{ maxLength: 70 }}
              />
              <TextField
                label="Unique Selling Point"
                name="uniqueSellingPoint"
                value={aiForm.uniqueSellingPoint}
                onChange={handleAIFormChange}
                fullWidth sx={{ mb: 2 }}
                inputProps={{ maxLength: 70 }}
              />
              <TextField
                label="Extra Notes (optional)"
                name="extraNotes"
                value={aiForm.extraNotes}
                onChange={handleAIFormChange}
                fullWidth sx={{ mb: 2 }}
                inputProps={{ maxLength: 100 }}
              />
              <Button
                variant="contained"
                onClick={handleAIGenerate}
                disabled={aiLoading}
                sx={{ mt: 1 }}
              >
                {aiLoading ? "Generating..." : "Generate"}
              </Button>
              {aiOverview && (
                <Paper sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5" }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>AI-Generated Overview:</Typography>
                  <Typography>{aiOverview}</Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleAIAccept}
                  >
                    Use this Overview
                  </Button>
                </Paper>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAIOverview(false)}>Close</Button>
            </DialogActions>
          </Dialog> <br />
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Company Policy Documents
            </Typography>

            <Tooltip title="Chatbot ingests your company policy PDF files to answer client queries on them. Please be patient as it may take a few minutes for the chatbot to ingest your documents">
              <IconButton size="small">
                <Typography variant="body2" fontWeight="bold">?</Typography>
              </IconButton>
            </Tooltip>
          </Stack>
          <Button variant="outlined" component="label" disabled={isUploading}>
            {isUploading ? 'Uploading documents…' : 'Upload documents'}

            <input
              type="file"
              multiple
              id="file-upload"
              accept=".pdf"
              hidden
              onChange={handleFileUpload}

            />
          </Button>

          <div>
            <List>
              {files.map(filename => (
                <ListItem
                  key={filename}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDelete(filename)} sx={{ color: "red" }}>
                      <CloseIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <AttachmentIcon />
                  </ListItemIcon>
                  <ListItemText primary={filename} />
                </ListItem>
              ))}
            </List>
          </div>

          <br />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3, mt: 6 }}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      </Box>
      <Box sx={{ width: '300px' }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 7 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
            WhatsApp Linking {userName && `for ${userName}`}
          </Typography>


          {status === 'init' && (
            <Button
              variant="contained"
              sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3, mt: 1 }}
              onClick={handleWhatsAppConnect}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting to WhatsApp..." : "Connect WhatsApp"}
            </Button>
          )}



          {status === 'qr' && qr && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <QRCodeSVG value={qr} size={200} />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                Scan this QR code with WhatsApp
              </Typography>
            </Box>

          )}

          {status === 'ready' && (
            <Button
              variant="contained"
              color="error"
              sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3, mt: 1 }}
              onClick={logout}
              disabled={isConnecting}
            >
              Delink WhatsApp
            </Button>
          )}


          {status === 'delinked' && (
            <Button
              variant="contained"
              sx={{ px: 4, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3, mt: 2 }}
              onClick={handleWhatsAppConnect}
              disabled={isConnecting}
            >
              {isConnecting ? "Reconnecting to WhatsApp..." : "Reconnect WhatsApp"}
            </Button>
          )}
        </Paper>
      </Box>

    </Box>
  );
}

export default UserSettings;