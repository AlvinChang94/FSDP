import { Typography, Box, Paper, IconButton, TextField } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useState } from 'react';

function Review() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <Box>
            <Paper elevation={3} sx={{ maxWidth: 1100, mx: 'auto', p: 4, mb: 4, bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Submit Review
                    </Typography>
                </Box>
            </Paper>
            <Box sx={{ display: 'flex', mb: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}>
                        <StarIcon color={(hover || rating) >= star ? 'warning' : 'disabled'} />
                    </IconButton>
                ))}
            </Box>
            <Typography gutterBottom>
                Comment
            </Typography>
            <TextField fullWidth multiline minRows={3} placeholder="Write your feedback here..."/>
        </Box>
    );
}
export default Review;