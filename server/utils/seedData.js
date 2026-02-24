const Category = require('../models/Category');

// Seed default categories
const seedDefaultCategories = async () => {
  try {
    // Check if default categories already exist
    const existingDefaults = await Category.countDocuments({ isDefault: true });
    
    if (existingDefaults > 0) {
      console.log('Default categories already exist');
      return { success: true, message: 'Default categories already exist' };
    }

    // Define default categories
    const defaultCategories = [
      { name: 'Appliance', description: 'Kitchen and home appliances', isDefault: true },
      { name: 'Electronics', description: 'Computers, phones, and other electronic devices', isDefault: true },
      { name: 'Vehicle', description: 'Cars, motorcycles, and other vehicles', isDefault: true },
      { name: 'Furniture', description: 'Home and office furniture', isDefault: true },
      { name: 'Others', description: 'Miscellaneous items', isDefault: true }
    ];

    // Insert default categories
    await Category.insertMany(defaultCategories);
    console.log('Default categories seeded successfully');
    
    return { success: true, message: 'Default categories seeded successfully' };
  } catch (error) {
    console.error('Error seeding default categories:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  seedDefaultCategories
};