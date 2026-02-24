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
import { PersonAddOutlined as PersonAddOutlinedIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';


const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().
        email('Must be a valid email').
        required('Email is required'),
      password: Yup.string().
        min(6, 'Password must be at least 6 characters').
        required('Password is required'),
      confirmPassword: Yup.string().
        oneOf([Yup.ref('password')], 'Passwords must match').
        required('Confirm password is required')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      try {
        await register(values.name, values.email, values.password);
        navigate('/dashboard');
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to register. Please try again.'
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

          <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56, mb: 2 }}>
            <PersonAddOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h3" sx={{ mb: 1, color: 'text.primary', textAlign: 'center' }}>
            Create Account
          </Typography>
          <Typography component="h2" variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Join us to easily manage your assets
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
              error={Boolean(formik.touched.name && formik.errors.name)}
              fullWidth
              helperText={formik.touched.name && formik.errors.name}
              label="Full Name"
              margin="normal"
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
              variant="outlined" />

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

            <TextField
              error={Boolean(
                formik.touched.confirmPassword && formik.errors.confirmPassword
              )}
              fullWidth
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              label="Confirm Password"
              margin="normal"
              name="confirmPassword"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.confirmPassword}
              variant="outlined" />

            <Button
              color="primary"
              disabled={loading}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}>

              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
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
                    setError('Google Registration failed. Please try again.');
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError('Google Registration was not successful.');
                }}
                text="signup_with"
              />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                underline="hover">

                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>);

};

export default Register;