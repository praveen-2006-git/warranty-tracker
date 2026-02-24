import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Avatar
} from
  '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
  const { user, uploadAvatar } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().
        email('Must be a valid email').
        required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: Yup.string().oneOf(
        [Yup.ref('password')],
        'Passwords must match'
      )
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const updateData = {
          name: values.name,
          email: values.email
        };

        if (values.password) {
          updateData.password = values.password;
        }

        const response = await authAPI.updateProfile(updateData);

        // Since the backend returns a new token, we should update the auth context
        // We can re-use the login method from context since it takes a token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          // Update user context (we might need to reload or update the auth state directly)
          // The simplest way to refresh user data contextually is to just show success
          // and let the next page load grab the new data.
        }

        setSuccess('Profile updated successfully!');
        formik.setFieldValue('password', '');
        formik.setFieldValue('confirmPassword', '');

      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to update profile. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }
  });

  const handleAvatarChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('avatar', file);

        await uploadAvatar(formData);
        setSuccess('Avatar updated successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to upload avatar.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Profile Settings
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{ width: 100, height: 100, mb: 2, bgcolor: user?.avatarUrl ? 'transparent' : 'primary.main', fontSize: '3rem' }}
            src={user?.avatarUrl ? `http://localhost:5000${user.avatarUrl}` : undefined}
          >
            {!user?.avatarUrl && (user?.name?.charAt(0) || 'U')}
          </Avatar>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Change Avatar
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Button>
        </Box>

        {error &&
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        }

        {success &&
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            {success}
          </Alert>
        }

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Personal Information
          </Typography>

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


          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Change Password
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Leave blank if you do not want to change your password.
          </Typography>

          <TextField
            error={Boolean(formik.touched.password && formik.errors.password)}
            fullWidth
            helperText={formik.touched.password && formik.errors.password}
            label="New Password"
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
            label="Confirm New Password"
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
            sx={{ mt: 4 }}>

            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Container>);

};

export default Profile;