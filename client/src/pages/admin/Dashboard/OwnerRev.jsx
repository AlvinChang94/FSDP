import { Typography, Box, Button } from "@mui/material";
import { useNavigate } from 'react-router-dom';

function OwnerRev() {
    const navigate = useNavigate();
    
    return (
        <Box sx ={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant='h5' sx={{my:2}}>
                Owner reviews
            </Typography>
            <Button onClick={() => navigate(-1)} variant="contained" color='inherit'>
                    back
            </Button>
        </Box>
    );
}
export default OwnerRev;