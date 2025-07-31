import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Button, Avatar, Divider
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
  }, []);





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
          variant="contained"
          sx={{ mt: 2, px: 4, py: 1.5, fontWeight: 600, fontSize: 18, borderRadius: 3 }}
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