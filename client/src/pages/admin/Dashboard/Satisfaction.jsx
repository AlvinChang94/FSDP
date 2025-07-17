import { Typography, Box, Link, Button } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import RatingBarChart from "./RatingBarChart";

function Satisfaction() {
    const navigate = useNavigate();

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ my: 2 }}>
                    User Satisfation metrics
                </Typography>
                <Button onClick={() => navigate(-1)} variant="contained" color='inherit'>
                    back
                </Button>
            </Box>
            <Box sx={{ width: '100%', height: '80vh' }}>
                <RatingBarChart />
            </Box>
        </Box>
    );
}
export default Satisfaction;