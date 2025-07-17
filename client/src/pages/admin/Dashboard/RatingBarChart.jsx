import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import http from '../../../http';

function RatingBarChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        http.get('/reviews/summary')
            .then(res => setData(res.data))
            .catch(() => console.error("Failed to fetch review summary"));
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating">
                    <Label value="Rating (Stars)" offset={-10} position="insideBottom" />
                </XAxis>
                <YAxis allowDecimals={false}>
                    <Label value="Number of Reviews" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Bar dataKey="count" fill="#1976d2" />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default RatingBarChart;