import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  ListItemText
} from
  '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { productsAPI, categoriesAPI } from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [deleteDocLoading, setDeleteDocLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch categories');
      }
    };

    const fetchProduct = async () => {
      if (isEditMode && id) {
        try {
          const response = await productsAPI.getById(id);
          setProduct(response.data);
          if (response.data.imageUrl) {
            // Support previewing the existing image URL
            setPreviewUrl(`http://localhost:5000${response.data.imageUrl}`);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch product');
        } finally {
          setInitialLoading(false);
        }
      }
    };

    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id, isEditMode]);

  const formik = useFormik({
    initialValues: {
      name: product?.name || '',
      purchaseDate: product?.purchaseDate ?
        new Date(product.purchaseDate).toISOString().split('T')[0] :
        '',
      warrantyPeriod: product?.warrantyPeriod || 12,
      description: product?.description || '',
      category: typeof product?.category === 'object' ?
        product.category._id :
        product?.category || '',
      image: undefined
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      purchaseDate: Yup.date().required('Purchase date is required'),
      warrantyPeriod: Yup.number().
        min(0, 'Warranty period must be a positive number').
        required('Warranty period is required'),
      category: Yup.string().required('Category is required')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description);
        formData.append('purchaseDate', values.purchaseDate);
        formData.append('warrantyPeriod', values.warrantyPeriod.toString());
        formData.append('category', values.category);

        // Append the single image file instead of documents
        if (selectedFile) {
          formData.append('image', selectedFile);
        }

        if (isEditMode && id) {
          await productsAPI.update(id, formData);
        } else {
          await productsAPI.create(formData);
        }

        navigate('/products');
      } catch (err) {
        setError(
          err.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} product`
        );
      } finally {
        setLoading(false);
      }
    }
  });

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleDeleteDocument = async () => {
    // Note: If you want to delete the image dynamically, you can configure an API route for it.
    // For now, the user can upload a new image to overwrite, or we clear the UI.
    handleRemoveFile();
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
          {isEditMode ? 'Edit Product' : 'Add Product'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Product Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name} />

            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary', ml: 1 }}>
                Product Description & Notes
              </Typography>
              <Paper variant="outlined" sx={{
                border: formik.touched.description && formik.errors.description ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                '& .ql-container': {
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  minHeight: '150px',
                  fontSize: '1rem',
                  fontFamily: 'Inter, sans-serif'
                },
                '& .ql-toolbar': {
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#f8fafc'
                }
              }}>
                <ReactQuill
                  theme="snow"
                  value={formik.values.description}
                  onChange={(value) => formik.setFieldValue('description', value)}
                  onBlur={() => formik.setFieldTouched('description', true)}
                  placeholder="Enter details about your product..."
                />
              </Paper>
              {formik.touched.description && formik.errors.description && (
                <FormHelperText error sx={{ ml: 2, mt: 1 }}>
                  {formik.errors.description}
                </FormHelperText>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="purchaseDate"
                name="purchaseDate"
                label="Purchase Date"
                type="date"
                value={formik.values.purchaseDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.purchaseDate &&
                  Boolean(formik.errors.purchaseDate)
                }
                helperText={
                  formik.touched.purchaseDate && formik.errors.purchaseDate
                }
                InputLabelProps={{ shrink: true }} />

            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                id="warrantyPeriod"
                name="warrantyPeriod"
                label="Warranty Period (months)"
                type="number"
                value={formik.values.warrantyPeriod}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.warrantyPeriod &&
                  Boolean(formik.errors.warrantyPeriod)
                }
                helperText={
                  formik.touched.warrantyPeriod && formik.errors.warrantyPeriod
                } />

            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="category"
                name="category"
                select
                label="Category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.category && Boolean(formik.errors.category)
                }
                helperText={formik.touched.category && formik.errors.category}>

                {categories.map((category) =>
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Product Image / Receipt
              </Typography>

              {previewUrl ?
                <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
                  <img src={previewUrl} alt="Product Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '12px', border: '1px solid #e0e0e0' }} />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': { bgcolor: 'error.light', color: 'white' }
                    }}
                    onClick={handleDeleteDocument}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                :
                <Box sx={{ mb: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ p: 4, width: '100%', borderStyle: 'dashed', borderRadius: 2 }}
                    color="primary"
                  >
                    Click to Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange} />
                  </Button>
                </Box>
              }

              <FormHelperText>
                Upload a clear photo of your product or purchase receipt.
              </FormHelperText>
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/products')}
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
                      'Update Product' :

                      'Add Product'
                  }
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>);

};

export default ProductForm;