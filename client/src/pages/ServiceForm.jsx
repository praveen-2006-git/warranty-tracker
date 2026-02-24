import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText } from
'@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { servicesAPI, productsAPI } from '../services/api';


const ServiceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const queryParams = new URLSearchParams(location.search);
  const preselectedProductId = queryParams.get('productId');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [service, setService] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [deleteDocLoading, setDeleteDocLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll();
        setProducts(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products');
      }
    };

    const fetchService = async () => {
      if (isEditMode && id) {
        try {
          const response = await servicesAPI.getById(id);
          setService(response.data);
          setExistingDocuments(response.data.documents || []);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch service');
        } finally {
          setInitialLoading(false);
        }
      }
    };

    fetchProducts();
    if (isEditMode) {
      fetchService();
    } else {
      setInitialLoading(false);
    }
  }, [id, isEditMode]);

  const formik = useFormik({
    initialValues: {
      product: service ?
      typeof service.product === 'object' ?
      service.product._id :
      service.product :
      preselectedProductId || '',
      serviceDate: service?.serviceDate ?
      new Date(service.serviceDate).toISOString().split('T')[0] :
      new Date().toISOString().split('T')[0],
      serviceCenter: service?.serviceCenter || '',
      cost: service?.cost || 0,
      description: service?.description || '',
      nextServiceDueDate: service?.nextServiceDueDate ?
      new Date(service.nextServiceDueDate).toISOString().split('T')[0] :
      '',
      notes: service?.notes || '',
      documents: undefined
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      product: Yup.string().required('Product is required'),
      serviceDate: Yup.date().required('Service date is required'),
      serviceCenter: Yup.string().required('Service center is required'),
      cost: Yup.number().
      min(0, 'Cost must be a positive number').
      required('Cost is required'),
      description: Yup.string().required('Description is required'),
      nextServiceDueDate: Yup.date().nullable(),
      notes: Yup.string()
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('product', values.product);
        formData.append('serviceDate', values.serviceDate);
        formData.append('serviceCenter', values.serviceCenter);
        formData.append('cost', values.cost.toString());
        formData.append('description', values.description);

        if (values.nextServiceDueDate) {
          formData.append('nextServiceDueDate', values.nextServiceDueDate);
        }

        if (values.notes) {
          formData.append('notes', values.notes);
        }

        // Append documents if any
        selectedFiles.forEach((file) => {
          formData.append('documents', file);
        });

        if (isEditMode && id) {
          await servicesAPI.update(id, formData);
        } else {
          await servicesAPI.create(formData);
        }

        // Navigate back to the product's services page if we came from there
        if (preselectedProductId) {
          navigate(`/services/product/${preselectedProductId}`);
        } else {
          navigate('/services');
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} service`
        );
      } finally {
        setLoading(false);
      }
    }
  });

  const handleFileChange = (event) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
    }
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleDeleteDocument = async (documentId) => {
    if (!id) return;

    try {
      setDeleteDocLoading(true);
      await servicesAPI.deleteDocument(id, documentId);
      setExistingDocuments((prevDocs) =>
      prevDocs.filter((doc) => doc._id !== documentId)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeleteDocLoading(false);
    }
  };

  if (initialLoading) {
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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'Edit Service Record' : 'Add Service Record'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="product"
                name="product"
                select
                label="Product"
                value={formik.values.product}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.product && Boolean(formik.errors.product)}
                helperText={formik.touched.product && formik.errors.product}
                disabled={Boolean(preselectedProductId) || isEditMode}>
                
                {products.map((product) =>
                <MenuItem key={product._id} value={product._id}>
                    {product.name}
                  </MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="serviceDate"
                name="serviceDate"
                label="Service Date"
                type="date"
                value={formik.values.serviceDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                formik.touched.serviceDate &&
                Boolean(formik.errors.serviceDate)
                }
                helperText={
                formik.touched.serviceDate && formik.errors.serviceDate
                }
                InputLabelProps={{ shrink: true }} />
              
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="serviceCenter"
                name="serviceCenter"
                label="Service Center"
                value={formik.values.serviceCenter}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                formik.touched.serviceCenter &&
                Boolean(formik.errors.serviceCenter)
                }
                helperText={
                formik.touched.serviceCenter && formik.errors.serviceCenter
                } />
              
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="cost"
                name="cost"
                label="Cost"
                type="number"
                value={formik.values.cost}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cost && Boolean(formik.errors.cost)}
                helperText={formik.touched.cost && formik.errors.cost}
                InputProps={{ startAdornment: '$' }} />
              
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="nextServiceDueDate"
                name="nextServiceDueDate"
                label="Next Service Due Date (Optional)"
                type="date"
                value={formik.values.nextServiceDueDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                formik.touched.nextServiceDueDate &&
                Boolean(formik.errors.nextServiceDueDate)
                }
                helperText={
                formik.touched.nextServiceDueDate &&
                formik.errors.nextServiceDueDate
                }
                InputLabelProps={{ shrink: true }} />
              
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Service Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                formik.touched.description &&
                Boolean(formik.errors.description)
                }
                helperText={
                formik.touched.description && formik.errors.description
                } />
              
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Additional Notes (Optional)"
                multiline
                rows={2}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes} />
              
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                Documents
              </Typography>

              {/* Existing Documents */}
              {existingDocuments.length > 0 &&
              <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Existing Documents
                  </Typography>
                  <List>
                    {existingDocuments.map((doc) =>
                  <ListItem
                    key={doc._id}
                    secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteDocument(doc._id)}
                      disabled={deleteDocLoading}>
                      
                            {deleteDocLoading ?
                      <CircularProgress size={20} /> :

                      <DeleteIcon />
                      }
                          </IconButton>
                    }>
                    
                        <ListItemText primary={doc.filename} />
                      </ListItem>
                  )}
                  </List>
                </Box>
              }

              {/* Selected Files */}
              {selectedFiles.length > 0 &&
              <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Files
                  </Typography>
                  <List>
                    {selectedFiles.map((file, index) =>
                  <ListItem
                    key={index}
                    secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveSelectedFile(index)}>
                      
                            <DeleteIcon />
                          </IconButton>
                    }>
                    
                        <ListItemText primary={file.name} />
                      </ListItem>
                  )}
                  </List>
                </Box>
              }

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}>
                
                Upload Documents
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange} />
                
              </Button>
              <FormHelperText>
                Upload service receipts, reports, or other relevant documents
              </FormHelperText>
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (preselectedProductId) {
                      navigate(`/services/product/${preselectedProductId}`);
                    } else {
                      navigate('/services');
                    }
                  }}
                  disabled={loading}>
                  
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}>
                  
                  {loading ?
                  <CircularProgress size={24} /> :
                  isEditMode ?
                  'Update Service' :

                  'Add Service'
                  }
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>);

};

export default ServiceForm;