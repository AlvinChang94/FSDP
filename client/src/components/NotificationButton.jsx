import { IconButton, Menu, MenuItem } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationButton() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (path) => {
    setAnchorEl(null);
    if (path) navigate(path); // navigate to the page if path is provided
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <Notifications />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleClose('/review')}>Reviews</MenuItem>
        <MenuItem onClick={() => handleClose('/announcements')}>Announcements</MenuItem>
      </Menu>
    </>
  );
}
