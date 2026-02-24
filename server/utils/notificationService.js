const User = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const { sendWarrantyExpirationEmail, sendServiceDueEmail } = require('./emailService');

// Check for warranties expiring soon and send notifications
const checkWarrantyExpirations = async () => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Find products with warranties expiring in the next 30 days
    const expiringProducts = await Product.find({
      warrantyExpiryDate: { $gt: today, $lte: thirtyDaysFromNow }
    }).populate('user').populate('category');

    console.log(`Found ${expiringProducts.length} products with warranties expiring soon`);

    // Send notifications for each product
    for (const product of expiringProducts) {
      const user = product.user;
      
      // Check if user has enabled warranty expiration notifications
      if (user.notificationPreferences.email.enabled && 
          user.notificationPreferences.email.warrantyExpiration) {
        await sendWarrantyExpirationEmail(user, product);
      }

      // App notifications would be implemented here
      // This would typically involve saving notifications to a database
      // that the frontend would then query
    }

    return { success: true, count: expiringProducts.length };
  } catch (error) {
    console.error('Error checking warranty expirations:', error);
    return { success: false, error: error.message };
  }
};

// Check for services due soon and send notifications
const checkServicesDue = async () => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Find services due in the next 30 days
    const upcomingServices = await Service.find({
      nextServiceDueDate: { $gt: today, $lte: thirtyDaysFromNow }
    }).populate('user').populate({
      path: 'product',
      populate: {
        path: 'category'
      }
    });

    console.log(`Found ${upcomingServices.length} services due soon`);

    // Send notifications for each service
    for (const service of upcomingServices) {
      const user = service.user;
      
      // Check if user has enabled service due notifications
      if (user.notificationPreferences.email.enabled && 
          user.notificationPreferences.email.serviceDue) {
        await sendServiceDueEmail(user, service.product, service);
      }

      // App notifications would be implemented here
    }

    return { success: true, count: upcomingServices.length };
  } catch (error) {
    console.error('Error checking services due:', error);
    return { success: false, error: error.message };
  }
};

// Schedule notification checks (to be called when server starts)
const scheduleNotifications = () => {
  // Check once a day (at midnight)
  const checkInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  // Initial check
  checkWarrantyExpirations();
  checkServicesDue();
  
  // Schedule recurring checks
  setInterval(() => {
    checkWarrantyExpirations();
    checkServicesDue();
  }, checkInterval);

  console.log('Notification checks scheduled');
};

module.exports = {
  checkWarrantyExpirations,
  checkServicesDue,
  scheduleNotifications
};