import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Checkbox, FormControlLabel, FormGroup, Radio, RadioGroup, TextField, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import SecurityIcon from '@mui/icons-material/Security';
import PsychologyIcon from '@mui/icons-material/Psychology';
import http from "../../http";

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
  {
    label: "Security & Privacy",
    icon: <SecurityIcon />,
    path: "/config/security_privacy"
  },
  {
    label: "Intervention Threshold",
    icon: <EmojiEmotionsIcon />,
    path: "/config/intervention_threshold"
  }
];

function TonePersonality() {
  const userId = localStorage.getItem('userId');
  const location = useLocation();
  const [saveStatus, setSaveStatus] = useState('');
  const [tones, setTones] = useState({
    Professional: false,
    Neutral: false,
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
      await http.post('/api/config/save', {
        userId,
        tone: Object.keys(tones).filter(t => tones[t]).join(', '),
        emojiUsage,
        signature
      });
      setSaveStatus('Settings saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus('Failed to save settings.');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };
  useEffect(() => {
  const fetchSettings = async () => {
    const res = await http.get(`/api/config/${userId}`);
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
    <Box sx={{ml: -10, mt: -9, mb: -30}}>
    <Box sx={{ display: "flex", bgcolor: "#181617"}}>
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
      <Box sx={{ flex: 1, bgcolor: "#f7f8fa", p: 5, mr:'-48px', ml: '261px', minHeight: "90vh", }}>
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
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Signature style
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="e.g. Let us know if you need anything else!"
            value={signature}
            onChange={e => setSignature(e.target.value)}
            sx={{ bgcolor: "#fff", borderRadius: 2 }}
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
        {saveStatus && (
  <Typography sx={{ color: saveStatus === 'Settings saved!' ? 'green' : 'red', mb: 2 }}>
    {saveStatus}
  </Typography>
)}
      </Box>
    </Box>
    </Box>
  );
}


export default TonePersonality;