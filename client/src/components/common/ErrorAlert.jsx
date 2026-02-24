import { Alert, AlertTitle, Box } from '@mui/material';








const ErrorAlert = ({
  error,
  severity = 'error',
  title,
  onClose
}) => {
  if (!error) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity={severity} onClose={onClose}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {error}
      </Alert>
    </Box>);

};

export default ErrorAlert;