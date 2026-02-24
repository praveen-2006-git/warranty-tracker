const cron = require('node-cron');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendEmail, generateWarrantyWarningHTML } = require('../utils/emailService');

const startNotificationJobs = () => {
    // Option: Run daily at 8:00 AM server time
    // '0 8 * * *'
    // For testing, let's run it every minute to verify functionality, 
    // but in production change it to daily. We'll use a daily format for now.

    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily warranty expiration check...');

        try {
            // 1. Calculate the date exactly 7 days from now
            const targetDateStart = new Date();
            targetDateStart.setDate(targetDateStart.getDate() + 7);
            targetDateStart.setHours(0, 0, 0, 0);

            const targetDateEnd = new Date(targetDateStart);
            targetDateEnd.setHours(23, 59, 59, 999);

            // 2. Query products whose warranty expires within that target window
            const expiringProducts = await Product.find({
                warrantyExpiry: {
                    $gte: targetDateStart,
                    $lte: targetDateEnd
                }
            }).populate('user', 'name email notificationsEnabled');

            if (!expiringProducts || expiringProducts.length === 0) {
                console.log('No warranties expiring in exactly 7 days. Job complete.');
                return;
            }

            console.log(`Found ${expiringProducts.length} product(s) expiring soon. Processing...`);

            // 3. Process each dispatch queue
            let emailsSent = 0;
            for (const product of expiringProducts) {
                const user = product.user;

                // Ensure user exists and has a valid email 
                // Note: For this to work in production, add a 'notificationsEnabled' boolean to User schema, defaulting to true
                if (user && user.email) {
                    const htmlContent = generateWarrantyWarningHTML(user.name, product.name, 7);
                    const success = await sendEmail(
                        user.email,
                        `ACTION REQUIRED: ${product.name} Warranty Expiring`,
                        htmlContent
                    );

                    if (success) emailsSent++;
                }
            }

            console.log(`Daily check complete. Sent ${emailsSent} warning emails.`);
        } catch (error) {
            console.error('Error during daily notification cron job:', error);
        }
    });

    console.log('Notification Cron Jobs Initialized (Scheduled daily at 8:00 AM).');
};

module.exports = { startNotificationJobs };
