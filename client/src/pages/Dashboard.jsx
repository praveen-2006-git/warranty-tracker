import { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { productsAPI } from '../services/api';


// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await productsAPI.getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const getChartData = () => {
    if (!stats || !stats.productsByCategory || stats.productsByCategory.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
        {
          data: [1],
          backgroundColor: ['#e0e0e0'],
          borderWidth: 1
        }]

      };
    }

    return {
      labels: stats.productsByCategory.map((item) => item.categoryName),
      datasets: [
      {
        data: stats.productsByCategory.map((item) => item.count),
        backgroundColor: [
        '#1976d2',
        '#9c27b0',
        '#2e7d32',
        '#ed6c02',
        '#d32f2f',
        '#0288d1',
        '#9e9e9e'],

        borderWidth: 1
      }]

    };
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh'
        }}>
        
        <CircularProgress />
      </Box>);

  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>);

  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 160,
              background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }
            }}>
            
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ opacity: 0.9 }}>
              Total Products
            </Typography>
            <Typography variant="h2" fontWeight={800}>{stats?.totalProducts || 0}</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 160,
              background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }
            }}>
            
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ opacity: 0.9 }}>
              Total Services
            </Typography>
            <Typography variant="h2" fontWeight={800}>{stats?.totalServices || 0}</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 160,
              background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }
            }}>
            
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ opacity: 0.9, textAlign: 'center' }}>
              Expiring Warranties
            </Typography>
            <Typography variant="h2" fontWeight={800}>
              {stats?.productsWithExpiringWarranty || 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 160,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }
            }}>
            
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ opacity: 0.9, textAlign: 'center' }}>
              Upcoming Services
            </Typography>
            <Typography variant="h2" fontWeight={800}>{stats?.upcomingServices || 0}</Typography>
          </Paper>
        </Grid>

        {/* Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300
            }}>
            
            <Typography variant="h6" gutterBottom>
              Products by Category
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
              }}>
              
              <Pie data={getChartData()} />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300
            }}>
            
            <Typography variant="h6" gutterBottom>
              Quick Tips
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" paragraph>
                • Add your products to track warranty periods
              </Typography>
              <Typography variant="body1" paragraph>
                • Record service logs to maintain service history
              </Typography>
              <Typography variant="body1" paragraph>
                • Set up notification preferences in your profile
              </Typography>
              <Typography variant="body1" paragraph>
                • Organize products by categories for better management
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>);

};

export default Dashboard;