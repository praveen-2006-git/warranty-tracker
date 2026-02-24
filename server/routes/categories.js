const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories (default + user's custom)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get default categories and user's custom categories
    const categories = await Category.find({
      $or: [
        { isDefault: true },
        { user: req.user._id }
      ]
    }).sort({ name: 1 });
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if category with same name already exists
    const categoryExists = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      $or: [
        { isDefault: true },
        { user: req.user._id }
      ]
    });

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create new category
    const category = await Category.create({
      name,
      description,
      isDefault: false,
      user: req.user._id
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if user has access to this category
    if (!category.isDefault && category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this category' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Cannot update default categories
    if (category.isDefault) {
      return res.status(403).json({ message: 'Cannot modify default categories' });
    }

    // Check if user owns this category
    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this category' });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id },
        $or: [
          { isDefault: true },
          { user: req.user._id }
        ]
      });

      if (categoryExists) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    // Update category
    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Cannot delete default categories
    if (category.isDefault) {
      return res.status(403).json({ message: 'Cannot delete default categories' });
    }

    // Check if user owns this category
    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this category' });
    }

    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/categories/seed/defaults
// @desc    Seed default categories
// @access  Private (admin only in production)
router.get('/seed/defaults', async (req, res) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not authorized in production' });
    }

    const defaultCategories = [
      { name: 'Appliance', description: 'Kitchen and home appliances', isDefault: true },
      { name: 'Electronics', description: 'Computers, phones, and other electronic devices', isDefault: true },
      { name: 'Vehicle', description: 'Cars, motorcycles, and other vehicles', isDefault: true },
      { name: 'Furniture', description: 'Home and office furniture', isDefault: true },
      { name: 'Others', description: 'Miscellaneous items', isDefault: true }
    ];

    // Clear existing default categories
    await Category.deleteMany({ isDefault: true });

    // Insert new default categories
    const categories = await Category.insertMany(defaultCategories);

    res.status(201).json(categories);
  } catch (error) {
    console.error('Seed categories error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;