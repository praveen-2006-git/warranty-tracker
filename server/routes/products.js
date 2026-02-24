const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// @route   GET /api/products
// @desc    Get all user's products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, status, sort } = req.query;
    const query = { user: req.user._id };

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Filter by search term if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by warranty status if provided
    if (status) {
      const today = new Date();

      if (status === 'active') {
        // More than 30 days left
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        query.warrantyExpiryDate = { $gt: thirtyDaysFromNow };
      } else if (status === 'expiring') {
        // Less than 30 days left but not expired
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        query.warrantyExpiryDate = { $lte: thirtyDaysFromNow, $gt: today };
      } else if (status === 'expired') {
        // Already expired
        query.warrantyExpiryDate = { $lte: today };
      }
    }

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Set up sorting
    let sortOption = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortOption[field] = order === 'desc' ? -1 : 1;
    } else {
      // Default sort by creation date (newest first)
      sortOption = { createdAt: -1 };
    }

    // Execute queries concurrently
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort(sortOption)
        .skip(startIndex)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/export/csv
// @desc    Download all products as a CSV file
// @access  Private
router.get('/export/csv', protect, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id })
      .populate('category', 'name')
      .lean();

    const formattedData = products.map((product) => ({
      'Name': product.name,
      'Category': product.category ? product.category.name : 'Unknown',
      'Purchase Date': new Date(product.purchaseDate).toLocaleDateString(),
      'Warranty Expiry': new Date(product.warrantyExpiryDate).toLocaleDateString(),
      'Purchase Price': product.purchasePrice || 'N/A',
      'Seller': product.seller || 'N/A',
      'Serial Number': product.serialNumber || 'N/A',
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(formattedData);

    res.header('Content-Type', 'text/csv');
    res.attachment('products_export.csv');
    return res.send(csv);
  } catch (error) {
    console.error('CSV Export Error:', error.message);
    res.status(500).json({ message: 'Failed to generate CSV' });
  }
});

// @route   GET /api/products/export/pdf
// @desc    Download all products as a formatted PDF file
// @access  Private
router.get('/export/pdf', protect, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id })
      .populate('category', 'name')
      .lean();

    const doc = new PDFDocument({ margin: 50 });
    const filename = `products_export_${Date.now()}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Document Header
    doc.fontSize(20).text('Warranty Tracker Inventory Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    if (products.length === 0) {
      doc.fontSize(14).text('No products found in inventory.', { align: 'center' });
    } else {
      products.forEach((product, i) => {
        doc.fontSize(14).fillColor('#4F46E5').text(`${product.name}`);
        doc.fontSize(10).fillColor('#000000');
        doc.text(`Category: ${product.category ? product.category.name : 'Unknown'}`);
        doc.text(`Purchase Date: ${new Date(product.purchaseDate).toLocaleDateString()}`);
        doc.text(`Warranty Expiry: ${new Date(product.warrantyExpiryDate).toLocaleDateString()}`);
        if (product.purchasePrice) doc.text(`Price: $${product.purchasePrice}`);
        if (product.serialNumber) doc.text(`Serial Number: ${product.serialNumber}`);
        doc.moveDown();
      });
    }

    doc.end();
  } catch (error) {
    console.error('PDF Export Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF document' });
    }
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      description,
      purchaseDate,
      warrantyPeriod,
      category,
      purchasePrice,
      seller,
      model,
      serialNumber,
      notes
    } = req.body;

    // Check if category exists
    const categoryExists = await Category.findOne({
      _id: category,
      $or: [
        { isDefault: true },
        { user: req.user._id }
      ]
    });

    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Process uploaded file
    let imageUrl = null;
    if (req.file) {
      // Create a relative web path that Express can serve statically
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      purchaseDate,
      warrantyPeriod,
      category,
      purchasePrice,
      seller,
      model,
      serialNumber,
      imageUrl,
      notes,
      user: req.user._id
    });

    // Populate category for response
    await product.populate('category', 'name');

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this product' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Check if category exists if provided
    if (req.body.category) {
      const categoryExists = await Category.findOne({
        _id: req.body.category,
        $or: [
          { isDefault: true },
          { user: req.user._id }
        ]
      });

      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // Process uploaded file
    if (req.file) {
      // If there's an old image, maybe delete it later, but let's just overwrite the URL for now
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Update fields if provided
    const fieldsToUpdate = [
      'name', 'description', 'purchaseDate', 'warrantyPeriod',
      'category', 'purchasePrice', 'seller', 'model', 'serialNumber', 'notes'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    await updatedProduct.populate('category', 'name');

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete associated image from filesystem if it exists
    if (product.imageUrl) {
      try {
        const absolutePath = path.join(__dirname, '..', product.imageUrl);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      } catch (err) {
        console.error('Failed to clear static image artifact:', err);
      }
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/products/:id/documents/:documentId
// @desc    Delete a document from a product
// @access  Private
router.delete('/:id/documents/:documentId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this product' });
    }

    // Find the document
    const document = product.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Remove document from product
    product.documents.pull(req.params.documentId);
    await product.save();

    res.json({ message: 'Document removed', product });
  } catch (error) {
    console.error('Delete document error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Execute multiple queries concurrently for better performance
    const countPromise = Product.countDocuments({ user: req.user._id });

    const categoryAggPromise = Product.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const expiringPromise = Product.find({
      user: req.user._id,
      warrantyExpiryDate: { $gt: today, $lte: thirtyDaysFromNow }
    }).populate('category', 'name').sort({ warrantyExpiryDate: 1 }).lean();

    const activePromise = Product.countDocuments({
      user: req.user._id,
      warrantyExpiryDate: { $gt: thirtyDaysFromNow }
    });

    const expiredPromise = Product.countDocuments({
      user: req.user._id,
      warrantyExpiryDate: { $lte: today }
    });

    const [
      totalProducts,
      productsByCategory,
      expiringWarranties,
      activeCount,
      expiredCount
    ] = await Promise.all([
      countPromise,
      categoryAggPromise,
      expiringPromise,
      activePromise,
      expiredPromise
    ]);

    // Populate category names
    const categoryIds = productsByCategory.map(item => item._id);
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();

    const productsByCategoryWithNames = productsByCategory.map(item => {
      const category = categories.find(cat => cat._id.toString() === item._id.toString());
      return {
        category: category ? category.name : 'Unknown',
        categoryId: item._id,
        count: item.count
      };
    });

    // Warranty status counts
    const warrantyStatusCounts = {
      active: activeCount,
      expiring: expiringWarranties.length,
      expired: expiredCount
    };

    res.json({
      totalProducts,
      productsByCategory: productsByCategoryWithNames,
      expiringWarranties,
      warrantyStatusCounts
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;