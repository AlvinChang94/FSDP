import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, Checkbox, FormControlLabel, FormGroup, Radio, RadioGroup, TextField, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Stack, IconButton } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import http from "../../http";
import { toast } from 'react-toastify';

const configNav = [
  {
    label: "Tone & Personality",
    icon: <PsychologyIcon />,
    path: "/config/tone_personality"
  },
  {
    label: "FAQ Management",
    icon: <QuestionMarkIcon />,
    path: "/config/faq_management"
  },
  //{
  //    label: "Security & Privacy",
  //    icon: <SecurityIcon />,
  //    path: "/config/security_privacy"
  //},
  {
    label: "Intervention Threshold",
    icon: <EmojiEmotionsIcon />,
    path: "/config/intervention_threshold"
  }
];

function TonePersonality() {
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
  const userId = localStorage.getItem('userId');
  const location = useLocation();
  const [tones, setTones] = useState({
    Professional: false,
    Formal: false,
    Friendly: false,
    Empathetic: false
  });
  const [emojiUsage, setEmojiUsage] = useState("None");
  const [signature, setSignature] = useState("");

  const handleToneChange = (event) => {
    setTones({ ...tones, [event.target.name]: event.target.checked });
  };
  const handleSave = async () => {
    try {
      await http.post('/api/config/tonesettingssave', {
        userId,
        tone: Object.keys(tones).filter(t => tones[t]).join(', '),
        emojiUsage,
        signature
      });
      showSuccessWithCooldown('Settings saved!')
    } catch (err) {
      showErrorWithCooldown('Failed to save')
    }
  };
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await http.get(`/api/config/tonesettings/${userId}`);
      if (res.data) {
        // Example: setTones, setEmojiUsage, setSignature
        if (res.data.tone) {
          const toneArr = res.data.tone.split(', ');
          setTones(prev => {
            const newTones = { ...prev };
            Object.keys(newTones).forEach(t => newTones[t] = toneArr.includes(t));
            return newTones;
          });
        }
        if (res.data.emojiUsage) setEmojiUsage(res.data.emojiUsage);
        if (res.data.signature) setSignature(res.data.signature);
      }
    };
    fetchSettings();
  }, [userId]);

  return (
    <Box sx={{ position: 'absolute', left: { xs: 2, md: 4, lg: 220 }, top: 0, width: '80vw' }}>
      <Box sx={{ display: "flex", bgcolor: "#181617" }}>
        {/* Secondary Nav Bar */}
        <Box sx={{
          width: 261,
          bgcolor: "#181f2a",
          color: "#fff",
          pt: 4,
          px: 0,
          borderRight: "1px solid #222",
          height: "100vh",
          position: "fixed",
        }}>
          <Typography sx={{ color: "#bfcfff", fontWeight: 700, fontSize: 18, pl: 4, mb: 2 }}>
            Chatbot boundaries
          </Typography>
          <List>
            {configNav.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    color: location.pathname === item.path ? "#4287f5" : "#fff",
                    bgcolor: location.pathname === item.path ? "#e6edff" : "transparent",
                    '&:hover': {
                      bgcolor: "#232b33",
                      color: "#7ec4fa"
                    },
                    transition: 'background 0.2s, color 0.2s'
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? "#4287f5" : "#fff", minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      fontSize: 16
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, bgcolor: "#f7f8fa", p: 5, mr: '-48px', ml: '261px', minHeight: "90vh", }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
            Tone & Personality
          </Typography>

          {/* Tone Selector */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Tone selector
            </Typography>
            <FormGroup row>
              {Object.keys(tones).map((tone) => (
                <FormControlLabel
                  key={tone}
                  control={
                    <Checkbox
                      checked={tones[tone]}
                      onChange={handleToneChange}
                      name={tone}
                    />
                  }
                  label={tone}
                  sx={{ mr: 3 }}
                />
              ))}
            </FormGroup>
          </Paper>

          {/* Emoji Usage */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Emoji Usage
            </Typography>
            <RadioGroup
              row
              value={emojiUsage}
              onChange={e => setEmojiUsage(e.target.value)}
            >
              {["None", "Light", "Moderate", "Heavy"].map(option => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                  sx={{ mr: 3 }}
                />
              ))}
            </RadioGroup>
          </Paper>

          {/* Signature Style */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Signature style
              </Typography>

              <Tooltip title="This setting controls the preferred sign-off of your chatbot.">
                <IconButton size="small">
                  <Typography variant="body2" fontWeight="bold">?</Typography>
                </IconButton>
              </Tooltip>
            </Stack>


            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="e.g. Let us know if you need anything else!"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              sx={{ bgcolor: "#fff", borderRadius: 2 }}
              inputProps={{ maxLength: 100 }}
            />
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#4d8af0",
                color: "#fff",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: 18,
                borderRadius: 3,
                boxShadow: 2,
                '&:hover': { bgcolor: "#2e6fd8" },
                mt: 4
              }}
              onClick={handleSave}
            >
              Save changes
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


export default TonePersonality;