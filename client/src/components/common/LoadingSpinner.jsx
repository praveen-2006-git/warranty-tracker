import { Box, CircularProgress, Typography } from '@mui/material';






const LoadingSpinner = ({
  message = 'Loading...',
  fullPage = false
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: fullPage ? '100vh' : '100%',
        width: '100%',
        p: 3
      }}>
      
      <CircularProgress size={40} />
      {message &&
      <Typography variant="body1" sx={{ mt: 2 }}>
          {message}
        </Typography>
      }
    </Box>);

};

export default LoadingSpinner;