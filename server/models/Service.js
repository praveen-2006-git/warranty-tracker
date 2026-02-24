const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  serviceDate: {
    type: Date,
    required: true
  },
  serviceCenter: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  nextServiceDueDate: {
    type: Date
  },
  documents: [{
    name: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
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
  }
});

// Add Indexes for performance
ServiceSchema.index({ user: 1 });
ServiceSchema.index({ product: 1 });
ServiceSchema.index({ nextServiceDueDate: 1 });
ServiceSchema.index({ serviceDate: -1 });

// Virtual for service due status
ServiceSchema.virtual('serviceDueStatus').get(function () {
  if (!this.nextServiceDueDate) return null;

  const today = new Date();
  const daysLeft = Math.ceil((this.nextServiceDueDate - today) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return 'overdue'; // 🔴 Overdue
  } else if (daysLeft <= 30) {
    return 'upcoming'; // 🟡 Upcoming Soon
  } else {
    return 'scheduled'; // 🟢 Scheduled
  }
});

// Ensure virtuals are included when converting to JSON
ServiceSchema.set('toJSON', { virtuals: true });
ServiceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Service', ServiceSchema);