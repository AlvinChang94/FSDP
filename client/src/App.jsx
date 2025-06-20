import { useState, useEffect } from 'react';
import './App.css';
import MyTheme from './themes/mytheme';
import { ThemeProvider } from '@mui/material/styles';
import Tutorials from './pages/tutorials/Tutorials';
import Home from './pages/Home';
import EditTutorial from './pages/tutorials/EditTutorial';
import AddTutorial from './pages/tutorials/AddTutorial';
import Register from './pages/Register';
import Login from './pages/Login';
import Support from './pages/Support';
import { Avatar, Container, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemText, ListItemButton, Menu, MenuItem, Divider } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import http from './http';
import UserContext from './contexts/UserContext';
import AdminLogin from './pages/admin/Adminlogin';
import Contactstaff from './pages/faq/Contactstaff';
import AdminDashboard from './pages/admin/AdminDash';
import Notification from './pages/notification/Notifs';
import AddNotification from './pages/notification/AddNotif';
import EditNotification from './pages/notification/EditNotif';
import TonePersonality from './pages/Chatbot Config/tone_personality';
import Faq_Management from './pages/Chatbot Config/faq_management';
import Security_privacy from './pages/Chatbot Config/security_privacy';
import Intervention_threshold from './pages/Chatbot Config/intervetion_threshold';
import ChatbotPreview from './pages/ChatbotPreview';
import AdminSupport from './pages/admin/AdminSupport';


const logout = () => {
  localStorage.clear();
  window.location = "/";
};

function App() {

  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get('/user/auth').then((res) => {
        setUser(res.data.user);
      });
    }
  }, []);

  const handleUserBarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <ThemeProvider theme={MyTheme}>
          <Box sx={{ display: 'flex' }}>
            {/* Sidebar Drawer */}
            <Drawer
              variant="permanent"
              anchor="left"
              sx={{
                width: 220,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: 220,
                  boxSizing: 'border-box',
                  height: '100vh',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 0,
                },
              }}
            >
              <Box>
                <Toolbar />
                <List>
                  <ListItem disablePadding sx={{ marginTop: '-70px' }}>
                    <ListItemButton component={Link} to="/">
                      <img
                        src="/queryease.png"
                        alt="Learning"
                        style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                    <ListItemButton component={Link} to="/tutorials">
                      <ListItemText primary="Tutorials" sx={{ color: 'white' }} />
                    </ListItemButton>
                  </ListItem>
                  {/* Tutorials is only listed for our own reference, we will remove it later */}
                  { user && user.role == 'admin' ? (
                    <>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/admin-notifications">
                          <ListItemText primary="Admin Notifications" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/admin-analytics">
                          <ListItemText primary="Admin Analytics" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/admin-support">
                          <ListItemText primary="Admin Support Centre" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/moderator-actions">
                          <ListItemText primary="Moderator Actions" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/AdminDash">
                          <ListItemText primary="Admin Dashboard" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                    </>
                  ) : user ? (
                    <>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/config/tone_personality">
                          <ListItemText primary="Chatbot Config" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/preview">
                          <ListItemText primary="Chatbot Preview" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/notifications">
                          <ListItemText primary="Notifications" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/useranalytics">
                          <ListItemText primary="My Analytics" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/myclients">
                          <ListItemText primary="My Clients" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}>
                        <ListItemButton component={Link} to="/supportcentre">
                          <ListItemText primary="Support Centre" sx={{ color: 'white' }} />
                        </ListItemButton>
                      </ListItem>
                    </>
                  ) : null}
                </List>
              </Box>
              {/* Bottom User Bar */}
              <Box>
                <Divider />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 2,
                    cursor: 'pointer',
                    bgcolor: '#cdcdcd',
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    '&:hover': { backgroundColor: '#A0A0A0' }
                  }}
                  onClick={handleUserBarClick}
                >
                  <Avatar
                    alt="Profile Picture"
                    src="/placeholderpfp.png"
                    sx={{ width: 40, height: 40, mr: 2, border: '2px solid black' }}

                  />
                  <Typography variant="body1" sx={{ flexGrow: 1, fontSize: '1.4rem', mt: -2.2, fontWeight: 'bold' }}>
                    {user ? user.name : ""}
                    <span style={{ display: 'block', fontSize: '0.8em', marginBottom: -20, marginTop: -4, fontWeight: '600', color: user && user.role === 'admin' ? 'red': '#494db3' }}>{user ? user.role == 'admin' ? "Admin" : "User": ""}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '1.3rem', mr: 10, fontWeight: 'bold' }}>
                    {user ? "" : "Guest"}
                  </Typography>
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                  {user ? (
                    <>
                      <MenuItem onClick={handleMenuClose} component={Link} to="/settings">
                        User Settings
                      </MenuItem>
                      <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                        Logout
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem onClick={handleMenuClose} component={Link} to="/register">
                        Register
                      </MenuItem>
                      <MenuItem onClick={handleMenuClose} component={Link} to="/login">
                        Login
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </Box>
            </Drawer>
            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Container>
                <Routes>
                  <Route path={"/"} element={<Home />} />
                  <Route path={"/tutorials"} element={<Tutorials />} />
                  <Route path={"/addtutorial"} element={<AddTutorial />} />
                  <Route path={"/edittutorial/:id"} element={<EditTutorial />} />
                  <Route path={"/admin-login"} element={<AdminLogin />} />
                  <Route path={"/register"} element={<Register />} />
                  <Route path={"/login"} element={<Login />} />
                  <Route path={"/config/tone_personality"} element={<TonePersonality />} />
                  <Route path={"/config/faq_management"} element={<Faq_Management />} />
                  <Route path={"/config/security_privacy"} element={<Security_privacy />} />
                  <Route path={"/config/intervention_threshold"} element={<Intervention_threshold />} />
                  <Route path={"/preview"} element={<ChatbotPreview />} />
                  <Route path={"/useranalytics"} element={<Login />} />
                  <Route path={"/myclients"} element={<Login />} />
                  <Route path={"/supportcentre"} element={<Support />} />
                  <Route path={"/settings"} element={<Login />} />
                  <Route path={"/contact"} element={<Contactstaff />} />
                  <Route path={"/AdminDash"} element={<AdminDashboard />} />
                  <Route path={'/Notification'} element={<Notification />} />
                  <Route path={'/AddNotif'} element={<AddNotification />} />
                  <Route path={'/notifications'} element={<Login />} />
                  <Route path={"/EditNotif/:id"} element={<EditNotification />} />
                  <Route path={"/admin-support"} element={<AdminSupport />} />

                  {/* The element={} represents the name of the file in the 'pages' folder */}
                </Routes>
              </Container>
            </Box>
          </Box>
        </ThemeProvider>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
