const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  warrantyPeriod: {
    type: Number, // in months
    required: true
  },
  warrantyExpiryDate: {
    type: Date,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  purchasePrice: {
    type: Number
  },
  seller: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  documents: [{
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    documentType: {
      type: String,
      enum: ['receipt', 'warranty', 'manual', 'other'],
      default: 'other'
    }
  }],
  notes: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add Indexes for performance
ProductSchema.index({ user: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ warrantyExpiryDate: 1 });
ProductSchema.index({ purchaseDate: -1 });

// Virtual for warranty status
ProductSchema.virtual('warrantyStatus').get(function () {
  const today = new Date();
  const daysLeft = Math.ceil((this.warrantyExpiryDate - today) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return 'expired'; // 🔴 Expired
  } else if (daysLeft <= 30) {
    return 'expiring'; // 🟡 Expiring Soon
  } else {
    return 'active'; // 🟢 Active
  }
});

// Set the warrantyExpiryDate based on purchaseDate and warrantyPeriod BEFORE validation
ProductSchema.pre('validate', function (next) {
  if (this.purchaseDate && this.warrantyPeriod !== undefined) {
    const expiryDate = new Date(this.purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + this.warrantyPeriod);
    this.warrantyExpiryDate = expiryDate;
  }
  next();
});

ProductSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isModified('description') ||
    this.isModified('purchaseDate') || this.isModified('warrantyPeriod') ||
    this.isModified('category') || this.isModified('purchasePrice') ||
    this.isModified('seller') || this.isModified('model') ||
    this.isModified('serialNumber') || this.isModified('notes')) {
    this.updatedAt = Date.now();
  }

  next();
});

// Ensure virtuals are included when converting to JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);