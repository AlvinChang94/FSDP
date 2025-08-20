import React, { useState, useEffect } from "react";
import {
    Box, Grid, Card, CardMedia, CardContent, CardActions, Paper,
    Typography, Button, Chip, Avatar, Divider, IconButton, Dialog, DialogTitle, DialogContent
} from "@mui/material";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import CloseIcon from "@mui/icons-material/Close";
import http from "../../http";
import DOMPurify from 'dompurify';
const samplePosts = [
    {
        id: 1,
        title: "Getting started with QueryEase",
        excerpt:
            "Learn how to connect WhatsApp, set up your bot and onboard your first clients in under 10 minutes.",
        content: `
<h2>Overview</h2>
<p>This guide walks you through setting up <strong>QueryEase</strong> from scratch, covering prerequisites, installation, configuration, and verification. You’ll also find pro tips, troubleshooting steps, and screenshot placeholders you can swap with your own captures.</p>
<ul>
  <li><strong>Goal:</strong> A working QueryEase bot connected to WhatsApp, ready to onboard your first clients.</li>
  <li><strong>Audience:</strong> Beginners.</li>
  <li><strong>Estimated time:</strong> 10–15 minutes.</li>
</ul>

<h2>Prerequisites</h2>
<ul>
  <li>WhatsApp Business</li>
  <li>QueryEase account</li>
</ul>

<h2>Step-by-step setup</h2>
<ol>
  <li><strong>Sign in and create an account:</strong> Register for an account</li>
  <li><strong>Connect WhatsApp:</strong> In QueryEase → User Settings, select Connect to WhatsApp. Scan the QR code and authorize your WhatsApp Business account.</li>
  <li><strong>Configure your bot:</strong> Add a welcome message under Chatbot Config. Set up answers and questions under FAQ management.</li>
  <li><strong>Test the flow:</strong> Send a test message from your own WhatsApp to confirm the bot replies correctly.</li>
</ol>

<h2>Pro tips</h2>
<ul>
  <li>Keep responses short and actionable.</li>
  <li>Use tags to segment clients.</li>
  <li>Set business hours so customers know when to expect live replies.</li>
</ul>

<h2>Troubleshooting</h2>
<ul>
  <li><strong>Bot not responding?</strong> Check API key validity and WhatsApp connection.</li>
  <li><strong>Wrong number linked?</strong> Re-run the integration wizard in settings.</li>
</ul>
    `,
        author: "QueryEase Team",
        date: "2024-11-01",
        tags: ["setup", "whatsapp", "onboarding"],
        image: "/stock1.jpg"
    },
    {
        id: 2,
        title: "Designing effective bot responses",
        excerpt:
            "Best practices for tone, brevity and escalation to humans so your customers always get a good experience.",
        content: `
<h2>Why response design matters</h2>
<p>Your bot’s <em>tone</em> and clarity directly affect customer satisfaction. Well‑crafted responses make interactions feel human while keeping them efficient.</p>

<h2>Step-by-step approach</h2>
<ol>
  <li><strong>Define your brand voice:</strong> Decide if your tone is formal, casual, or playful — and keep it consistent.</li>
  <li><strong>Prioritize brevity:</strong> Aim for short sentences; use bullet points for multi‑step instructions.</li>
  <li><strong>Anticipate common questions:</strong> Review past chats to spot repeat queries and create canned responses.</li>
  <li><strong>Set clear escalation paths:</strong> Include a polite handoff message when transferring to a human.</li>
  <li><strong>Personalize:</strong> Use the customer’s name and reference their past orders.</li>
</ol>

<h2>Pro tips</h2>
<ul>
  <li><strong>Avoid jargon:</strong> Use simple language to reach more people.</li>
  <li><strong>Delay wisely:</strong> If you need time to fetch data, acknowledge it.</li>
  <li><strong>Fallback gracefully:</strong> Have a friendly message for unrecognized inputs.</li>
</ul>

<h2>Example snippets</h2>
<ul>
  <li>"Hi Sarah, your package is arriving tomorrow 📦."</li>
  <li>"Got it — let me check that for you."</li>
  <li>"I didn’t quite understand — could you rephrase?"</li>
</ul>
    `,
        author: "Product",
        date: "2024-10-10",
        tags: ["chatbot", "ux"],
        image: "/stock2.jpg"
    }
];



export default function Guide() {
    const [posts, setPosts] = useState([]);
    const [openPost, setOpenPost] = useState(null);

    useEffect(() => {
        // try to fetch guides from backend; fallback to sample data
        let mounted = true;
        (async () => {
            try {
                const res = await http.get("/api/guides"); // optional endpoint
                if (mounted && res?.data?.guides?.length) setPosts(res.data.guides);
                else if (mounted) setPosts(samplePosts);
            } catch (e) {
                if (mounted) setPosts(samplePosts);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return (
        <Box sx={{ p: { xs: 2, md: 5 }, minHeight: "100vh", bgcolor: "#f7f8fb", ml: -6, minWidth: "78vw", mr: -6, mt: -8, mb: -3 }}>
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                            Guides & Help
                        </Typography>
                        <Typography color="text.secondary">
                            Curated how-tos, tips and best practices to help you get the most out of QueryEase.
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Grid container spacing={3}>
                        {posts.map((p) => (
                            <Grid item xs={12} key={p.id}>
                                <Card sx={{ display: "flex", borderRadius: 2, boxShadow: 3 }}>
                                    <CardMedia
                                        component="img"
                                        image={p.image || "/guide-placeholder.png"}
                                        alt={p.title}
                                        sx={{ width: { xs: "100%", md: 260 }, height: 160, objectFit: "cover", borderRadius: { md: 2 }, alignSelf: 'center', ml: 2 }}
                                    />
                                    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                        <CardContent sx={{ flex: "1 1 auto" }}>
                                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                                                {p.tags?.slice(0, 3).map(t => <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} />)}
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                    {new Date(p.date).toLocaleDateString()}
                                                </Typography>
                                            </Box>

                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {p.excerpt}
                                            </Typography>

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                                                <Avatar sx={{ width: 28, height: 28 }}>{p.author?.[0]}</Avatar>
                                                <Typography variant="subtitle2">{p.author}</Typography>
                                            </Box>
                                        </CardContent>

                                        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                                            <Button size="small" startIcon={<ReadMoreIcon />} onClick={() => setOpenPost(p)}>Read more</Button>
                                        </CardActions>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box sx={{ position: "sticky", top: 84 }}>
                        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Popular topics</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {["setup", "chatbot", "onboarding", "integration", "analytics"].map(t => (
                                    <Chip key={t} label={t} clickable sx={{ bgcolor: "#eef3ff" }} />
                                ))}
                            </Box>
                        </Paper>

                        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Subscribe for updates</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                Get new guides and tips delivered to your inbox.
                            </Typography>
                            <Button fullWidth variant="contained" href="/register">Create account</Button>
                        </Paper>

                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Resources</Typography>
                            <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                                <Button size="small" href="/guide">FAQ</Button>
                                <Button size="small" href="/supportcentre">Support Centre</Button>
                                <Button size="small" href="/contact">Contact</Button>
                            </Box>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            <Dialog open={Boolean(openPost)} onClose={() => setOpenPost(null)} fullWidth maxWidth="md">
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6">{openPost?.title}</Typography>
                    <IconButton onClick={() => setOpenPost(null)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        By {openPost?.author} • {openPost ? new Date(openPost.date).toLocaleDateString() : ""}
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}><div
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(openPost?.content)
                        }}
                    />
                    </Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
}