import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Button, Avatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import http from "../http";

function UserSettings() {
  // Example state (replace with real user data/fetch logic)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessDesc: "",
    profilePic: "",
  });
  const [password, setPassword] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  // Fetch user data on mount (pseudo code)
  useEffect(() => {
    // http.get("/api/user/profile").then(res => setProfile(res.data));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePicChange = (e) => {
    setProfilePicFile(e.target.files[0]);
    setProfile({ ...profile, profilePic: URL.createObjectURL(e.target.files[0]) });
  };

  const handleSave = async () => {
    try {
      await http.put('/user/profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        businessName: profile.businessName,
        businessDesc: profile.businessDesc,
        profilePic: profile.profilePic,
        password: password || undefined // Only send if changed
      });
      setSaveStatus("Settings saved!");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      setSaveStatus("Failed to save settings.");
      setTimeout(() => setSaveStatus(""), 2000);
    }
  };
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

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: -5, mb: 6, ml: -2 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
        User Settings
      </Typography>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Profile
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            src={profile.profilePic}
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
        />
        <TextField
          label="Email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Phone Number"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="New Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Business Context
        </Typography>
        <TextField
          label="Business Name"
          name="businessName"
          value={profile.businessName}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
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
        />
        <Button
      variant="outlined"
      sx={{ mb: 2, ml: 35.36 }}
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
        />
        <TextField
          label="Industry"
          name="industry"
          value={aiForm.industry}
          onChange={handleAIFormChange}
          fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="Target Audience"
          name="targetAudience"
          value={aiForm.targetAudience}
          onChange={handleAIFormChange}
          fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="Unique Selling Point"
          name="uniqueSellingPoint"
          value={aiForm.uniqueSellingPoint}
          onChange={handleAIFormChange}
          fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="Extra Notes (optional)"
          name="extraNotes"
          value={aiForm.extraNotes}
          onChange={handleAIFormChange}
          fullWidth sx={{ mb: 2 }}
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
    </Dialog> <br/>
        <Button
          variant="contained"
          sx={{px: 4, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3 }}
          onClick={handleSave}
        >
          Save Changes
        </Button>
        {saveStatus && (
          <Typography sx={{ color: "green", mt: 2 }}>{saveStatus}</Typography>
        )}
      </Paper>
    </Box>
  );
}

export default UserSettings;