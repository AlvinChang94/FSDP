import { Typography, Box, Button, Grid, Card, CardContent, Icon } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import http from '../../../http';
import StarIcon from '@mui/icons-material/Star';

function OwnerRev() {
    const navigate = useNavigate();
    const [reviewList, setReviewList] = useState([]);

    useEffect(() => {
        http.get('/reviews')
            .then((res) => {
                setReviewList(res.data)})
            .catch((err) => console.error("Failed to fetch review data"))
    })

    return (
        <Box>
            <Box sx ={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant='h5' sx={{my:2}}>
                    Owner reviews
                </Typography>
                <Button onClick={() => navigate(-1)} variant="contained" color='inherit'>
                    back
                </Button>
            </Box>
            <Grid container spacing = {2}>
                {reviewList.map((review) => (
                    <Grid item xs={12} md={6} lg ={4} key={review.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', mb: 1}}>
                                    <Typography variant='h6' sx={{flexGrow: 1}}>
                                        <Box>
                                            {review.comment}
                                        </Box>
                                        <Box>
                                            {[1,2,3,4,5].map((star) => (
                                                <Icon key={star}>
                                                    <StarIcon color = {(review.rating) >= star ? 'warning' : 'disabled'} />
                                                </Icon>
                                            ))}
                                        </Box>
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                ))}
            </Grid>
        </Box>
    );
}
export default OwnerRev;