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
  TablePagination } from
'@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon } from
'@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { servicesAPI } from '../services/api';

import { format } from 'date-fns';

const Services = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalServices, setTotalServices] = useState(0);

  useEffect(() => {
    fetchServices();
  }, [productId, page, rowsPerPage]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      let response;
      if (productId) {
        response = await servicesAPI.getByProduct(productId, page + 1, rowsPerPage);
      } else {
        response = await servicesAPI.getAll(page + 1, rowsPerPage);
      }
      setServices(response.data.data);
      setTotalServices(response.data.pagination.total);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    if (productId) {
      navigate(`/services/add?productId=${productId}`);
    } else {
      navigate('/services/add');
    }
  };

  const handleEditService = (id) => {
    navigate(`/services/edit/${id}`);
  };

  const handleDeleteClick = (id) => {
    setServiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;

    try {
      setDeleteLoading(true);
      await servicesAPI.delete(serviceToDelete);
      setServices(services.filter((service) => service._id !== serviceToDelete));
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const getServiceDueStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'due':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleExportCsv = async () => {
    try {
      let response;
      // Fetch all services, bypassing pagination limit
      if (productId) {
        response = await servicesAPI.getByProduct(productId, 1, 10000);
      } else {
        response = await servicesAPI.getAll(1, 10000);
      }

      const allServices = response.data.data;

      if (!allServices || allServices.length === 0) {
        return;
      }

      // Prepare CSV headers
      const headers = ['Product Name', 'Service Date', 'Service Center', 'Cost', 'Next Service Due', 'Status'];

      // Prepare CSV rows
      const rows = allServices.map((s) => [
      `"${s.product?.name || 'Unknown'}"`,
      `"${format(new Date(s.serviceDate), 'yyyy-MM-dd')}"`,
      `"${s.serviceCenter || ''}"`,
      `"${s.cost || 0}"`,
      `"${s.nextServiceDueDate ? format(new Date(s.nextServiceDueDate), 'yyyy-MM-dd') : 'N/A'}"`,
      `"${s.serviceDueStatus || ''}"`]
      );

      // Combine headers and rows
      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `services_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export CSV. Please try again.');
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
        <Typography variant="h4">
          {productId ? 'Product Service History' : 'All Services'}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCsv}
            sx={{ mr: 2 }}
            disabled={services.length === 0}>
            
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddService}>
            
            Add Service
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {services.length === 0 ?
      <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No service records found. Click "Add Service" to create your first service record.
          </Typography>
        </Paper> :

      <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Service Date</TableCell>
                <TableCell>Service Center</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Next Service Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) =>
            <TableRow key={service._id}>
                  <TableCell>
                    {typeof service.product === 'object' ?
                service.product.name :
                'Unknown'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(service.serviceDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{service.serviceCenter}</TableCell>
                  <TableCell>${service.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    {service.nextServiceDueDate ?
                format(new Date(service.nextServiceDueDate), 'MMM dd, yyyy') :
                'N/A'}
                  </TableCell>
                  <TableCell>
                    {service.serviceDueStatus && service.serviceDueStatus !== 'none' ?
                <Chip
                  label={service.serviceDueStatus}
                  color={getServiceDueStatusColor(
                    service.serviceDueStatus
                  )}
                  size="small" /> :


                'N/A'
                }
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                  color="primary"
                  onClick={() => handleEditService(service._id)}
                  title="Edit Service">
                  
                      <EditIcon />
                    </IconButton>
                    <IconButton
                  color="error"
                  onClick={() => handleDeleteClick(service._id)}
                  title="Delete Service">
                  
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
          <TablePagination
          component="div"
          count={totalServices}
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
            Are you sure you want to delete this service record? This action cannot be
            undone.
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
    </Container>);

};

export default Services;