import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
  Divider
} from
  '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';


const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().
        email('Must be a valid email').
        required('Email is required'),
      password: Yup.string().required('Password is required')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        await login(values.email, values.password);
        navigate('/dashboard');
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to login. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        py: 8
      }}>

      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 4
          }}>

          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h3" sx={{ mb: 1, color: 'text.primary', textAlign: 'center' }}>
            Welcome Back
          </Typography>
          <Typography component="h2" variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Sign in to track your warranties and services
          </Typography>

          {error &&
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          }

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ width: '100%' }}>

            <TextField
              error={Boolean(formik.touched.email && formik.errors.email)}
              fullWidth
              helperText={formik.touched.email && formik.errors.email}
              label="Email Address"
              margin="normal"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              value={formik.values.email}
              variant="outlined" />

            <TextField
              error={Boolean(formik.touched.password && formik.errors.password)}
              fullWidth
              helperText={formik.touched.password && formik.errors.password}
              label="Password"
              margin="normal"
              name="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.password}
              variant="outlined" />

            <Button
              color="primary"
              disabled={loading}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}>

              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Divider sx={{ width: '100%', my: 3 }}>OR</Divider>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    setLoading(true);
                    await googleLogin(credentialResponse.credential);
                    navigate('/dashboard');
                  } catch (err) {
                    setError('Google Login failed. Please try again.');
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError('Google Sign In was not successful.');
                }}
              />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                underline="hover">

                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>);

};

export default Login;