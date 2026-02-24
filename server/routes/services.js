const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Service = require('../models/Service');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/services';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed'));
    }
  }
});

// @route   GET /api/services
// @desc    Get all services (optionally filtered by product)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = { user: req.user._id };

    // Filter by product if provided
    if (req.query.product) {
      query.product = req.query.product;
    }

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Set up sorting
    let sortOption = {};
    if (req.query.sort) {
      const [field, order] = req.query.sort.split(':');
      sortOption[field] = order === 'desc' ? -1 : 1;
    } else {
      // Default sort by service date (newest first)
      sortOption = { serviceDate: -1 };
    }

    // Execute queries concurrently
    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('product', 'name category')
        .sort(sortOption)
        .skip(startIndex)
        .limit(limit)
        .lean(),
      Service.countDocuments(query)
    ]);

    res.json({
      data: services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get services error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/services
// @desc    Create a new service record
// @access  Private
router.post('/', protect, upload.array('documents', 5), async (req, res) => {
  try {
    const {
      product,
      serviceDate,
      serviceCenter,
      cost,
      description,
      nextServiceDueDate,
      notes
    } = req.body;

    // Check if product exists and belongs to user
    const productExists = await Product.findOne({
      _id: product,
      user: req.user._id
    });

    if (!productExists) {
      return res.status(400).json({ message: 'Invalid product' });
    }

    // Process uploaded files
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        documents.push({
          name: file.originalname,
          path: file.path
        });
      });
    }

    // Create service record
    const service = await Service.create({
      product,
      serviceDate,
      serviceCenter,
      cost: cost || 0,
      description,
      nextServiceDueDate: nextServiceDueDate || null,
      documents,
      notes,
      user: req.user._id
    });

    // Populate product for response
    await service.populate('product', 'name category');

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/services/:id
// @desc    Get service by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('product', 'name category');

    if (!service) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    // Check if user owns this service record
    if (service.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this service record' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service record
// @access  Private
router.put('/:id', protect, upload.array('documents', 5), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    // Check if user owns this service record
    if (service.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this service record' });
    }

    // Check if product exists and belongs to user if provided
    if (req.body.product) {
      const productExists = await Product.findOne({
        _id: req.body.product,
        user: req.user._id
      });

      if (!productExists) {
        return res.status(400).json({ message: 'Invalid product' });
      }
    }

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        service.documents.push({
          name: file.originalname,
          path: file.path
        });
      });
    }

    // Update fields if provided
    const fieldsToUpdate = [
      'product', 'serviceDate', 'serviceCenter', 'cost',
      'description', 'nextServiceDueDate', 'notes'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    const updatedService = await service.save();
    await updatedService.populate('product', 'name category');

    res.json(updatedService);
  } catch (error) {
    console.error('Update service error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service record
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    // Check if user owns this service record
    if (service.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this service record' });
    }

    // Delete associated documents from filesystem
    if (service.documents && service.documents.length > 0) {
      service.documents.forEach(doc => {
        if (fs.existsSync(doc.path)) {
          fs.unlinkSync(doc.path);
        }
      });
    }

    await service.deleteOne();
    res.json({ message: 'Service record removed' });
  } catch (error) {
    console.error('Delete service error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/services/:id/documents/:documentId
// @desc    Delete a document from a service record
// @access  Private
router.delete('/:id/documents/:documentId', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service record not found' });
    }

    // Check if user owns this service record
    if (service.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this service record' });
    }

    // Find the document
    const document = service.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Remove document from service
    service.documents.pull(req.params.documentId);
    await service.save();

    res.json({ message: 'Document removed', service });
  } catch (error) {
    console.error('Delete document error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/services/upcoming/due
// @desc    Get upcoming service due dates
// @access  Private
router.get('/upcoming/due', protect, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Find upcoming and overdue services concurrently
    const upcomingPromise = Service.find({
      user: req.user._id,
      nextServiceDueDate: { $gte: today, $lte: thirtyDaysFromNow }
    }).populate({
      path: 'product',
      select: 'name category',
      populate: {
        path: 'category',
        select: 'name'
      }
    }).sort({ nextServiceDueDate: 1 }).lean();

    const overduePromise = Service.find({
      user: req.user._id,
      nextServiceDueDate: { $lt: today }
    }).populate({
      path: 'product',
      select: 'name category',
      populate: {
        path: 'category',
        select: 'name'
      }
    }).sort({ nextServiceDueDate: 1 }).lean();

    const [upcomingServices, overdueServices] = await Promise.all([upcomingPromise, overduePromise]);

    res.json({
      upcoming: upcomingServices,
      overdue: overdueServices
    });
  } catch (error) {
    console.error('Upcoming services error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;