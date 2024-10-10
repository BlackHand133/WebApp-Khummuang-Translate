import React, { useMemo } from 'react';
import { Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdminAnalytics } from '../../../AminAnalytics';

const AudioStatisticsChart = () => {
  const { audioStatistics, loading, error } = useAdminAnalytics();

  const chartData = useMemo(() => {
    return audioStatistics?.map(stat => ({
      ...stat,
      date: new Date(stat.date).toLocaleDateString(),
    })) || [];
  }, [audioStatistics]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!audioStatistics || audioStatistics.length === 0) {
    return <Typography>No audio statistics available</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Audio Statistics</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="total_count" stroke="#8884d8" name="Total Records" />
            <Line yAxisId="left" type="monotone" dataKey="microphone_count" stroke="#82ca9d" name="Microphone Records" />
            <Line yAxisId="left" type="monotone" dataKey="upload_count" stroke="#ffc658" name="Uploaded Records" />
            <Line yAxisId="right" type="monotone" dataKey="avg_duration" stroke="#ff7300" name="Average Duration (s)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default React.memo(AudioStatisticsChart);