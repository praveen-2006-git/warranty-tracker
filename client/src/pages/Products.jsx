import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from
  '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  InfoOutlined as InfoIcon
} from
  '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import api from '../services/api';

import { format } from 'date-fns';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // Info Dialog States
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset to page 0 when filters change, except when page/rowsPerPage change directly
    fetchProducts();
  }, [page, rowsPerPage, selectedCategory, warrantyStatus]);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (page !== 0) {
        setPage(0); // This will trigger the other useEffect
      } else {
        fetchProducts(); // Trigger fetch directly if already on page 0
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll(page + 1, rowsPerPage, searchQuery, selectedCategory, warrantyStatus);
      setProducts(response.data.data);
      setTotalProducts(response.data.pagination.total);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleEditProduct = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleViewServices = (id) => {
    navigate(`/services/product/${id}`);
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleteLoading(true);
      await productsAPI.delete(productToDelete);
      setProducts(products.filter((product) => product._id !== productToDelete));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleOpenInfo = (product) => {
    setSelectedProductInfo(product);
    setInfoDialogOpen(true);
  };

  const handleCloseInfo = () => {
    setInfoDialogOpen(false);
    setSelectedProductInfo(null);
  };

  const getWarrantyStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'expiring':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleExportCsv = async () => {
    try {
      // Stream the document blob directly from our new Node backend
      const response = await api.get('/products/export/csv', { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('CSV Export failed:', err);
      setError('Failed to export CSV. Please try again.');
    }
  };

  const handleExportPdf = async () => {
    try {
      // Stream the document blob directly from our new Node backend
      const response = await api.get('/products/export/pdf', { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PDF Export failed:', err);
      setError('Failed to export PDF. Please try again.');
    }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<PdfIcon />}
            onClick={handleExportPdf}
            sx={{ mr: 2 }}
            disabled={products.length === 0}>
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCsv}
            sx={{ mr: 2 }}
            disabled={products.length === 0}>

            Export CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}>

            Add Product
          </Button>
        </Box>
      </Box>

      {/* Search and Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Search products..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />

          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}>

                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {categories.map((category) =>
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Warranty Status</InputLabel>
              <Select
                value={warrantyStatus}
                label="Warranty Status"
                onChange={(e) => setWarrantyStatus(e.target.value)}>

                <MenuItem value="">
                  <em>All Statuses</em>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expiring">Expiring Soon</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {products.length === 0 ?
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No products found. Click "Add Product" to create your first product.
          </Typography>
        </Paper> :

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="60px"></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Warranty Expiry</TableCell>
                <TableCell>Warranty Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) =>
                <TableRow key={product._id}>
                  <TableCell>
                    {product.imageUrl ? (
                      <Box
                        component="img"
                        src={`http://localhost:5000${product.imageUrl}`}
                        alt={product.name}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          objectFit: 'cover',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <BuildIcon sx={{ color: 'grey.400' }} />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                  <TableCell>
                    {typeof product.category === 'object' ?
                      product.category.name :
                      'Unknown'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(product.purchaseDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(product.warrantyExpiryDate),
                      'MMM dd, yyyy'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.warrantyStatus || 'Unknown'}
                      color={getWarrantyStatusColor(
                        product.warrantyStatus
                      )}
                      size="small" />

                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="info"
                      onClick={() => handleOpenInfo(product)}
                      title="View Details">
                      <InfoIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewServices(product._id)}
                      title="View Services">

                      <BuildIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditProduct(product._id)}
                      title="Edit Product">

                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(product._id)}
                      title="Delete Product">

                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalProducts}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }} />

        </TableContainer>
      }

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">

        <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this product? This action cannot be
            undone and will also delete all associated service records.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={deleteLoading}>

            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={handleCloseInfo}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProductInfo?.name} - Details
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Description / Notes:
          </Typography>
          {selectedProductInfo?.description ? (
            <Box
              sx={{
                fontFamily: 'Inter, sans-serif',
                '& ul, & ol': { pl: 2, m: 0 },
                '& p': { m: 0, mb: 1 }
              }}
              dangerouslySetInnerHTML={{ __html: selectedProductInfo.description }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No description provided.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInfo}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>);

};

export default Products;