import { TextField } from '@mui/material';
import { useField } from 'formik';





const FormField = ({ name, ...props }) => {
  const [field, meta] = useField(name);
  const isError = Boolean(meta.touched && meta.error);

  return (
    <TextField
      {...field}
      {...props}
      error={isError}
      helperText={isError ? meta.error : props.helperText}
      fullWidth />);


};

export default FormField;