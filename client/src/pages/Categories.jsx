import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid } from
'@mui/material';
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  Category as CategoryIcon } from
'@mui/icons-material';
import { categoriesAPI } from '../services/api';


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setSubmitting(true);
    try {
      await categoriesAPI.create({
        name: newCategoryName,
        description: newCategoryDesc
      });
      setOpenDialog(false);
      setNewCategoryName('');
      setNewCategoryDesc('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setSubmitting(true);
    try {
      await categoriesAPI.delete(categoryToDelete._id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>);

  }

  // Workaround for TypeScript error with Grid item prop
  const GridComponent = Grid;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={800} color="primary.main">
                    Categories
                </Typography>
                <Button
          variant="contained"
          disabled={loading}
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2 }}>
          
                    New Category
                </Button>
            </Box>

            {error &&
      <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
      }

            <GridComponent container spacing={3}>
                {categories.map((category) =>
        <GridComponent item xs={12} sm={6} md={4} key={category._id}>
                        <Card
            elevation={1}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'visible' // Allows chips to sit on borders if needed
            }}>
            
                            <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: category.isDefault ? 'primary.light' : 'secondary.light',
                      color: 'white',
                      display: 'flex'
                    }}>
                    
                                            <CategoryIcon />
                                        </Box>
                                        <Typography variant="h6" fontWeight={700}>
                                            {category.name}
                                        </Typography>
                                    </Box>
                                    {category.isDefault &&
                <Chip size="small" label="System Default" color="primary" variant="outlined" />
                }
                                    {!category.isDefault &&
                <Chip size="small" label="Custom" color="secondary" variant="outlined" />
                }
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {category.description || 'No description provided.'}
                                </Typography>
                            </CardContent>
                            {!category.isDefault &&
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                    <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteClick(category)}>
                
                                        Delete
                                    </Button>
                                </CardActions>
            }
                        </Card>
                    </GridComponent>
        )}
                {categories.length === 0 && !loading &&
        <GridComponent item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                No categories found. Start by creating a new category!
                            </Typography>
                        </Paper>
                    </GridComponent>
        }
            </GridComponent>

            {/* Create Category Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Create New Category</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required />
            
                        <TextField
              margin="dense"
              id="description"
              label="Description (Optional)"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)} />
            
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
                    <Button
            onClick={handleCreateCategory}
            variant="contained"
            disabled={!newCategoryName.trim() || submitting}>
            
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Delete Category?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the category "{categoryToDelete?.name}"?
                        This action cannot be undone. Products currently using this category will still retain the
                        category ID but may not display the category name correctly.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={submitting}>
            
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>);

};

export default Categories;